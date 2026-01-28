// pages/api/user/crypto-tickets/use.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // В реальном приложении здесь будет логика использования криптобилета
    // и проверка, что пользователь авторизован
    
    // Возвращаем успешный ответ
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /api/user/crypto-tickets/use:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}