import { Express } from 'express';
import { storage } from '../storage';
import { requireAdmin } from '../middleware/auth';
import type { LevelConfig, InsertLevelConfig } from '../../shared/schema';

export async function registerLevelConfigRoutes(app: Express) {
  // Admin: Get all level configs
  app.get('/api/admin/level-configs', requireAdmin, async (req, res) => {
    try {
      const configs = await storage.getAllLevelConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Get level configs error:", error);
      res.status(500).json({ error: "Failed to get level configs" });
    }
  });

  // Admin: Get specific level config
  app.get('/api/admin/level-configs/:levelId', requireAdmin, async (req, res) => {
    try {
      const levelId = parseInt(req.params.levelId);
      const config = await storage.getLevelConfig(levelId);
      
      if (!config) {
        return res.status(404).json({ error: "Level config not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Get level config error:", error);
      res.status(500).json({ error: "Failed to get level config" });
    }
  });

  // Admin: Create level config
  app.post('/api/admin/level-configs', requireAdmin, async (req, res) => {
    try {
      const config: InsertLevelConfig = {
        levelId: req.body.levelId,
        config: {
          levelId: req.body.levelId,
          cryptoSpawnChance: req.body.cryptoSpawnChance,
          ballCount: req.body.ballCount,
          speed: req.body.speed,
          rewardMultiplier: req.body.rewardMultiplier,
          difficulty: req.body.difficulty,
        }
      };
      
      const newConfig = await storage.createLevelConfig(config);
      res.status(201).json(newConfig);
    } catch (error) {
      console.error("Create level config error:", error);
      res.status(500).json({ error: "Failed to create level config" });
    }
  });

  // Admin: Update level config
  app.put('/api/admin/level-configs/:levelId', requireAdmin, async (req, res) => {
    try {
      const levelId = parseInt(req.params.levelId);
      const updates: Partial<InsertLevelConfig> = {};
      
      if (req.body.cryptoSpawnChance !== undefined) updates.config = { ...updates.config, cryptoSpawnChance: req.body.cryptoSpawnChance };
      if (req.body.ballCount !== undefined) updates.config = { ...updates.config, ballCount: req.body.ballCount };
      if (req.body.speed !== undefined) updates.config = { ...updates.config, speed: req.body.speed };
      if (req.body.rewardMultiplier !== undefined) updates.config = { ...updates.config, rewardMultiplier: req.body.rewardMultiplier };
      if (req.body.difficulty !== undefined) updates.config = { ...updates.config, difficulty: req.body.difficulty };
      
      const updatedConfig = await storage.updateLevelConfig(levelId, updates);
      
      if (!updatedConfig) {
        return res.status(404).json({ error: "Level config not found" });
      }
      
      res.json(updatedConfig);
    } catch (error) {
      console.error("Update level config error:", error);
      res.status(500).json({ error: "Failed to update level config" });
    }
  });

  // Admin: Delete level config
  app.delete('/api/admin/level-configs/:levelId', requireAdmin, async (req, res) => {
    try {
      const levelId = parseInt(req.params.levelId);
      const deleted = await storage.deleteLevelConfig(levelId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Level config not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete level config error:", error);
      res.status(500).json({ error: "Failed to delete level config" });
    }
  });
}