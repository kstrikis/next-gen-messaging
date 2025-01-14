import { PrismaClient } from '@prisma/client';
import winston from 'winston';

// Create a dedicated logger for seeding
const seedLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    // Log which database we're seeding
    const databaseUrl = process.env.DATABASE_URL;
    const dbName = databaseUrl.match(/\/([^/?]+)(?:\?|$)/)?.[1] || 'unknown';
    seedLogger.info(`🌱 Seeding test database: ${dbName}`);

    // Clean existing data
    await prisma.user.deleteMany();
    await prisma.channel.deleteMany();
    seedLogger.info(`🧹 Cleaned existing data in ${dbName}`);

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

    // Create general channel
    await prisma.channel.create({
      data: {
        name: 'general',
        description: 'General discussion channel',
        isPrivate: false,
        members: {
          connect: users.map(user => ({ id: user.id }))
        }
      }
    });

    seedLogger.info(`✅ Created ${users.length} test users and general channel in ${dbName}`);
  } catch (error) {
    const databaseUrl = process.env.DATABASE_URL;
    const dbName = databaseUrl.match(/\/([^/?]+)(?:\?|$)/)?.[1] || 'unknown';
    seedLogger.error(`❌ Error seeding ${dbName}:`, { error: error.message });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 