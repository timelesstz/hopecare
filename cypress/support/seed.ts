import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedTestDatabase = async () => {
  // Clear existing data
  await prisma.$transaction([
    prisma.mediaItem.deleteMany(),
    prisma.donation.deleteMany(),
    prisma.user.deleteMany(),
    prisma.project.deleteMany(),
    prisma.program.deleteMany(),
  ]);

  // Create test users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: '$2b$10$dGQI3H1nK5l3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3',
      role: 'ADMIN',
      name: 'Test Admin',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  });

  const donorUser = await prisma.user.create({
    data: {
      email: 'donor@example.com',
      password: '$2b$10$dGQI3H1nK5l3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3H3',
      role: 'DONOR',
      name: 'Test Donor'
    }
  });

  // Create test programs
  const program = await prisma.program.create({
    data: {
      name: 'Test Program',
      description: 'A test program for e2e testing',
      status: 'ACTIVE'
    }
  });

  // Create test projects
  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      description: 'A test project for e2e testing',
      status: 'ACTIVE',
      programId: program.id,
      targetAmount: 10000,
      currentAmount: 5000
    }
  });

  // Create test media items
  const mediaItem = await prisma.mediaItem.create({
    data: {
      name: 'test-image.jpg',
      type: 'image/jpeg',
      size: 52642,
      url: 'https://example.com/test-image.jpg',
      metadata: {
        title: 'Test Image',
        description: 'A test image for media library',
        tags: ['test', 'sample']
      },
      uploadedById: adminUser.id
    }
  });

  return {
    adminUser,
    donorUser,
    program,
    project,
    mediaItem
  };
};

export const clearTestDatabase = async () => {
  await prisma.$transaction([
    prisma.mediaItem.deleteMany(),
    prisma.donation.deleteMany(),
    prisma.user.deleteMany(),
    prisma.project.deleteMany(),
    prisma.program.deleteMany(),
  ]);
};
