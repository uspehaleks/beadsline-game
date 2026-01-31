// server/routes/referral.ts
import type { Express } from "express";
import { storage } from "../storage.js";

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerReferralRoutes(app: Express) {
  // Get referral config
  app.get("/api/referral/config", async (req, res) => {
    try {
      const config = await storage.getReferralConfig();
      res.json(config);
    } catch (error) {
      console.error("Get referral config error:", error);
      res.status(500).json({ error: "Failed to get referral config" });
    }
  });

  // Get user referral info
  app.get("/api/referral/info", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const referralInfo = await storage.getUserReferralInfo(userId);
      res.json(referralInfo);
    } catch (error) {
      console.error("Get referral info error:", error);
      res.status(500).json({ error: "Failed to get referral info" });
    }
  });

  // Claim referral reward
  app.post("/api/referral/claim", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const reward = await storage.claimReferralReward(userId);
      
      if (!reward) {
        return res.status(400).json({ error: "No reward available" });
      }
      
      res.json(reward);
    } catch (error) {
      console.error("Claim referral reward error:", error);
      res.status(500).json({ error: "Failed to claim referral reward" });
    }
  });
}