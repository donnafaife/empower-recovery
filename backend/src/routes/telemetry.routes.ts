import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { successResponse } from '../utils/response';

const router = Router();

router.post('/capture', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (_req, res) => {
  res.json(successResponse({ captured: true }, 'Telemetry event captured'));
});

export { router as telemetryRouter };
