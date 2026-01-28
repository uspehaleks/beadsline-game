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
  // Добавляем параметры для лучшей стабильности соединения
  connectionTimeoutMillis: 5000, // 5 секунд таймаут на подключение
  idleTimeoutMillis: 30000,      // 30 секунд таймаут простоя
  max: 10                        // Максимальное количество соединений в пуле
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
    release(); // Release the client back to the pool
  }
});

export const db = drizzle(pool, { schema });
