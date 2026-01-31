// pages/api/test-db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Выполняем простой тестовый запрос к базе данных
    const startTime = Date.now();
    
    // Получаем количество пользователей как простой тест
    const userCount = await storage.getUserCount();
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      userCount,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}