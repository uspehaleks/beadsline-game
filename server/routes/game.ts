// server/routes/game.ts
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertGameScoreSchema } from "../../shared/schema.js";

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerGameRoutes(app: Express) {
  // Get gameplay config
  app.get("/gameplay-config", async (req, res) => {
    try {
      // Define default gameplay config
      const DEFAULT_GAMEPLAY_CONFIG = {
        gameplay: {
          baseSpeed: 1,
          maxSpeed: 3,
          ballSpacing: 40,
          lives: 3,
          bonusLives: 1
        },
        economy: {
          pointsPerBall: 10,
          comboMultiplier: 1.5,
          levelBonus: 100
        },
        crypto: {
          btcEnabled: true,
          ethEnabled: true,
          usdtEnabled: true,
          spawnRate: 0.05
        },
        levels: {
          easyMultiplier: 1,
          mediumMultiplier: 1.5,
          hardMultiplier: 2
        }
      };

      // Get gameplay config from storage (with fallback to default if none exists)
      const gameplayConfig = await storage.getGameplayConfig();

      res.json(gameplayConfig || DEFAULT_GAMEPLAY_CONFIG);
    } catch (error) {
      console.error("Get gameplay config error:", error);
      res.status(500).json({ error: "Failed to get gameplay config" });
    }
  });
  // Start game session
  app.post("/api/game/start-session", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;

      // Get user to validate they exist
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Define default game config
      const DEFAULT_GAME_CONFIG = {
        id: "default",
        key: "default",
        value: {
          gameplay: {
            baseSpeed: 1,
            maxSpeed: 3,
            ballSpacing: 40,
            lives: 3,
            bonusLives: 1
          },
          economy: {
            pointsPerBall: 10,
            comboMultiplier: 1.5,
            levelBonus: 100
          },
          crypto: {
            btcEnabled: true,
            ethEnabled: true,
            usdtEnabled: true,
            spawnRate: 0.05
          },
          levels: {
            easyMultiplier: 1,
            mediumMultiplier: 1.5,
            hardMultiplier: 2
          }
        },
        description: "Default game configuration",
        updatedAt: new Date()
      };

      // Get game config (with fallback to default if none exists)
      const allConfigs = await storage.getAllGameConfigs();
      let gameConfig = allConfigs && allConfigs.length > 0 ? allConfigs[0] : null;

      if (!gameConfig) {
        console.warn("No game config found, using default config");
        // Using a default config as fallback
        gameConfig = DEFAULT_GAME_CONFIG;
      }

      // Create game session
      const session = await storage.createGameSession({
        userId: userId,
        levelId: req.body.levelId || 1,
        config: gameConfig.value || gameConfig // Use the value property if available, otherwise use the whole object
      });

      res.json(session);
    } catch (error) {
      console.error("Start game session error:", error);
      console.error("Full error details:", error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error);
      res.status(500).json({ error: "Failed to start session", details: process.env.NODE_ENV === 'development' ? error : undefined });
    }
  });

  // Submit score
  app.post("/api/scores", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const validatedData = insertGameScoreSchema.parse({
        userId,
        ...req.body,
        score: Number(req.body.score),
        level: Number(req.body.level),
        duration: Number(req.body.duration),
        combo: Number(req.body.combo),
        beads: Number(req.body.beads),
        accuracy: Number(req.body.accuracy)
      });

      // Anti-cheat checks
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if duration is reasonable (allowing for some network latency)
      const DURATION_TOLERANCE_SECONDS = 5;
      const serverCalculatedDuration = Date.now() - new Date(validatedData.playStartedAt).getTime();
      const clientDurationSeconds = validatedData.duration;
      const serverDurationSeconds = serverCalculatedDuration / 1000;

      if (clientDurationSeconds > serverDurationSeconds + DURATION_TOLERANCE_SECONDS) {
        console.warn(`[ANTI-CHEAT] Time manipulation detected for user ${userId}. Client duration: ${clientDurationSeconds}s, Server duration: ${serverDurationSeconds}s`);
        return res.status(400).json({ error: "Invalid duration" });
      }

      // Validate score based on level and other factors
      const levelConfig = await storage.getLevelConfig(validatedData.levelId);
      if (levelConfig) {
        // Basic score validation
        const maxPossibleScore = levelConfig.targetScore * 3; // Allow some margin
        if (validatedData.score > maxPossibleScore) {
          console.warn(`[ANTI-CHEAT] Impossible score detected for user ${userId}: ${validatedData.score} on level ${validatedData.levelId}`);
          return res.status(400).json({ error: "Invalid score" });
        }
      }

      const score = await storage.saveGameScore(validatedData);
      res.json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Submit score error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  // Get user scores
  app.get("/api/scores/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const scores = await storage.getUserScores(userId);
      res.json(scores);
    } catch (error) {
      console.error("Get user scores error:", error);
      res.status(500).json({ error: "Failed to get scores" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { limit = 100, offset = 0, league } = req.query;
      const leaderboard = await storage.getGlobalLeaderboard(
        parseInt(limit as string) || 100,
        parseInt(offset as string) || 0,
        league as string
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Get friend leaderboard
  app.get("/api/leaderboard/friends", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const { limit = 100, offset = 0 } = req.query;
      
      const leaderboard = await storage.getFriendLeaderboard(
        userId,
        parseInt(limit as string) || 100,
        parseInt(offset as string) || 0
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Get friend leaderboard error:", error);
      res.status(500).json({ error: "Failed to get friend leaderboard" });
    }
  });
}