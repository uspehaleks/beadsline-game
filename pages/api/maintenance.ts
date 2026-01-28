// pages/api/maintenance.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем информацию о состоянии обслуживания
    const maintenance = {
      enabled: false, // по умолчанию обслуживание отключено
      endTime: null,
      message: null,
    };

    res.status(200).json(maintenance);
  } catch (error) {
    console.error('Error in /api/maintenance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}