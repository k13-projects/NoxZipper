import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env file
import "dotenv/config";

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL || `file:${path.join(__dirname, "dev.db")}`,
  },
  migrate: {
    adapter: async () => {
      const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

      // Check if using Turso
      if (databaseUrl.startsWith("libsql://")) {
        const { PrismaLibSql } = await import("@prisma/adapter-libsql");
        return new PrismaLibSql({
          url: databaseUrl,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
      }

      // Local SQLite - use file path
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      return new PrismaLibSql({
        url: `file:${path.join(__dirname, "dev.db")}`,
      });
    },
  },
});
