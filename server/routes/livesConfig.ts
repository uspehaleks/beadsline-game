import type { Express } from "express";
import { storage } from "../storage.js";

export async function registerLivesConfigRoutes(app: Express) {
  // Get lives config
  app.get("/lives-config", async (req, res) => {
    try {
      const livesConfig = await storage.getLivesConfig();
      res.json(livesConfig);
    } catch (error) {
      console.error("Get lives config error:", error);
      res.status(500).json({ error: "Failed to get lives config" });
    }
  });
}