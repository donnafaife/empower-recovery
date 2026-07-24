import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from './client';

dotenv.config();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@empowerrecovery.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@empowerrecovery.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Seeded admin user.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
