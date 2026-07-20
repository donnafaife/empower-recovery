import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../prisma/client';
import { successResponse } from '../utils/response';

const router = Router();

const createLeadSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = createLeadSchema.parse(req.body);
    const lead = await prisma.lead.create({ data: parsed });
    res.status(201).json(successResponse(lead, 'Lead created successfully'));
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(successResponse(leads, 'Leads fetched successfully'));
  } catch (error) {
    next(error);
  }
});

export { router as leadsRouter };
