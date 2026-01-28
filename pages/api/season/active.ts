// pages/api/season/active.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем информацию об активном сезоне
    // В реальном приложении здесь будет логика получения активного сезона из базы данных
    const activeSeason = null; // по умолчанию нет активного сезона

    res.status(200).json(activeSeason);
  } catch (error) {
    console.error('Error in /api/season/active:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}