import "dotenv/config";

import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const databaseUrl = process.env.DATABASE_URL ?? fallbackDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
