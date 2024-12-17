import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hopecare.org' },
    update: {},
    create: {
      email: 'admin@hopecare.org',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
