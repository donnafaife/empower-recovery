import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { errorResponse, successResponse } from '../utils/response';

const router = Router();

const MAX_MESSAGE_LENGTH = 2000;

// Empty strings from optional form fields should be treated as "not provided",
// not stored as blank text.
function blankToUndefined(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('A valid email address is required'),
  phone: z.preprocess(blankToUndefined, z.string().trim().optional()),
  message: z.preprocess(
    blankToUndefined,
    z.string().trim().max(MAX_MESSAGE_LENGTH, `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`).optional(),
  ),
  // Honeypot: a real visitor never sees or fills this field. Bots that
  // auto-fill every input on a form will populate it, so any value here
  // marks the submission as spam.
  website: z.preprocess(blankToUndefined, z.string().trim().optional()),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createLeadSchema.parse(req.body);

    if (parsed.website) {
      // Pretend it succeeded so the bot has no signal to adapt to.
      res.status(201).json(successResponse(null, 'Lead created successfully'));
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        message: parsed.message,
      },
      // Explicit select (never rely on Prisma's implicit full-row return) so
      // this public endpoint can never expose `notes`, regardless of what
      // fields the Lead model gains in the future.
      select: { id: true, name: true, email: true, phone: true, message: true, status: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json(successResponse(lead, 'Lead created successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid submission', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

// The admin-facing list (with pagination/search/filtering) lives at
// /api/admin/leads (see adminLeads.routes.ts) - this router only ever
// handles the public contact-form submission.

export { router as leadsRouter };
