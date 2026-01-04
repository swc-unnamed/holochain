import { PrismaClient } from '$lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const url = new URL(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/holochaindb');
    const adapter = new PrismaPg({
      host: url.hostname,
      port: Number(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });

    prisma = new PrismaClient({
      adapter: adapter,
    })
  }
  return prisma;
}

export { PrismaClient, getPrismaClient }
export const db = getPrismaClient();