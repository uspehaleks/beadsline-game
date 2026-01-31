import type { Express } from 'express';
import { storage } from '../storage';
import { activeSessions, getActivePlayersCount } from '../game';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchema } from '../schemas/user';
import { z } from 'zod';

export async function registerUserAdditionalRoutes(app: Express) {
  // Get user profile
  app.get('/api/auth/me', async (req, res) => {
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
  });

  // Get user crypto tickets count
  app.get('/api/user/crypto-tickets/count', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ count: user.cryptoTickets || 0 });
    } catch (error) {
      console.error('Get crypto tickets count error:', error);
      res.status(500).json({ error: 'Failed to get crypto tickets count' });
    }
  });

  // Get user league
  app.get('/api/user/league', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ league: user.league || 'bronze' });
    } catch (error) {
      console.error('Get user league error:', error);
      res.status(500).json({ error: 'Failed to get user league' });
    }
  });

  // Get user boosts
  app.get('/user/boosts', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userBoosts = await storage.getUserBoosts(userId);
      res.json(userBoosts);
    } catch (error) {
      console.error('Get user boosts error:', error);
      res.status(500).json({ error: 'Failed to get user boosts' });
    }
  });

  // Update user boost quantity
  app.put('/user/boosts/:boostId', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const { boostId } = req.params;
      const { quantity } = req.body;

      const result = await storage.setUserBoostQuantity(userId, boostId, quantity);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result);
    } catch (error) {
      console.error('Update user boost quantity error:', error);
      res.status(500).json({ error: 'Failed to update user boost quantity' });
    }
  });

  // Get user crypto balances
  app.get('/api/user/crypto', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        btcBalance: user.btcBalance,
        ethBalance: user.ethBalance,
        usdtBalance: user.usdtBalance,
      });
    } catch (error) {
      console.error('Get user crypto error:', error);
      res.status(500).json({ error: 'Failed to get user crypto' });
    }
  });

  // Update user crypto balances
  app.put('/api/user/crypto', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const { btcBalance, ethBalance, usdtBalance } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        btcBalance,
        ethBalance,
        usdtBalance,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user crypto error:', error);
      res.status(500).json({ error: 'Failed to update user crypto' });
    }
  });

  // Get user crypto availability
  app.get('/api/crypto-availability', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        btcAvailable: user.btcBalance > 0,
        ethAvailable: user.ethBalance > 0,
        usdtAvailable: user.usdtBalance > 0,
      });
    } catch (error) {
      console.error('Get crypto availability error:', error);
      res.status(500).json({ error: 'Failed to get crypto availability' });
    }
  });

  // Admin: Get all users
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  // Admin: Update user admin status
  app.patch('/api/admin/users/:userId/admin', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin } = req.body;

      const updatedUser = await storage.updateUser(userId, { isAdmin });
      res.json(updatedUser);
    } catch (error) {
      console.error('Update user admin status error:', error);
      res.status(500).json({ error: 'Failed to update user admin status' });
    }
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Admin: Get user by telegram ID
  app.get('/api/admin/users/telegram/:telegramId', requireAdmin, async (req, res) => {
    try {
      const { telegramId } = req.params;
      const user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user by telegram ID error:', error);
      res.status(500).json({ error: 'Failed to get user by telegram ID' });
    }
  });
}