// API endpoint for database health check
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { users } from '../shared/schema.js';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Создаем отдельное подключение для проверки, чтобы не зависеть от основного подключения
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      status: 'unhealthy',
      databaseConnected: false,
      tablesAccessible: false,
      timestamp: new Date().toISOString(),
      error: 'DATABASE_URL is not set',
      message: 'Переменная окружения DATABASE_URL не установлена'
    });
  }

  let testPool;
  try {
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Проверяем подключение к базе данных
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();

    // Проверяем доступ к таблице пользователей
    const db = drizzle(testPool);
    const userCount = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const tablesAccessible = userCount.length >= 0; // Даже если 0 пользователей, таблица доступна

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
      code: (error as any).code || null,
      detail: (error as any).detail || null,
      hint: (error as any).hint || null,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      message: 'Ошибка подключения к базе данных'
    });
  } finally {
    if (testPool) {
      await testPool.end();
    }
  }
}