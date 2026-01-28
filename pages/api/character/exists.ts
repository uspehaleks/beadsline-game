// pages/api/character/exists.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Возвращаем информацию о наличии персонажа у пользователя
    // В реальном приложении здесь будет логика проверки в базе данных
    const exists = false; // по умолчанию персонаж не создан

    res.status(200).json({ exists });
  } catch (error) {
    console.error('Error in /api/character/exists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}