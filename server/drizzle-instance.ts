import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../shared/schema';

// Функция для создания временного соединения с Drizzle
export async function createTemporaryDbConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Игнорировать проверку сертификата для локальной разработки
    }
  });

  await client.connect();

  const db = drizzle(client, { schema });

  return { db, client };
}

// Функция для выполнения операций с временным соединением
export async function withTemporaryDbConnection<T>(
  callback: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const { db, client } = await createTemporaryDbConnection();

  try {
    const result = await callback(db);
    return result;
  } finally {
    await client.end();
  }
}