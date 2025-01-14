import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../src/config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log environment before loading test config
logger.info('📝 Environment before loading test config:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  PWD: process.cwd()
});

// Load test environment variables
logger.info('📝 Loading test environment configuration...');
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Log environment after loading test config
logger.info('🔍 Environment after loading test config:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  envFile: path.join(__dirname, '../.env.test')
});

const prisma = new PrismaClient();

async function setupTestDb() {
  try {
    logger.info('🗑️  Cleaning up old test database...');
    // Drop test database if it exists
    execSync('dropdb --if-exists chatgenius_test');
    logger.info('✓ Dropped existing test database');

    logger.info('🏗️  Creating new test database...');
    // Create test database
    execSync('createdb chatgenius_test');
    logger.info('✓ Created test database');

    logger.info('🔄 Running migrations...');
    // Run migrations
    execSync('cd .. && NODE_ENV=test npx prisma migrate deploy', { cwd: __dirname });
    logger.info('✓ Applied migrations');

    // Verify database connection
    logger.info('🔌 Verifying database connection...');
    const url = await prisma.$queryRaw`SELECT current_database()`;
    logger.info('✓ Connected to database:', url);

    // Clean up any test data
    await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE;`;
    logger.info('✓ Cleaned up test data');

    logger.info('✨ Test database setup complete!');
  } catch (error) {
    logger.error('❌ Error setting up test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDb(); 