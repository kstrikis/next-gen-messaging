import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database', async () => {
    try {
      // Try to query the database
      await prisma.$queryRaw`SELECT 1`;
      expect(true).toBe(true); // If we get here, the connection worked
    } catch (error) {
      throw new Error('Database connection failed: ' + error.message);
    }
  });

  it('should be able to create and query users', async () => {
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashedpassword123'
    };

    try {
      // Clean up any existing test user
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: testUser.email },
            { username: testUser.username }
          ]
        }
      });

      // Create a test user
      const created = await prisma.user.create({
        data: testUser,
        select: {
          id: true,
          email: true,
          username: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true
        }
      });

      expect(created.email).toBe(testUser.email);
      expect(created.username).toBe(testUser.username);
      expect(created.passwordHash).toBe(testUser.passwordHash);
      expect(created.id).toBeDefined();
      expect(created.createdAt instanceof Date).toBe(true);
      expect(created.updatedAt instanceof Date).toBe(true);

      // Clean up
      await prisma.user.delete({
        where: { id: created.id }
      });
    } catch (error) {
      throw new Error('User operations failed: ' + error.message);
    }
  });
}); 