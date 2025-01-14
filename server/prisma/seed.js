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

async function main() {
  // Log which database we're seeding
  const databaseUrl = process.env.DATABASE_URL;
  const dbName = databaseUrl.match(/\/([^/?]+)(?:\?|$)/)?.[1] || 'unknown';
  seedLogger.info(`🌱 Seeding database: ${dbName}`);

  // Create the general channel if it doesn't exist
  const generalChannel = await prisma.channel.upsert({
    where: { name: 'general' },
    update: {},
    create: {
      name: 'general',
      description: 'General discussion channel',
      isPrivate: false,
    },
  });

  seedLogger.info(`✅ Created/updated general channel in ${dbName}:`, { channel: generalChannel });
}

main()
  .catch((e) => {
    const databaseUrl = process.env.DATABASE_URL;
    const dbName = databaseUrl.match(/\/([^/?]+)(?:\?|$)/)?.[1] || 'unknown';
    seedLogger.error(`❌ Error seeding ${dbName}:`, { error: e.message });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 