import { jest } from '@jest/globals';
export const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  game: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  chat: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};