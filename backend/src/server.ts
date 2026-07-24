import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createPrismaClient } from './prisma/client';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { leadsRouter } from './routes/leads.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { telemetryRouter } from './routes/telemetry.routes';
import { adminDashboardRouter } from './routes/adminDashboard.routes';
import { adminLeadsRouter } from './routes/adminLeads.routes';
import { adminAnalyticsRouter } from './routes/adminAnalytics.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/leads', adminLeadsRouter);
app.use('/api/admin/analytics', adminAnalyticsRouter);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

createPrismaClient().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
