import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function setupTestDb() {
  // Ensure we're in test environment
  process.env.NODE_ENV = 'test';
  
  try {
    // Create test database
    execSync(
      "psql -U postgres -c 'DROP DATABASE IF EXISTS chatgenius_test;' && " +
      "psql -U postgres -c 'CREATE DATABASE chatgenius_test;'",
      { stdio: 'inherit' }
    );

    // Run migrations on test database
    execSync(
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatgenius_test?schema=public" npx prisma migrate deploy',
      { stdio: 'inherit' }
    );

    console.log('Test database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDb(); 