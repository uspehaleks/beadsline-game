import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, photoUrl } = req.body;
      
      if (!telegramId || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
      }
      
      req.session.userId = user.id;
      
      res.json(user);
    } catch (error) {
      console.error("Telegram auth error:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  app.post("/api/auth/guest", async (req, res) => {
    try {
      const { guestId } = req.body;
      
      if (!guestId) {
        return res.status(400).json({ error: "Missing guest ID" });
      }
      
      let user = await storage.getUserByUsername(guestId);
      
      if (!user) {
        user = await storage.createUser({
          username: guestId,
          firstName: "Guest",
        });
      }
      
      req.session.userId = user.id;
      
      res.json(user);
    } catch (error) {
      console.error("Guest auth error:", error);
      res.status(500).json({ error: "Failed to create guest user" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/scores", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const scoreData = {
        ...req.body,
        odUserId: userId,
      };
      
      const validatedData = insertGameScoreSchema.parse(scoreData);
      
      const score = await storage.createGameScore(validatedData);
      
      await storage.updateUserStats(userId, validatedData.score);
      
      res.json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid score data", details: error.errors });
      }
      console.error("Submit score error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  app.get("/api/scores/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const scores = await storage.getUserScores(userId, limit);
      res.json(scores);
    } catch (error) {
      console.error("Get scores error:", error);
      res.status(500).json({ error: "Failed to get scores" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  app.get("/api/config/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const config = await storage.getGameConfig(key);
      
      if (!config) {
        return res.status(404).json({ error: "Config not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Get config error:", error);
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  app.post("/api/config", requireAuth, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const config = await storage.setGameConfig({ key, value, description });
      res.json(config);
    } catch (error) {
      console.error("Set config error:", error);
      res.status(500).json({ error: "Failed to set config" });
    }
  });

  app.get("/api/prize-pool/active", async (req, res) => {
    try {
      const pool = await storage.getActivePrizePool();
      res.json(pool || null);
    } catch (error) {
      console.error("Get prize pool error:", error);
      res.status(500).json({ error: "Failed to get prize pool" });
    }
  });

  app.post("/api/prize-pool", requireAuth, async (req, res) => {
    try {
      const { name, totalAmount, isActive, startDate, endDate } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const pool = await storage.createPrizePool({
        name,
        totalAmount,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      res.json(pool);
    } catch (error) {
      console.error("Create prize pool error:", error);
      res.status(500).json({ error: "Failed to create prize pool" });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [userCount, scoreCount, activePrizePool] = await Promise.all([
        storage.getUserCount(),
        storage.getScoreCount(),
        storage.getActivePrizePool(),
      ]);
      
      res.json({
        totalUsers: userCount,
        totalGames: scoreCount,
        activePrizePool,
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const [users, total] = await Promise.all([
        storage.getAllUsers(limit, offset),
        storage.getUserCount(),
      ]);
      res.json({ users, total, limit, offset });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.patch("/api/admin/users/:id/admin", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;
      
      if (typeof isAdmin !== "boolean") {
        return res.status(400).json({ error: "isAdmin must be a boolean" });
      }
      
      const user = await storage.setUserAdmin(id, isAdmin);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Update user admin error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/admin/configs", requireAdmin, async (req, res) => {
    try {
      const configs = await storage.getAllGameConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Get admin configs error:", error);
      res.status(500).json({ error: "Failed to get configs" });
    }
  });

  app.post("/api/admin/configs", requireAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const config = await storage.setGameConfig({ key, value, description });
      res.json(config);
    } catch (error) {
      console.error("Set admin config error:", error);
      res.status(500).json({ error: "Failed to set config" });
    }
  });

  app.delete("/api/admin/configs/:key", requireAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      await storage.deleteGameConfig(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete admin config error:", error);
      res.status(500).json({ error: "Failed to delete config" });
    }
  });

  app.get("/api/admin/prize-pools", requireAdmin, async (req, res) => {
    try {
      const pools = await storage.getAllPrizePools();
      res.json(pools);
    } catch (error) {
      console.error("Get admin prize pools error:", error);
      res.status(500).json({ error: "Failed to get prize pools" });
    }
  });

  app.post("/api/admin/prize-pools", requireAdmin, async (req, res) => {
    try {
      const { name, totalAmount, isActive, startDate, endDate } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      const pool = await storage.createPrizePool({
        name,
        totalAmount: totalAmount || 0,
        isActive: isActive || false,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      res.json(pool);
    } catch (error) {
      console.error("Create admin prize pool error:", error);
      res.status(500).json({ error: "Failed to create prize pool" });
    }
  });

  app.patch("/api/admin/prize-pools/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, totalAmount, isActive, startDate, endDate } = req.body;
      
      const pool = await storage.updatePrizePool(id, {
        name,
        totalAmount,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      if (!pool) {
        return res.status(404).json({ error: "Prize pool not found" });
      }
      
      res.json(pool);
    } catch (error) {
      console.error("Update admin prize pool error:", error);
      res.status(500).json({ error: "Failed to update prize pool" });
    }
  });

  app.delete("/api/admin/prize-pools/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePrizePool(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete admin prize pool error:", error);
      res.status(500).json({ error: "Failed to delete prize pool" });
    }
  });

  app.get("/api/admin/scores", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const [scores, total] = await Promise.all([
        storage.getAllScores(limit, offset),
        storage.getScoreCount(),
      ]);
      res.json({ scores, total, limit, offset });
    } catch (error) {
      console.error("Get admin scores error:", error);
      res.status(500).json({ error: "Failed to get scores" });
    }
  });

  return httpServer;
}
