// pages/api/character/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем статус персонажа
    // В реальном приложении здесь будет логика получения статуса из базы данных
    const status = {
      energy: 100,
      health: 'healthy',
      mood: 'happy',
      // другие параметры статуса
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('Error in /api/character/status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}