import type { Request, Response } from "express";
import { storage } from "../storage.js";
import { z } from "zod";
import {
  buyBoostSchema,
  purchaseBoostPackageSchema,
  createCryptoPaymentRequestSchema,
  type InsertBeadsTransaction,
  type Boost,
  type GameEconomyConfig
} from "../../shared/schema.js";

// In-memory caches for economy data
let boostsCache: Boost[] | null = null;
let economyConfigCache: GameEconomyConfig | null = null;
let boostsCacheTimestamp: number | null = null;
let economyConfigCacheTimestamp: number | null = null;

// Cache expiration time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export class EconomyController {
  // Метод для покупки буста
  async buyBoost(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Валидируем входящие данные
      const validatedData = buyBoostSchema.parse(req.body);

      const result = await storage.buyBoost(userId, validatedData.boostId, validatedData.quantity || 1);

      if (result.success) {
        res.json({ success: true, newBalance: result.newBalance });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для покупки пакета бустов
  async purchaseBoostPackage(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Валидируем входящие данные
      const validatedData = purchaseBoostPackageSchema.parse(req.body);

      const result = await storage.purchaseBoostPackage(userId, validatedData.packageId, validatedData.telegramPaymentId);

      if (result.success) {
        res.json({ success: true, purchase: result.purchase });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для получения бустов пользователя
  async getUserBoosts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const boosts = await storage.getUserBoostInventory(userId);
      
      res.json(boosts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения всех бустов
  async getAllBoosts(req: Request, res: Response) {
    try {
      // Check if cache is valid
      const now = Date.now();
      if (boostsCache && boostsCacheTimestamp && (now - boostsCacheTimestamp < CACHE_TTL)) {
        // Return cached data with cache headers
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.json(boostsCache);
        return;
      }

      // Fetch fresh data from storage
      const boosts = await storage.getBoosts();

      // Update cache
      boostsCache = boosts;
      boostsCacheTimestamp = now;

      // Return data with cache headers
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
      res.json(boosts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек экономики
  async getEconomyConfig(req: Request, res: Response) {
    try {
      // Check if cache is valid
      const now = Date.now();
      if (economyConfigCache && economyConfigCacheTimestamp && (now - economyConfigCacheTimestamp < CACHE_TTL)) {
        // Return cached data with cache headers
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.json(economyConfigCache);
        return;
      }

      // Fetch fresh data from storage
      const config = await storage.getGameEconomyConfig();

      // Update cache
      economyConfigCache = config;
      economyConfigCacheTimestamp = now;

      // Return data with cache headers
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления настроек экономики
  async updateEconomyConfig(req: Request, res: Response) {
    try {
      const config = await storage.updateGameEconomyConfig(req.body);

      // Invalidate the economy config cache
      economyConfigCache = null;
      economyConfigCacheTimestamp = null;

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения балансов администратора
  async getAdminCryptoBalances(req: Request, res: Response) {
    try {
      const balances = await storage.getAdminCryptoBalances();
      
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления балансов администратора
  async updateAdminCryptoBalances(req: Request, res: Response) {
    try {
      const balances = await storage.setAdminCryptoBalances(req.body);
      
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения настроек фонда USDT
  async getUsdtFundSettings(req: Request, res: Response) {
    try {
      const settings = await storage.getUsdtFundSettings();
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для обновления настроек фонда USDT
  async updateUsdtFundSettings(req: Request, res: Response) {
    try {
      const settings = await storage.updateUsdtFundSettings(req.body);
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения статистики фонда USDT
  async getUsdtFundStats(req: Request, res: Response) {
    try {
      const stats = await storage.getUsdtFundStats();
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения транзакций бусин
  async getBeadsTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await storage.getBeadsTransactionsWithUsers({ limit, offset });
      
      res.json({
        transactions: result.transactions,
        total: result.total,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для создания транзакции бусин
  async createBeadsTransaction(req: Request, res: Response) {
    try {
      const validatedData: InsertBeadsTransaction = {
        userId: req.body.userId,
        type: req.body.type,
        amount: req.body.amount,
        balanceBefore: req.body.balanceBefore,
        balanceAfter: req.body.balanceAfter,
        description: req.body.description,
        gameScoreId: req.body.gameScoreId || null,
      };

      const transaction = await storage.createBeadsTransaction(validatedData);
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для запроса крипто-платежа
  async createCryptoPaymentRequest(req: Request, res: Response) {
    try {
      const validatedData = createCryptoPaymentRequestSchema.parse({
        userId: req.params.userId,
        packageId: req.body.packageId,
        network: req.body.network,
        priceUsd: req.body.priceUsd,
      });

      const payment = await storage.createCryptoPaymentRequest(
        validatedData.userId,
        validatedData.packageId,
        validatedData.network,
        validatedData.priceUsd
      );
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для получения ожидающих крипто-платежей
  async getPendingCryptoPayments(req: Request, res: Response) {
    try {
      const payments = await storage.getPendingCryptoPayments();
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для подтверждения крипто-платежа
  async confirmCryptoPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { adminId, note } = req.body;

      const result = await storage.confirmCryptoPayment(paymentId, adminId, note);
      
      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для отклонения крипто-платежа
  async rejectCryptoPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { adminId, note } = req.body;

      const result = await storage.rejectCryptoPayment(paymentId, adminId, note);

      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для инвалидации кэша бустов (вызывается когда админ меняет цены)
  async invalidateBoostsCache(req: Request, res: Response) {
    try {
      // Clear the boosts cache
      boostsCache = null;
      boostsCacheTimestamp = null;

      res.json({ success: true, message: 'Boosts cache invalidated' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для принудительного обновления кэша бустов
  async refreshBoostsCache(req: Request, res: Response) {
    try {
      // Fetch fresh data from storage
      const boosts = await storage.getBoosts();

      // Update cache
      boostsCache = boosts;
      boostsCacheTimestamp = Date.now();

      res.json({ success: true, message: 'Boosts cache refreshed', count: boosts.length });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const economyController = new EconomyController();

// Export cache invalidation functions for use in routes
export function invalidateBoostsCache() {
  boostsCache = null;
  boostsCacheTimestamp = null;
}

export function invalidateEconomyConfigCache() {
  economyConfigCache = null;
  economyConfigCacheTimestamp = null;
}

// Export cache access for debugging/testing if needed
export function getBoostsCache() {
  return boostsCache;
}

export function getEconomyConfigCache() {
  return economyConfigCache;
}