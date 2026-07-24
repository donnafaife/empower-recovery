import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../prisma/client';
import { errorResponse, successResponse } from '../utils/response';
import { guessBrowserVersion, guessOS } from '../utils/uaParse';

const router = Router();

const MAX_PAGE_SIZE = 100;
const SESSION_DETAIL_MAX_ROWS = 500;

// Matches exactly what guessBrowser()/guessDevice() (uaParse.ts) can produce,
// so a dedicated filter can never silently match zero rows due to a typo.
const BROWSER_VALUES = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other', 'unknown'] as const;
const DEVICE_VALUES = ['desktop', 'mobile', 'tablet', 'unknown'] as const;
const VISITOR_SORT_OPTIONS = ['firstSeen', 'sessionCount', 'pageViewCount', 'eventCount'] as const;
const VISITOR_TYPE_OPTIONS = ['returning', 'new'] as const;

const VISITOR_ORDER_BY: Record<(typeof VISITOR_SORT_OPTIONS)[number], Prisma.VisitorOrderByWithRelationInput> = {
  firstSeen: { createdAt: 'desc' },
  sessionCount: { sessions: { _count: 'desc' } },
  pageViewCount: { pageViews: { _count: 'desc' } },
  eventCount: { events: { _count: 'desc' } },
};

