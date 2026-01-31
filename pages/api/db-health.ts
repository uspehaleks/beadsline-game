import type { NextApiRequest, NextApiResponse } from 'next';
import { withDbTransaction } from '../../server/db'; // Используем нашу конфигурацию из server/db
import { sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем подключение к базе данных с помощью простого запроса
    await withDbTransaction(async (db) => {
      // Выполняем простой запрос для проверки подключения
      const result = await db.execute(sql`SELECT 1 as health_check`);
      
      // Если мы получили результат, значит подключение работает
      if (result && Array.isArray(result) && result.length > 0) {
        console.log('Database connection is healthy');
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}