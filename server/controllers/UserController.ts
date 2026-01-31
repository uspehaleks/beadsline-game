import type { Request, Response } from "express";
import { storage } from "../storage.js";
import { z } from "zod";
import { 
  insertUserSchema,
  updateUserSchema,
  type InsertUser,
  type UserUpdate
} from "../../shared/schema.js";

export class UserController {
  // Метод для получения пользователя по ID
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения пользователя по Telegram ID
  async getUserByTelegramId(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await storage.getUserByTelegramId(telegramId);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения пользователя по имени пользователя
  async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для создания пользователя
  async createUser(req: Request, res: Response) {
    try {
      const validatedData: InsertUser = {
        telegramId: req.body.telegramId,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        photoUrl: req.body.photoUrl,
        referralCode: req.body.referralCode,
        referredBy: req.body.referredBy,
        characterGender: req.body.characterGender,
        characterName: req.body.characterName,
      };

      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для обновления статистики пользователя
  async updateUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { score } = req.body;

      const user = await storage.updateUserStats(userId, score);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления пользователя
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const validatedData: UserUpdate = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        photoUrl: req.body.photoUrl,
        referralCode: req.body.referralCode,
        referredBy: req.body.referredBy,
        characterGender: req.body.characterGender,
        characterName: req.body.characterName,
      };

      const user = await storage.updateUser(userId, validatedData);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для установки прав администратора
  async setUserAdmin(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isAdmin } = req.body;

      const user = await storage.setUserAdmin(userId, isAdmin);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для мягкой блокировки пользователя
  async softDeleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await storage.softDeleteUser(userId);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для полного удаления пользователя
  async hardDeleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const success = await storage.hardDeleteUser(userId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для восстановления пользователя
  async restoreUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await storage.restoreUser(userId);

      if (user) {
        // Return only safe fields to prevent exposing sensitive data
        const safeUser = {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          totalPoints: user.totalPoints,
          gamesPlayed: user.gamesPlayed,
          bestScore: user.bestScore,
          isAdmin: user.isAdmin,
          btcBalance: user.btcBalance,
          ethBalance: user.ethBalance,
          usdtBalance: user.usdtBalance,
          btcBalanceSats: user.btcBalanceSats,
          ethBalanceWei: user.ethBalanceWei,
          usdtBalance: user.usdtBalance,
          referralCode: user.referralCode,
          directReferralsCount: user.directReferralsCount,
          completedLevels: user.completedLevels,
          ratingScore: user.ratingScore,
          totalScore: user.totalScore,
          totalWins: user.totalWins,
          currentWinStreak: user.currentWinStreak,
          bestWinStreak: user.bestWinStreak,
          totalCombo5Plus: user.totalCombo5Plus,
          characterGender: user.characterGender,
          characterName: user.characterName,
          characterEnergy: user.characterEnergy,
          characterHealthState: user.characterHealthState,
          characterMood: user.characterMood,
          bonusLives: user.bonusLives,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
        };
        res.json(safeUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения всех пользователей
  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Limit to 100 max
      const offset = parseInt(req.query.offset as string) || 0;
      const includeDeleted = req.query.includeDeleted === 'true';

      const users = await storage.getAllUsers(limit, offset, includeDeleted);
      const count = await storage.getUserCount(includeDeleted);

      // Sanitize users data
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        totalPoints: user.totalPoints,
        gamesPlayed: user.gamesPlayed,
        bestScore: user.bestScore,
        isAdmin: user.isAdmin,
        btcBalance: user.btcBalance,
        ethBalance: user.ethBalance,
        usdtBalance: user.usdtBalance,
        btcBalanceSats: user.btcBalanceSats,
        ethBalanceWei: user.ethBalanceWei,
        usdtBalance: user.usdtBalance,
        referralCode: user.referralCode,
        directReferralsCount: user.directReferralsCount,
        completedLevels: user.completedLevels,
        ratingScore: user.ratingScore,
        totalScore: user.totalScore,
        totalWins: user.totalWins,
        currentWinStreak: user.currentWinStreak,
        bestWinStreak: user.bestWinStreak,
        totalCombo5Plus: user.totalCombo5Plus,
        characterGender: user.characterGender,
        characterName: user.characterName,
        characterEnergy: user.characterEnergy,
        characterHealthState: user.characterHealthState,
        characterMood: user.characterMood,
        bonusLives: user.bonusLives,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt,
      }));

      res.json({
        users: sanitizedUsers,
        count,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения активных пользователей
  async getActiveUsers(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Limit to 100 max
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await storage.getActiveUsers(limit, offset);

      // Sanitize users data
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        totalPoints: user.totalPoints,
        gamesPlayed: user.gamesPlayed,
        bestScore: user.bestScore,
        isAdmin: user.isAdmin,
        btcBalance: user.btcBalance,
        ethBalance: user.ethBalance,
        usdtBalance: user.usdtBalance,
        btcBalanceSats: user.btcBalanceSats,
        ethBalanceWei: user.ethBalanceWei,
        usdtBalance: user.usdtBalance,
        referralCode: user.referralCode,
        directReferralsCount: user.directReferralsCount,
        completedLevels: user.completedLevels,
        ratingScore: user.ratingScore,
        totalScore: user.totalScore,
        totalWins: user.totalWins,
        currentWinStreak: user.currentWinStreak,
        bestWinStreak: user.bestWinStreak,
        totalCombo5Plus: user.totalCombo5Plus,
        characterGender: user.characterGender,
        characterName: user.characterName,
        characterEnergy: user.characterEnergy,
        characterHealthState: user.characterHealthState,
        characterMood: user.characterMood,
        bonusLives: user.bonusLives,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt,
      }));

      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения количества пользователей
  async getUserCount(req: Request, res: Response) {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const count = await storage.getUserCount(includeDeleted);
      
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения администраторов
  async getAdmins(req: Request, res: Response) {
    try {
      const admins = await storage.getAdmins();

      // Sanitize admin data
      const sanitizedAdmins = admins.map(admin => ({
        id: admin.id,
        telegramId: admin.telegramId,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        photoUrl: admin.photoUrl,
        totalPoints: admin.totalPoints,
        gamesPlayed: admin.gamesPlayed,
        bestScore: admin.bestScore,
        isAdmin: admin.isAdmin,
        btcBalance: admin.btcBalance,
        ethBalance: admin.ethBalance,
        usdtBalance: admin.usdtBalance,
        btcBalanceSats: admin.btcBalanceSats,
        ethBalanceWei: admin.ethBalanceWei,
        usdtBalance: admin.usdtBalance,
        referralCode: admin.referralCode,
        directReferralsCount: admin.directReferralsCount,
        completedLevels: admin.completedLevels,
        ratingScore: admin.ratingScore,
        totalScore: admin.totalScore,
        totalWins: admin.totalWins,
        currentWinStreak: admin.currentWinStreak,
        bestWinStreak: admin.bestWinStreak,
        totalCombo5Plus: admin.totalCombo5Plus,
        characterGender: admin.characterGender,
        characterName: admin.characterName,
        characterEnergy: admin.characterEnergy,
        characterHealthState: admin.characterHealthState,
        characterMood: admin.characterMood,
        bonusLives: admin.bonusLives,
        lastActivityAt: admin.lastActivityAt,
        createdAt: admin.createdAt,
      }));

      res.json(sanitizedAdmins);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения информации о рефералах
  async getReferralInfo(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { botUsername } = req.query;

      if (!botUsername) {
        return res.status(400).json({ error: 'botUsername query parameter is required' });
      }

      const referralInfo = await storage.getReferralInfo(userId, botUsername as string);
      
      res.json(referralInfo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек реферальной системы
  async getReferralConfig(req: Request, res: Response) {
    try {
      const config = await storage.getReferralConfig();
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления настроек реферальной системы
  async updateReferralConfig(req: Request, res: Response) {
    try {
      const config = await storage.updateReferralConfig(req.body);
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения реферальных наград пользователя
  async getUserReferralRewards(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const rewards = await storage.getUserReferralRewards(userId);
      
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения общей суммы реферальных бусин
  async getTotalReferralBeads(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const total = await storage.getTotalReferralBeads(userId);
      
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек переключателей фондов
  async getFundToggles(req: Request, res: Response) {
    try {
      const toggles = await storage.getFundToggles();
      
      res.json(toggles);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек домашнего аккаунта
  async getHouseAccount(req: Request, res: Response) {
    try {
      const houseAccount = await storage.getHouseAccount();
      
      res.json(houseAccount);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления настроек домашнего аккаунта
  async updateHouseAccount(req: Request, res: Response) {
    try {
      const houseAccount = await storage.updateHouseAccount(req.body);
      
      res.json(houseAccount);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек жизней
  async getLivesConfig(req: Request, res: Response) {
    try {
      const livesConfig = await storage.getLivesConfig();
      
      res.json(livesConfig);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления настроек жизней
  async updateLivesConfig(req: Request, res: Response) {
    try {
      const livesConfig = await storage.updateLivesConfig(req.body);
      
      res.json(livesConfig);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек игры
  async getGameConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const config = await storage.getGameConfig(key);
      
      if (config) {
        res.json(config);
      } else {
        res.status(404).json({ error: 'Config not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения всех настроек игры
  async getAllGameConfigs(req: Request, res: Response) {
    try {
      const configs = await storage.getAllGameConfigs();
      
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для установки настроек игры
  async setGameConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const config = await storage.setGameConfig({ ...req.body, key });
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для удаления настроек игры
  async deleteGameConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;

      await storage.deleteGameConfig(key);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения призового фонда
  async getPrizePool(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pool = await storage.getPrizePool(id);
      
      if (pool) {
        res.json(pool);
      } else {
        res.status(404).json({ error: 'Prize pool not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения активного призового фонда
  async getActivePrizePool(req: Request, res: Response) {
    try {
      const pool = await storage.getActivePrizePool();
      
      if (pool) {
        res.json(pool);
      } else {
        res.status(404).json({ error: 'No active prize pool found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения всех призовых фондов
  async getAllPrizePools(req: Request, res: Response) {
    try {
      const pools = await storage.getAllPrizePools();
      
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для создания призового фонда
  async createPrizePool(req: Request, res: Response) {
    try {
      const pool = await storage.createPrizePool(req.body);
      
      res.status(201).json(pool);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления призового фонда
  async updatePrizePool(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pool = await storage.updatePrizePool(id, req.body);
      
      if (pool) {
        res.json(pool);
      } else {
        res.status(404).json({ error: 'Prize pool not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для удаления призового фонда
  async deletePrizePool(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await storage.deletePrizePool(id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Utility function to check if user state has changed significantly (balances, energy, etc.)
function hasUserStateChanged(prevState: any, newState: any, thresholdFields: string[] = ['totalPoints', 'btcBalance', 'ethBalance', 'usdtBalance', 'characterEnergy', 'bonusLives']): boolean {
  for (const field of thresholdFields) {
    if (prevState[field] !== newState[field]) {
      return true;
    }
  }
  return false;
}

export const userController = new UserController();