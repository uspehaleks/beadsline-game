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
  // Агрессивная оптимизация для serverless среды Vercel
  connectionTimeoutMillis: 1000,  // Минимальный таймаут подключения
  idleTimeoutMillis: 5000,        // Минимальный таймаут простоя
  max: 1,                         // Минимальное количество соединений
  // Дополнительные параметры для стабильности в serverless
  maxUses: 750,                   // Количество использований соединения до пересоздания (около 5-10 мин при 1 запросе в сек)
  statement_timeout: 3000,        // Таймаут выполнения SQL запроса
  query_timeout: 5000,            // Таймаут выполнения запроса
  keepAlive: true,                // Поддерживать соединение активным
  keepAliveInitialDelayMillis: 1000 // Уменьшенная задержка keep-alive
});

// В serverless среде не производим тестовое подключение при запуске
// Соединение будет установлено при первом запросе
console.log("Database pool configured for serverless environment");

export const db = drizzle(pool, { schema });
