// server/routes/user.ts
import type { Express } from "express";
import { storage } from "../storage.js";

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerUserRoutes(app: Express) {
  // Get user by ID
  app.get("/users/:id", async (req, res) => {
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

  // Get user league
  app.get("/user/league", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const league = await storage.getLeagueBySlug(user.currentLeagueSlug || 'bronze');
      
      res.json(league);
    } catch (error) {
      console.error("Get user league error:", error);
      res.status(500).json({ error: "Failed to get user league" });
    }
  });

  // Get user referrals
  app.get("/api/user/referrals", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const referrals = await storage.getUserReferrals(userId);
      
      res.json(referrals);
    } catch (error) {
      console.error("Get user referrals error:", error);
      res.status(500).json({ error: "Failed to get referrals" });
    }
  });
}