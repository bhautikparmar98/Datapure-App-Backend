import { PrismaClient } from '@prisma/client';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

// create a singleton object from prisma here
const prisma: PrismaClient =
  (global.prisma as PrismaClient) || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

// export prisma as default
export default prisma;
