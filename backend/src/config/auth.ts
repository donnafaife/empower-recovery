import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
  jwtExpiresIn: '7d',
};
