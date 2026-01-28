// server/db-serverless.ts - Адаптер для работы с базой данных в serverless среде
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

// Функция для создания временного соединения
export async function createTempDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Настройки для краткосрочного соединения
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 5000,
    max: 1,
  });

  try {
    // Проверяем соединение
    const client = await pool.connect();
    await client.query('SELECT 1'); // Простой запрос для проверки
    client.release();

    const db = drizzle(pool, { schema });
    return { db, pool };
  } catch (error) {
    await pool.end(); // Обязательно закрываем пул при ошибке
    throw error;
  }
}

// Функция для выполнения запроса с временным соединением
export async function withTempDbConnection<T>(
  callback: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const { db, pool } = await createTempDbConnection();
  
  try {
    const result = await callback(db);
    return result;
  } finally {
    // Всегда закрываем пул соединений после использования
    await pool.end();
  }
}