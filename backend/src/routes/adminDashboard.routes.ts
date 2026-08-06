import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { errorResponse, successResponse } from '../utils/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { isGeoDatabaseAvailable } from '../utils/geoLookup';

const router = Router();

const DASHBOARD_TIMEZONE = 'America/Chicago';
const ACTIVE_SESSION_WINDOW_MINUTES = 30;
const TELEMETRY_STALE_HOURS = 24;

// How far ahead (in ms) `timeZone`'s wall clock is vs UTC, evaluated at
// `date` - so it reflects whichever DST offset is in effect then.
function getZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return asUTC - date.getTime();
}

// Midnight, `daysAgo` days back, in DASHBOARD_TIMEZONE's local time - returned
// as the correct UTC instant. Known limitation: can be off by up to ~1 hour
// only during the handful of days spanning an actual DST transition (twice a
// year) - not worth a timezone library to close that narrow a gap.
function startOfLocalDayUTC(daysAgo: number): Date {
  const now = new Date();
  const offsetMs = getZoneOffsetMs(now, DASHBOARD_TIMEZONE);
  const zonedNow = new Date(now.getTime() + offsetMs);
  const truncated = new Date(
    Date.UTC(zonedNow.getUTCFullYear(), zonedNow.getUTCMonth(), zonedNow.getUTCDate() - daysAgo, 0, 0, 0),
  );
  return new Date(truncated.getTime() - offsetMs);
}

router.get('/stats', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const todayStart = startOfLocalDayUTC(0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeSince = new Date(Date.now() - ACTIVE_SESSION_WINDOW_MINUTES * 60 * 1000);

    const [visitorsTodayGroups, visitorsWeekGroups, returningVisitorGroups, activeSessions, totalPageViews, totalEvents, totalLeads, newLeads] =
      await Promise.all([
        prisma.session.groupBy({ by: ['visitorId'], where: { startedAt: { gte: todayStart } } }),
        prisma.session.groupBy({ by: ['visitorId'], where: { startedAt: { gte: weekStart } } }),
        prisma.session.groupBy({
          by: ['visitorId'],
          _count: { visitorId: true },
          having: { visitorId: { _count: { gt: 1 } } },
        }),
        prisma.session.count({ where: { endedAt: null, startedAt: { gte: activeSince } } }),
        prisma.pageView.count(),
        prisma.event.count(),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: 'NEW' } }),
      ]);

    res.json(
      successResponse(
        {
          visitorsToday: visitorsTodayGroups.length,
          visitorsThisWeek: visitorsWeekGroups.length,
          returningVisitors: returningVisitorGroups.length,
          activeSessions,
          totalPageViews,
          totalEvents,
          totalLeads,
          newLeads,
        },
        'Dashboard stats fetched',
      ),
    );
  } catch (error) {
    next(error);
  }
});

const insightsQuerySchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
});

const TOP_PAGES_LIMIT = 6;

async function computeRangeVisitorStats(dateFrom: Date, dateTo: Date) {
  const [visitors, visitorGroupsInRange] = await Promise.all([
    prisma.session.count({ where: { startedAt: { gte: dateFrom, lte: dateTo } } }),
    prisma.session.groupBy({ by: ['visitorId'], where: { startedAt: { gte: dateFrom, lte: dateTo } } }),
  ]);

  const visitorIdsInRange = visitorGroupsInRange.map((group) => group.visitorId);
  const uniqueVisitors = visitorIdsInRange.length;

  // "New" = their very first-ever session (Visitor.createdAt) falls inside
  // this range. "Returning" is everyone else who visited in range.
  const newVisitors = visitorIdsInRange.length
    ? await prisma.visitor.count({
        where: { id: { in: visitorIdsInRange }, createdAt: { gte: dateFrom, lte: dateTo } },
      })
    : 0;
  const returningVisitors = uniqueVisitors - newVisitors;

  return { visitors, uniqueVisitors, newVisitors, returningVisitors };
}

