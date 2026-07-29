import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authConfig } from '../config/auth';
import { errorResponse, successResponse } from '../utils/response';
import { attachUserIfPresent, authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Admin-only: creating accounts (including choosing their role) is something
// only an existing admin should be able to do - this is not public signup.
router.post('/register', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });

    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashedPassword,
        role: parsed.role ?? 'USER',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
    });

    res.status(201).json(successResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const passwordMatch = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
    });

    res.json(successResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, 'Login successful'));
  } catch (error) {
    next(error);
  }
});

const changePasswordSchema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Self-service password change - distinct from /register (admin-only, sets
// someone else's initial password). Requires knowing the current password,
// so it doesn't need a separate "forgot password" email flow (not something
// this app sends emails for yet).
//
// Works two ways: signed-in (from the dashboard, identified by the session -
// `email` is ignored) or signed-out (from the login page, identified by the
// `email` field instead, the same way /login does).
router.post('/change-password', attachUserIfPresent, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = changePasswordSchema.parse(req.body);

    if (req.user) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const currentPasswordMatches = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
      if (!currentPasswordMatches) {
        res.status(401).json(errorResponse('Current password is incorrect'));
        return;
      }

      const passwordHash = await bcrypt.hash(parsed.newPassword, 10);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      res.json(successResponse(null, 'Password updated successfully'));
      return;
    }

    if (!parsed.email) {
      res.status(400).json(errorResponse('Email is required'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    // Same generic message whether the email doesn't exist or the password
    // is wrong - matches /login's behavior, so this signed-out path can't be
    // used to check which emails have accounts.
    const currentPasswordMatches = user ? await bcrypt.compare(parsed.currentPassword, user.passwordHash) : false;
    if (!user || !currentPasswordMatches) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json(successResponse(null, 'Password updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse('Invalid password change request', error.flatten().fieldErrors));
      return;
    }
    next(error);
  }
});

export { router as authRouter };