function buildVisitorWhere(params: {
  search?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  device?: string;
  dateFrom?: Date;
  dateTo?: Date;
  visitorIds?: { in?: string[]; notIn?: string[] };
}): Prisma.VisitorWhereInput {
  const where: Prisma.VisitorWhereInput = {};

  if (params.search) {
    where.OR = [
      { id: { startsWith: params.search } },
      { city: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      { country: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      { browser: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
    ];
  }
  if (params.country) where.country = params.country;
  if (params.region) where.region = params.region;
  if (params.city) where.city = params.city;
  if (params.browser) where.browser = params.browser;
  if (params.device) where.device = params.device;
  if (params.dateFrom || params.dateTo) {
    where.sessions = {
      some: {
        startedAt: {
          ...(params.dateFrom ? { gte: params.dateFrom } : {}),
          ...(params.dateTo ? { lte: params.dateTo } : {}),
        },
      },
    };
  }
  if (params.visitorIds?.in) where.id = { in: params.visitorIds.in };
  if (params.visitorIds?.notIn) where.id = { notIn: params.visitorIds.notIn };

  return where;
}

const listVisitorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(25),
  search: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  region: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  browser: z.enum(BROWSER_VALUES).optional(),
  device: z.enum(DEVICE_VALUES).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  visitorType: z.enum(VISITOR_TYPE_OPTIONS).optional(),
  sortBy: z.enum(VISITOR_SORT_OPTIONS).default('firstSeen'),
});

router.get('/visitors', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = listVisitorsQuerySchema.parse(req.query);

    // "Returning"/"new" needs the set of visitor ids with >1 session - the
    // same groupBy-with-having technique already used in
    // adminDashboard.routes.ts's /stats route, just applied as an id filter
    // here instead of just a count. Only run when this filter is requested.
    let visitorIdFilter: { in?: string[]; notIn?: string[] } | undefined;
    if (parsed.visitorType) {
      const returningGroups = await prisma.session.groupBy({
        by: ['visitorId'],
        _count: { visitorId: true },
        having: { visitorId: { _count: { gt: 1 } } },
      });
      const returningIds = returningGroups.map((group) => group.visitorId);
      visitorIdFilter = parsed.visitorType === 'returning' ? { in: returningIds } : { notIn: returningIds };
    }

    const where = buildVisitorWhere({
      search: parsed.search,
      country: parsed.country,
      region: parsed.region,
      city: parsed.city,
      browser: parsed.browser,
      device: parsed.device,
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
      visitorIds: visitorIdFilter,
    });

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        orderBy: VISITOR_ORDER_BY[parsed.sortBy],
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize,
        select: {
          id: true,
          browser: true,
          device: true,
          country: true,
          region: true,
          city: true,
          createdAt: true,
          // Relation counts compile to one efficient query, not one per row.
          _count: { select: { sessions: true, pageViews: true, events: true } },
        },
      }),
      prisma.visitor.count({ where }),
    ]);

    // "Last visit" (max session start) for just this page's visitors - one
    // supplementary query total, not one per row.
    const lastVisitRows = visitors.length
      ? await prisma.session.groupBy({
          by: ['visitorId'],
          where: { visitorId: { in: visitors.map((visitor) => visitor.id) } },
          _max: { startedAt: true },
        })
      : [];
    const lastVisitByVisitorId = new Map(lastVisitRows.map((row) => [row.visitorId, row._max.startedAt]));

    const visitorsWithLastVisit = visitors.map((visitor) => ({
      id: visitor.id,
      browser: visitor.browser,
      device: visitor.device,
      country: visitor.country,
      region: visitor.region,
      city: visitor.city,
      firstVisit: visitor.createdAt,
      lastVisit: lastVisitByVisitorId.get(visitor.id) ?? null,
      sessionCount: visitor._count.sessions,
      pageViewCount: visitor._count.pageViews,
      eventCount: visitor._count.events,
    }));

    res.json(
      successResponse(
        {
          visitors: visitorsWithLastVisit,
          pagination: {
            page: parsed.page,
            pageSize: parsed.pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
          },
        },
        'Visitors fetched successfully',
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

router.get('/visitors/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const id = req.params.id as string;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      select: {
        id: true,
        browser: true,
        device: true,
        country: true,
        region: true,
        city: true,
        timezone: true,
        latitude: true,
        longitude: true,
        referrer: true,
        createdAt: true,
        _count: { select: { sessions: true, pageViews: true, events: true } },
        // ipHash intentionally never selected - never leaves the database.
      },
    });

    if (!visitor) {
      res.status(404).json(errorResponse('Visitor not found'));
      return;
    }

    // Most recent session's userAgent - the freshest signal for OS/browser
    // version, and its startedAt is also exactly "last visit" (no separate
    // aggregate query needed).
    const lastSession = await prisma.session.findFirst({
      where: { visitorId: id },
      orderBy: { startedAt: 'desc' },
      select: { userAgent: true, startedAt: true },
    });

    res.json(
      successResponse(
        {
          visitor: {
            id: visitor.id,
            firstVisit: visitor.createdAt,
            lastVisit: lastSession?.startedAt ?? null,
            returningVisitor: visitor._count.sessions > 1,
            sessionCount: visitor._count.sessions,
            pageViewCount: visitor._count.pageViews,
            eventCount: visitor._count.events,
            referrer: visitor.referrer,
            device: {
              browser: visitor.browser,
              browserVersion: guessBrowserVersion(lastSession?.userAgent ?? undefined) ?? null,
              os: guessOS(lastSession?.userAgent ?? undefined) ?? null,
              deviceType: visitor.device,
              // Never collected (see backend README / project decision) -
              // shown explicitly rather than omitted so the UI can render a
              // clear "Not collected" state instead of looking broken.
              screenSize: null,
              language: null,
            },
            location: {
              country: visitor.country,
              region: visitor.region,
              city: visitor.city,
              timezone: visitor.timezone,
              latitude: visitor.latitude,
              longitude: visitor.longitude,
            },
          },
        },
        'Visitor fetched successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
});

const listSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(25),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