// Powers the Insights tab: everything scoped to a caller-chosen date range,
// unlike /stats above which only covers fixed windows (today/this week/all-time).
router.get('/insights', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = insightsQuerySchema.parse(req.query);

    // "Prior period" = the same length of time immediately before dateFrom -
    // what the KPI deltas (this dashboard's "vs prior period") compare against.
    const rangeMs = dateTo.getTime() - dateFrom.getTime();
    const previousDateTo = new Date(dateFrom.getTime() - 1);
    const previousDateFrom = new Date(dateFrom.getTime() - rangeMs);

    const [current, previous, topPageGroups] = await Promise.all([
      computeRangeVisitorStats(dateFrom, dateTo),
      computeRangeVisitorStats(previousDateFrom, previousDateTo),
      prisma.pageView.groupBy({
        by: ['page'],
        where: { timestamp: { gte: dateFrom, lte: dateTo } },
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
        take: TOP_PAGES_LIMIT,
      }),
    ]);

    res.json(
      successResponse(
        {
          visitors: current.visitors,
          uniqueVisitors: current.uniqueVisitors,
          newVisitors: current.newVisitors,
          returningVisitors: current.returningVisitors,
          previousVisitors: previous.visitors,
          previousUniqueVisitors: previous.uniqueVisitors,
          previousNewVisitors: previous.newVisitors,
          previousReturningVisitors: previous.returningVisitors,
          topPages: topPageGroups.map((group) => ({ page: group.page, views: group._count.page })),
        },
        'Dashboard insights fetched',
      ),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid query parameters', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Connected.' };
  } catch {
    return { status: 'error', message: 'Unable to reach the database.' };
  }
}

async function checkTelemetryHealth() {
  try {
    const mostRecentSession = await prisma.session.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!mostRecentSession) {
      return { status: 'warning', message: 'No telemetry has been recorded yet.' };
    }

    const hoursSinceLastSession = (Date.now() - mostRecentSession.createdAt.getTime()) / (60 * 60 * 1000);

    if (hoursSinceLastSession > TELEMETRY_STALE_HOURS) {
      return {
        status: 'warning',
        message: `No telemetry recorded in the last ${TELEMETRY_STALE_HOURS} hours - this may just mean low traffic, or the tracking script may not be running.`,
      };
    }

    return { status: 'healthy', message: 'Recording recently.' };
  } catch {
    return { status: 'error', message: 'Unable to check telemetry data.' };
  }
}

async function checkGeoDatabaseHealth() {
  try {
    const available = await isGeoDatabaseAvailable();
    return available
      ? { status: 'healthy', message: 'GeoLite2 database loaded.' }
      : {
          status: 'warning',
          message: 'GeoLite2 database not installed - visitor location data is unavailable until it is downloaded (see backend/README.md).',
        };
  } catch {
    return { status: 'error', message: 'Unable to check the GeoLite2 database.' };
  }
}

router.get('/health', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const [database, telemetry, geoDatabase] = await Promise.all([
      checkDatabaseHealth(),
      checkTelemetryHealth(),
      checkGeoDatabaseHealth(),
    ]);

    res.json(
      successResponse(
        {
          backendApi: { status: 'healthy', message: 'Responding to this request.' },
          database,
          telemetry,
          geoDatabase,
        },
        'Health check complete',
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/recent-activity', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const [visitors, pageViews, events, leads] = await Promise.all([
      prisma.visitor.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, browser: true, device: true, country: true, city: true, referrer: true, createdAt: true },
      }),
      prisma.pageView.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, page: true, duration: true, visitorId: true, createdAt: true },
      }),
      prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, eventName: true, metadata: true, visitorId: true, createdAt: true },
      }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      }),
    ]);

    res.json(successResponse({ visitors, pageViews, events, leads }, 'Recent activity fetched'));
  } catch (error) {
    next(error);
  }
});

export { router as adminDashboardRouter };
