import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Connection', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be able to create and query users', async () => {
    try {
      // Create a test user
      const created = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
          auth0Id: null,
          isGuest: false
        }
      });

      // Verify created user
      expect(created.email).toBe('test@example.com');
      expect(created.username).toBe('testuser');
      expect(created.passwordHash).toBe('hashedpassword');
      expect(created.isGuest).toBe(false);
      expect(created.auth0Id).toBeNull();
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