// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем подключение к базе данных, делая простой запрос
    const startTime = Date.now();
    
    // Попробуем получить общее количество пользователей как простую проверку
    const userCount = await storage.getUserCount();
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: 'healthy',
      dbStatus: 'connected',
      userCount,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      dbStatus: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}