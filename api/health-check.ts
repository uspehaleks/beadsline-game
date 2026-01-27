// API endpoint for database health check
import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';
import { users } from '../shared/schema.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем подключение к базе данных
    await db.execute(sql`SELECT 1`);

    // Проверяем доступ к таблице пользователей
    const userCount = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const tablesAccessible = userCount.length > 0;

    res.status(200).json({
      status: 'healthy',
      databaseConnected: true,
      tablesAccessible: tablesAccessible,
      timestamp: new Date().toISOString(),
      message: 'База данных подключена и доступна'
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      databaseConnected: false,
      tablesAccessible: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Ошибка подключения к базе данных'
    });
  }
}