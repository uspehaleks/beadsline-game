// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';

// Добавляем обработчик для BigInt, чтобы избежать ошибок сериализации JSON
(BigInt.prototype as any).toJSON = function () { return this.toString(); };

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
        telegramId = 'test-user-default';
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

    // Возвращаем более информативный ответ в зависимости от типа ошибки
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection') || error.message.includes('certificate')) {
        // В случае ошибки базы данных или SSL, возвращаем фейкового администратора для локальной разработки
        if (process.env.NODE_ENV === 'development') {
          return res.status(200).json({
            id: 'dev-admin-12345',
            telegramId: '5261121242', // ID администратора
            username: 'dev_admin',
            firstName: 'Dev',
            lastName: 'Admin',
            photoUrl: null,
            totalPoints: 10000,
            gamesPlayed: 50,
            bestScore: 5000,
            isAdmin: true, // Устанавливаем isAdmin в true для локальной разработки
            btcBalance: 0.01,
            ethBalance: 0.1,
            usdtBalance: 10.5,
            btcBalanceSats: 1000000,
            btcTodaySats: 0,
            ethBalanceWei: 100000000000000000n,
            ethTodayWei: 0n,
            usdtToday: "0.00",
            referralCode: 'DEV_ADMIN',
            referredBy: null,
            directReferralsCount: 0,
            completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            signupBonusReceived: true,
            ratingScore: 1500,
            totalScore: 10000,
            totalWins: 25,
            currentWinStreak: 5,
            bestWinStreak: 10,
            totalCombo5Plus: 50,
            characterGender: 'male',
            characterName: 'Dev Admin',
            characterEnergy: 100,
            characterHealthState: 'normal',
            characterMood: 'happy',
            bonusLives: 3,
            lastActivityAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
            btcTodayDate: new Date().toISOString().split('T')[0],
            ethTodayDate: new Date().toISOString().split('T')[0],
            usdtTodayDate: new Date().toISOString().split('T')[0],
          });
        } else {
          // В продакшене возвращаем гостя
          return res.status(200).json({
            id: '0',
            role: 'guest',
            isGuest: true,
            username: 'guest',
            firstName: 'Guest',
            totalPoints: 0,
            gamesPlayed: 0,
            bestScore: 0,
            btcBalance: 0,
            ethBalance: 0,
            usdtBalance: 0,
            btcBalanceSats: 0,
            btcTodaySats: 0,
            ethBalanceWei: 0n,
            ethTodayWei: 0n,
            usdtToday: "0.00",
            referralCode: null,
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
            characterHealthState: 'normal',
            characterMood: 'neutral',
            bonusLives: 0,
            lastActivityAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
            isAdmin: false,
            telegramId: null
          });
        }
      }
    }

    // Для других ошибок возвращаем стандартную ошибку 500
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}