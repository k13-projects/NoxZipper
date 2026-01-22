import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const isTurso = databaseUrl.startsWith("libsql://");

  // Prisma v7 requires adapter for all connections (no url in datasource)
  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: isTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
