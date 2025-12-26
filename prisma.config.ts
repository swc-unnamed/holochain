import { defineConfig } from "prisma/config";
import path from 'node:path';
import "dotenv/config";

export default defineConfig({
  schema: path.join('prisma', 'models'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/holochaindb',
  }
});
