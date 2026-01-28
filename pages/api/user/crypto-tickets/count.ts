// pages/api/user/crypto-tickets/count.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем количество криптобилетов пользователя
    // В реальном приложении здесь будет логика получения данных из базы данных
    const count = 0; // по умолчанию 0

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error in /api/user/crypto-tickets/count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}