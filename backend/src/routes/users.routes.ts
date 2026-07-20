import { Router } from 'express';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../prisma/client';
import { successResponse } from '../utils/response';

const router = Router();

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication token required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(successResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, 'User profile fetched'));
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(successResponse(users, 'Users fetched successfully'));
  } catch (error) {
    next(error);
  }
});

export { router as usersRouter };