router.get(
  '/visitors/:id/sessions',
  authenticateToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  async (req, res, next) => {
    try {
      const visitorId = req.params.id as string;
      const parsed = listSessionsQuerySchema.parse(req.query);

      const visitor = await prisma.visitor.findUnique({ where: { id: visitorId }, select: { id: true, referrer: true } });
      if (!visitor) {
        res.status(404).json(errorResponse('Visitor not found'));
        return;
      }

      const where: Prisma.SessionWhereInput = {
        visitorId,
        ...(parsed.dateFrom || parsed.dateTo
          ? {
              startedAt: {
                ...(parsed.dateFrom ? { gte: parsed.dateFrom } : {}),
                ...(parsed.dateTo ? { lte: parsed.dateTo } : {}),
              },
            }
          : {}),
      };

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip: (parsed.page - 1) * parsed.pageSize,
          take: parsed.pageSize,
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            _count: { select: { pageViews: true, events: true } },
          },
        }),
        prisma.session.count({ where }),
      ]);

      // Landing/exit page for this page of sessions in one batched query
      // (not per-row) - bounded because a page of sessions on a single-page
      // site has a small number of page views each.
      const pageViews = sessions.length
        ? await prisma.pageView.findMany({
            where: { sessionId: { in: sessions.map((session) => session.id) } },
            orderBy: { timestamp: 'asc' },
            select: { sessionId: true, page: true },
          })
        : [];

      const landingPageBySession = new Map<string, string>();
      const exitPageBySession = new Map<string, string>();
      for (const pageView of pageViews) {
        if (!landingPageBySession.has(pageView.sessionId)) {
          landingPageBySession.set(pageView.sessionId, pageView.page);
        }
        exitPageBySession.set(pageView.sessionId, pageView.page); // last write wins - rows are timestamp asc
      }

      const sessionsWithDetails = sessions.map((session) => ({
        id: session.id,
        startTime: session.startedAt,
        endTime: session.endedAt,
        durationSeconds: session.endedAt
          ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
          : null,
        // The schema only ever captures one referrer per visitor (their
        // original acquisition source), not per-session - so every session
        // row shows that same value, not a distinct per-session referrer.
        referrer: visitor.referrer,
        landingPage: landingPageBySession.get(session.id) ?? null,
        exitPage: exitPageBySession.get(session.id) ?? null,
        pageViewCount: session._count.pageViews,
        eventCount: session._count.events,
      }));

      res.json(
        successResponse(
          {
            sessions: sessionsWithDetails,
            pagination: {
              page: parsed.page,
              pageSize: parsed.pageSize,
              total,
              totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
            },
          },
          'Sessions fetched successfully',
        ),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(errorResponse('Invalid query parameters', error.flatten().fieldErrors));
        return;
      }
      next(error);
    }
  },
);

router.get('/sessions/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const id = req.params.id as string;

    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        visitor: {
          select: { id: true, country: true, region: true, city: true, browser: true, device: true, referrer: true },
        },
        _count: { select: { pageViews: true, events: true } },
      },
    });

    if (!session) {
      res.status(404).json(errorResponse('Session not found'));
      return;
    }

    const [pageViews, events] = await Promise.all([
      prisma.pageView.findMany({
        where: { sessionId: id },
        orderBy: { timestamp: 'asc' },
        take: SESSION_DETAIL_MAX_ROWS,
        select: { id: true, page: true, duration: true, timestamp: true },
      }),
      prisma.event.findMany({
        where: { sessionId: id },
        orderBy: { timestamp: 'asc' },
        take: SESSION_DETAIL_MAX_ROWS,
        select: { id: true, eventName: true, metadata: true, timestamp: true },
      }),
    ]);

    // "Time since previous page" - computed here at read time, never stored.
    let previousTimestamp: Date | null = null;
    const pageViewsWithGap = pageViews.map((pageView) => {
      const secondsSincePreviousPage = previousTimestamp
        ? Math.round((pageView.timestamp.getTime() - previousTimestamp.getTime()) / 1000)
        : null;
      previousTimestamp = pageView.timestamp;
      return {
        id: pageView.id,
        page: pageView.page,
        duration: pageView.duration,
        timestamp: pageView.timestamp,
        secondsSincePreviousPage,
      };
    });

    res.json(
      successResponse(
        {
          session: {
            id: session.id,
            startTime: session.startedAt,
            endTime: session.endedAt,
            durationSeconds: session.endedAt
              ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
              : null,
            referrer: session.visitor.referrer,
            visitor: {
              id: session.visitor.id,
              country: session.visitor.country,
              region: session.visitor.region,
              city: session.visitor.city,
              browser: session.visitor.browser,
              device: session.visitor.device,
            },
            pageViewCount: session._count.pageViews,
            eventCount: session._count.events,
          },
          pageViews: pageViewsWithGap,
          pageViewsTruncated: session._count.pageViews > pageViews.length,
          events,
          eventsTruncated: session._count.events > events.length,
        },
        'Session detail fetched successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
});

export { router as adminAnalyticsRouter };
