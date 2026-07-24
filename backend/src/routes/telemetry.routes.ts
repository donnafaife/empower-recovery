import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { errorResponse, successResponse } from '../utils/response';
import { hashIp } from '../utils/ipHash';
import { guessBrowser, guessDevice } from '../utils/uaParse';
import { lookupGeo } from '../utils/geoLookup';

const router = Router();

const MAX_PAGE_LENGTH = 500;
const MAX_REFERRER_LENGTH = 500;
const MAX_EVENT_NAME_LENGTH = 100;
const MAX_METADATA_BYTES = 10_000;

// These routes are called by anonymous visitors browsing the public site,
// so - unlike /api/users or /api/leads (admin list) - none of them require
// a logged-in user.

function blankToUndefined(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

const startSessionSchema = z.object({
  // The visitor's long-lived anonymous ID (generated and stored in the
  // browser). Maps to the confusingly-named Visitor.sessionId column.
  visitorKey: z.string().trim().min(1).max(100),
  referrer: z.preprocess(blankToUndefined, z.string().trim().max(MAX_REFERRER_LENGTH).optional()),
});

router.post('/session', async (req, res, next) => {
  try {
    const parsed = startSessionSchema.parse(req.body);
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    // The raw IP is only ever used in-memory, to compute the hash below and
    // to feed the geo lookup (which has its own internal cache) - it is
    // never written to the database.
    const geo = ip ? await lookupGeo(ip) : null;

    // One Visitor row per browser (identified by visitorKey), reused across
    // every visit; only set on first creation so we keep the *original*
    // acquisition referrer (and location) instead of overwriting it on
    // return visits.
    const visitor = await prisma.visitor.upsert({
      where: { sessionId: parsed.visitorKey },
      update: {},
      create: {
        sessionId: parsed.visitorKey,
        ipHash: ip ? hashIp(ip) : undefined,
        browser: guessBrowser(userAgent),
        device: guessDevice(userAgent),
        referrer: parsed.referrer,
        country: geo?.country,
        region: geo?.region,
        city: geo?.city,
        timezone: geo?.timezone,
        latitude: geo?.latitude,
        longitude: geo?.longitude,
      },
    });

    const session = await prisma.session.create({
      data: {
        visitorId: visitor.id,
        userAgent,
      },
    });

    res.status(201).json(successResponse({ sessionId: session.id }, 'Session started'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid session payload', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

router.post('/session/:id/end', async (req, res) => {
  // Fire-and-forget from the browser (sent via fetch keepalive on page
  // unload) - always acknowledge, even if the session id is missing or
  // unknown, so a stale/garbled beacon never surfaces as an error.
  try {
    await prisma.session.update({
      where: { id: req.params.id },
      data: { endedAt: new Date() },
    });
  } catch {
    // ignore - see comment above
  }
  res.status(204).send();
});

const pageViewSchema = z.object({
  sessionId: z.string().trim().min(1),
  page: z.string().trim().min(1).max(MAX_PAGE_LENGTH),
});

router.post('/pageview', async (req, res, next) => {
  try {
    const parsed = pageViewSchema.parse(req.body);
    const session = await prisma.session.findUnique({ where: { id: parsed.sessionId } });

    if (!session) {
      res.status(404).json(errorResponse('Unknown session'));
      return;
    }

    const pageView = await prisma.pageView.create({
      data: {
        sessionId: session.id,
        visitorId: session.visitorId,
        page: parsed.page,
      },
    });

    res.status(201).json(successResponse(pageView, 'Page view recorded'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid page view payload', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

const eventSchema = z.object({
  sessionId: z.string().trim().min(1),
  eventName: z.string().trim().min(1).max(MAX_EVENT_NAME_LENGTH),
  metadata: z
    .unknown()
    .optional()
    .refine((value) => value === undefined || JSON.stringify(value).length <= MAX_METADATA_BYTES, {
      message: `metadata must be ${MAX_METADATA_BYTES} bytes or fewer`,
    }),
});

router.post('/event', async (req, res, next) => {
  try {
    const parsed = eventSchema.parse(req.body);
    const session = await prisma.session.findUnique({ where: { id: parsed.sessionId } });

    if (!session) {
      res.status(404).json(errorResponse('Unknown session'));
      return;
    }

    const event = await prisma.event.create({
      data: {
        sessionId: session.id,
        visitorId: session.visitorId,
        eventName: parsed.eventName,
        metadata: parsed.metadata ?? undefined,
      },
    });

    res.status(201).json(successResponse(event, 'Event recorded'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid event payload', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

export { router as telemetryRouter };
