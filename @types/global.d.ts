import { PrismaClient } from '@prisma/client';

declare global {
  interface prisma extends PrismaClient {}
}
