import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../../src/generated/prisma/client.ts';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? '',
});

const prisma = new PrismaClient({ adapter });

export { prisma };