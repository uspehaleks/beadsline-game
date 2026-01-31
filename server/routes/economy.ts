// server/routes/economy.ts
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage.js";

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerEconomyRoutes(app: Express) {
  // Get game economy config
  app.get("/game-economy", async (req, res) => {
    try {
      const economyConfig = await storage.getGameEconomyConfig();
      res.json(economyConfig);
    } catch (error) {
      console.error("Get game economy config error:", error);
      res.status(500).json({ error: "Failed to get game economy config" });
    }
  });
  // Get economy config
  app.get("/economy/config", async (req, res) => {
    try {
      const config = await storage.getEconomyConfig();
      res.json(config);
    } catch (error) {
      console.error("Get economy config error:", error);
      res.status(500).json({ error: "Failed to get economy config" });
    }
  });

  // Get user balances
  app.get("/economy/balances", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        beads: user.totalPoints,
        lives: user.bonusLives,
        btc: user.btcBalance,
        eth: user.ethBalance,
        usdt: user.usdtBalance,
        cryptoTickets: user.completedLevels >= 10 ? 1 : 0 // Пример: 1 крипто-билет за 10 уровней
      });
    } catch (error) {
      console.error("Get balances error:", error);
      res.status(500).json({ error: "Failed to get balances" });
    }
  });

  // Purchase with beads
  app.post("/api/economy/purchase", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const { itemType, itemId, cost } = req.body;

      const purchaseSchema = z.object({
        itemType: z.enum(['lives', 'boost', 'skin', 'accessory']),
        itemId: z.string(),
        cost: z.number().int().positive()
      });

      const validatedData = purchaseSchema.parse({ itemType, itemId, cost });

      // Check if user has enough beads
      const user = await storage.getUser(userId);
      if (!user || user.totalPoints < validatedData.cost) {
        return res.status(400).json({ error: "Insufficient beads" });
      }

      // Process purchase based on item type
      switch (validatedData.itemType) {
        case 'lives':
          // Add bonus lives
          await storage.updateUser(userId, {
            bonusLives: (user.bonusLives || 0) + 1
          });
          break;
          
        case 'boost':
          // Add boost to inventory
          await storage.addBoostToInventory(userId, validatedData.itemId, 1);
          break;
          
        case 'skin':
          // Unlock skin
          await storage.unlockUserSkin(userId, validatedData.itemId);
          break;
          
        case 'accessory':
          // Unlock accessory
          await storage.unlockUserAccessory(userId, validatedData.itemId);
          break;
      }

      // Deduct beads
      await storage.updateUser(userId, {
        totalPoints: user.totalPoints - validatedData.cost
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Purchase error:", error);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });

  // Get user inventory
  app.get("/api/economy/inventory", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const inventory = await storage.getUserInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ error: "Failed to get inventory" });
    }
  });
}