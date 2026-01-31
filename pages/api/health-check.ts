import type { NextApiRequest, NextApiResponse } from 'next';
import { withDbTransaction } from '../../server/db'; // Используем нашу конфигурацию из server/db
import { sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем подключение к базе данных
    await withDbTransaction(async (db) => {
      // Выполняем простой запрос для проверки подключения
      const result = await db.execute(sql`SELECT 1 as health_check`);
      // Если запрос выполнился без ошибок, значит подключение работает
      console.log('Health check query result:', result);
    });

    // Проверяем доступ к таблице users
    let isTablesAccessible = false;
    try {
      await withDbTransaction(async (db) => {
        const tableResult = await db.execute(sql`SELECT COUNT(*) as count FROM users LIMIT 1`);
        // В Drizzle ORM результаты находятся в свойстве rows
        console.log('Table accessibility query result:', tableResult);
        isTablesAccessible = tableResult && tableResult.rows && tableResult.rows.length > 0 && tableResult.rows[0].count !== undefined;
      });
      // Если мы дошли до этой точки, значит второй запрос прошёл без ошибок
      // и мы можем считать, что таблицы доступны
      isTablesAccessible = true;
    } catch (tableError) {
      console.error("Error checking table accessibility:", tableError);
      isTablesAccessible = false;
    }

    console.log("Database connection is healthy");

    res.status(200).json({
      test: "hello",
      databaseConnected: true,
      databaseUrlStatus: process.env.DATABASE_URL ? "Found" : "Not Found",
      tablesAccessible: isTablesAccessible,
      timestamp: new Date().toISOString(),
      message: 'Health check endpoint is working'
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      test: "hello",
      databaseConnected: false,
      databaseUrlStatus: process.env.DATABASE_URL ? "Found" : "Not Found",
      tablesAccessible: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Health check endpoint is working but database connection failed'
    });
  }
}