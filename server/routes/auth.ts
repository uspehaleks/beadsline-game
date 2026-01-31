// server/routes/auth.ts
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage.js";

export function registerAuthRoutes(app: Express) {
  // Telegram Auth
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramInitData } = req.body;

      if (!telegramInitData) {
        return res.status(400).json({ error: "Telegram init data is required" });
      }

      // Verify Telegram auth data
      const verifiedData = await storage.verifyTelegramAuth(telegramInitData);
      if (!verifiedData) {
        return res.status(401).json({ error: "Invalid Telegram auth data" });
      }

      // Find or create user
      let user = await storage.getUserByTelegramId(verifiedData.id.toString());
      if (!user) {
        user = await storage.createUser({
          telegramId: verifiedData.id.toString(),
          username: verifiedData.username || null,
          firstName: verifiedData.first_name || null,
          lastName: verifiedData.last_name || null,
          photoUrl: verifiedData.photo_url || null,
          referralCode: null,
          referredBy: null
        });
      } else {
        // Update user info if changed
        const updateData: any = {};
        if (verifiedData.username && verifiedData.username !== user.username) {
          updateData.username = verifiedData.username;
        }
        if (verifiedData.first_name && verifiedData.first_name !== user.firstName) {
          updateData.firstName = verifiedData.first_name;
        }
        if (verifiedData.last_name && verifiedData.last_name !== user.lastName) {
          updateData.lastName = verifiedData.last_name;
        }
        if (verifiedData.photo_url && verifiedData.photo_url !== user.photoUrl) {
          updateData.photoUrl = verifiedData.photo_url;
        }

        if (Object.keys(updateData).length > 0) {
          await storage.updateUser(user.id, updateData);
        }
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username || user.firstName || 'User';

      res.json({ success: true, user: { id: user.id, ...user } });
    } catch (error) {
      console.error("Telegram auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Guest Auth
  app.post("/api/auth/guest", async (_req, res) => {
    try {
      // Create temporary guest user
      const guestUser = await storage.createGuestUser();
      
      // Set session
      _req.session.userId = guestUser.id;
      _req.session.username = guestUser.username;

      res.json({ success: true, user: { id: guestUser.id, ...guestUser } });
    } catch (error) {
      console.error("Guest auth error:", error);
      res.status(500).json({ error: "Guest authentication failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session = null;
      res.json({ success: true });
    });
  });
}