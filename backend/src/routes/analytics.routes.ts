import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../prisma/client';
import { successResponse } from '../utils/response';

const router = Router();

router.get('/summary', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const [userCount, leadCount] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
    ]);

    res.json(successResponse({ users: userCount, leads: leadCount }, 'Analytics summary fetched'));
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRouter };
