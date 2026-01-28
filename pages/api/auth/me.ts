// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // В Telegram Mini Apps пользователь часто передается через заголовки
    // Проверяем различные источники ID пользователя
    let telegramId = req.headers['x-user-id'] as string ||
                     req.headers['user-id'] as string ||
                     req.query.userId as string ||
                     req.cookies?.userId;

    // Если нет telegramId, проверяем, может быть, это тестовый режим
    if (!telegramId) {
      // В тестовом режиме можем использовать фиксированный ID
      if (process.env.NODE_ENV === 'development') {
        telegramId = 'test-user-' + Date.now();
      } else {
        return res.status(401).json({ error: 'User not authenticated' });
      }
    }

    // Проверяем, существует ли пользователь в базе данных по telegramId
    let user = await storage.getUserByTelegramId(telegramId);

    if (!user) {
      // Если пользователя нет, создаем его
      user = await storage.createUser({
        telegramId,
        username: `user_${Date.now()}`,
        firstName: null,
        lastName: null,
        photoUrl: null,
      });
    } else {
      // Обновляем время последней активности
      await storage.updateUser(user.id, { lastActivityAt: new Date() });
    }

    // Возвращаем данные пользователя
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}