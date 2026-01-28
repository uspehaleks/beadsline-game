// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // В Telegram Mini Apps пользователь часто передается через заголовки
    // Проверяем различные источники ID пользователя
    let userId = req.headers['x-user-id'] as string ||
                 req.headers['user-id'] as string ||
                 req.query.userId as string ||
                 req.cookies?.userId;

    // Если нет userId, проверяем, может быть, это тестовый режим
    if (!userId) {
      // В тестовом режиме можем использовать фиксированный ID
      if (process.env.NODE_ENV === 'development') {
        userId = 'test-user-' + Date.now();
      } else {
        return res.status(401).json({ error: 'User not authenticated' });
      }
    }

    // Проверяем, существует ли пользователь в базе данных
    let user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      // Если пользователя нет, создаем его
      const newUser = await db.insert(users).values({
        id: userId,
        username: `user_${Date.now()}`,
        totalPoints: 0,
        gamesPlayed: 0,
        bestScore: 0,
        isAdmin: false,
        btcBalance: 0,
        ethBalance: 0,
        usdtBalance: 0,
        btcBalanceSats: 0n,
        btcTodaySats: 0n,
        ethBalanceWei: 0n,
        ethTodayWei: 0n,
        usdtToday: "0",
        referralCode: `REF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        referredBy: null,
        directReferralsCount: 0,
        completedLevels: [],
        signupBonusReceived: false,
        ratingScore: 0,
        totalScore: 0,
        totalWins: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        totalCombo5Plus: 0,
        characterGender: null,
        characterName: null,
        characterEnergy: 100,
        characterHealthState: "normal",
        characterMood: "neutral",
        bonusLives: 0,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        deletedAt: null,
      }).returning();

      user = newUser;
    } else {
      // Обновляем время последней активности
      await db.update(users).set({ lastActivityAt: new Date() }).where(eq(users.id, userId));
    }

    // Возвращаем данные пользователя
    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}