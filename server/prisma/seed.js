import { PrismaClient } from '@prisma/client';
import winston from 'winston';

// Create a simple logger for the seed script
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const prisma = new PrismaClient();

async function main() {
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

  logger.info('Seeded general channel:', { channel: generalChannel });
}

main()
  .catch((e) => {
    logger.error('Error seeding database:', { error: e.message });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 