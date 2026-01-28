import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Attempting to connect to database...");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL length:", process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);

console.log("DATABASE_URL being used:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "UNDEFINED");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Параметры для serverless среды Vercel
  connectionTimeoutMillis: 2000,  // Уменьшаем таймаут подключения
  idleTimeoutMillis: 10000,       // Уменьшаем таймаут простоя
  max: 1,                         // Только одно соединение для serverless
  // Дополнительные параметры для стабильности
  keepAlive: true,                // Поддерживать соединение активным
  keepAliveInitialDelayMillis: 5000 // Задержка перед первой проверкой keep-alive
});

// В serverless среде не производим тестовое подключение при запуске
// Соединение будет установлено при первом запросе
console.log("Database pool configured for serverless environment");

export const db = drizzle(pool, { schema });
