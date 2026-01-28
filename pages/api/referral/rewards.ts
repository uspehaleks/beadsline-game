// pages/api/referral/rewards.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем информацию о реферальных наградах
    // В реальном приложении здесь будет логика получения наград из базы данных
    const rewards = [];

    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error in /api/referral/rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}