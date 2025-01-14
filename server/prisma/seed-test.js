import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger.js';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    logger.info('🌱 Seeding test database...');

    // Clean existing data
    await prisma.user.deleteMany();

    // Create test users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'test1@example.com',
          username: 'testuser1',
          passwordHash: 'hashedpassword1',
          isGuest: false,
          auth0Id: null
        }
      }),
      prisma.user.create({
        data: {
          email: 'test2@example.com',
          username: 'testuser2',
          passwordHash: 'hashedpassword2',
          isGuest: false,
          auth0Id: null
        }
      }),
      prisma.user.create({
        data: {
          username: 'guestuser1',
          isGuest: true,
          auth0Id: null
        }
      }),
      prisma.user.create({
        data: {
          email: 'auth0user@example.com',
          username: 'auth0user',
          isGuest: false,
          auth0Id: 'auth0|123456789'
        }
      })
    ]);

    logger.info(`✅ Created ${users.length} test users`);
  } catch (error) {
    logger.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 