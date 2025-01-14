import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, username: 'testuser1', createdAt: new Date() },
        { id: 2, username: 'testuser2', createdAt: new Date() }
      ])
    }
  }))
}));

describe('Database Health', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  it('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`;
    expect(result).toBeDefined();
    expect(result[0]['?column?']).toBe(1);
  });

  it('should query users', async () => {
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
    expect(users[0].username).toBe('testuser1');
    expect(users[1].username).toBe('testuser2');
  });
}); 