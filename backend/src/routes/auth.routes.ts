import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authConfig } from '../config/auth';
import { successResponse } from '../utils/response';

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

router.post('/register', async (req, res, next) => {
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

export { router as authRouter };
