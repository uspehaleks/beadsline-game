import { defineConfig } from "drizzle-kit";

// Используем DIRECT_URL для миграций (прямое подключение), если доступен
// иначе fallback на DATABASE_URL (пулер подключение)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Either DIRECT_URL or DATABASE_URL must be set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
