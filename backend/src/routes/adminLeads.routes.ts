import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../prisma/client';
import { errorResponse, successResponse } from '../utils/response';

const router = Router();

const LEAD_STATUS_VALUES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'updated'] as const;
const MAX_PAGE_SIZE = 100;
const MAX_NOTES_LENGTH = 5000;
const EXPORT_MAX_ROWS = 5000;

const SORT_ORDER_BY: Record<(typeof SORT_OPTIONS)[number], Prisma.LeadOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  updated: { updatedAt: 'desc' },
};

function buildLeadWhere(search: string | undefined, status: (typeof LEAD_STATUS_VALUES)[number] | undefined): Prisma.LeadWhereInput {
  return {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

// Shared by both the list and export routes, which filter leads the same way.
const leadFilterSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(LEAD_STATUS_VALUES).optional(),
});

const listQuerySchema = leadFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(25),
  sortBy: z.enum(SORT_OPTIONS).default('newest'),
});

router.get('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = listQuerySchema.parse(req.query);
    const where = buildLeadWhere(parsed.search, parsed.status);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: SORT_ORDER_BY[parsed.sortBy],
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize,
        select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true, updatedAt: true },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json(
      successResponse(
        {
          leads,
          pagination: {
            page: parsed.page,
            pageSize: parsed.pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
          },
        },
        'Leads fetched successfully',
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

const exportQuerySchema = leadFilterSchema;

// Mounted before /:id so "export" is never interpreted as a lead id.
router.get('/export', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = exportQuerySchema.parse(req.query);
    const where = buildLeadWhere(parsed.search, parsed.status);

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: EXPORT_MAX_ROWS,
      select: { name: true, email: true, phone: true, status: true, createdAt: true },
    });

    const header = ['Name', 'Email', 'Phone', 'Status', 'Date Received'];
    const rows = leads.map((lead) => [
      csvEscape(lead.name),
      csvEscape(lead.email),
      csvEscape(lead.phone),
      csvEscape(lead.status),
      csvEscape(lead.createdAt.toISOString()),
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid query parameters', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

router.get('/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id as string } });

    if (!lead) {
      res.status(404).json(errorResponse('Lead not found'));
      return;
    }

    res.json(successResponse({ lead }, 'Lead fetched successfully'));
  } catch (error) {
    next(error);
  }
});

const updateStatusSchema = z.object({
  status: z.enum(LEAD_STATUS_VALUES),
});

router.patch('/:id/status', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.parse(req.body);
    const lead = await prisma.lead.update({
      where: { id: req.params.id as string },
      data: { status: parsed.status },
    });
    res.json(successResponse({ lead }, 'Lead status updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid status', error.flatten().fieldErrors));
      return;
    }
    if (isNotFoundError(error)) {
      res.status(404).json(errorResponse('Lead not found'));
      return;
    }
    next(error);
  }
});

const updateNotesSchema = z.object({
  notes: z.string().max(MAX_NOTES_LENGTH, `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`),
});

router.patch('/:id/notes', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = updateNotesSchema.parse(req.body);
    const trimmed = parsed.notes.trim();

    const lead = await prisma.lead.update({
      where: { id: req.params.id as string },
      data: { notes: trimmed.length > 0 ? trimmed : null },
    });
    res.json(successResponse({ lead }, 'Lead notes updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid notes', error.flatten().fieldErrors));
      return;
    }
    if (isNotFoundError(error)) {
      res.status(404).json(errorResponse('Lead not found'));
      return;
    }
    next(error);
  }
});

export { router as adminLeadsRouter };
