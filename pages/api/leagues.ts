// pages/api/leagues.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем список лиг
    // В реальном приложении здесь будет логика получения лиг из базы данных
    const leagues: Array<any> = []; // по умолчанию пустой массив

    res.status(200).json(leagues);
  } catch (error) {
    console.error('Error in /api/leagues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}