// pages/api/referral/config.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем конфигурацию реферальной программы
    // В реальном приложении здесь будет логика получения конфигурации из базы данных
    const config = {
      maxDirectReferralsPerUser: 100,
      level1RewardPercent: 10,
      level2RewardPercent: 5,
      maxReferralBeadsPerRefPerDay: 100,
      maxReferralBeadsPerUserPerDay: 1000,
      title: 'Refer a Friend',
      description: 'Get beads for referring friends',
    };

    res.status(200).json(config);
  } catch (error) {
    console.error('Error in /api/referral/config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}