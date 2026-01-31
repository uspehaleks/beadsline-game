// server/routes/admin.ts
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

// Middleware для проверки прав администратора
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export function registerAdminRoutes(app: Express) {
  // Admin login request code
  app.post("/admin/request-code", async (req, res) => {
    try {
      const { username } = req.body;

      const adminLoginSchema = z.object({
        username: z.string().min(1)
      });

      const { username: adminUsername } = adminLoginSchema.parse({ username });

      // Проверяем, является ли пользователь администратором
      const user = await storage.getUserByUsername(adminUsername);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Генерируем код подтверждения
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      req.session.adminVerificationCode = verificationCode;
      req.session.adminUserId = user.id;

      // В реальном приложении здесь отправляется код (SMS, email, etc.)
      // Пока просто записываем в лог
      console.log(`Admin verification code for ${adminUsername}: ${verificationCode}`);

      res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Admin login request error:", error);
      res.status(500).json({ error: "Failed to request admin code" });
    }
  });

  // Admin login verify code
  app.post("/admin/verify-code", async (req, res) => {
    try {
      const { code } = req.body;
      
      const adminVerifySchema = z.object({
        code: z.string().length(6)
      });
      
      const { code: verificationCode } = adminVerifySchema.parse({ code });
      
      // Проверяем код
      if (req.session.adminVerificationCode !== verificationCode) {
        return res.status(403).json({ error: "Invalid code" });
      }
      
      // Устанавливаем права администратора
      req.session.isAdmin = true;
      
      // Очищаем временные данные
      delete req.session.adminVerificationCode;
      
      res.json({ success: true, message: "Admin access granted" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Admin verify code error:", error);
      res.status(500).json({ error: "Failed to verify admin code" });
    }
  });

  // Get all users
  app.get("/admin/users", requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0, search } = req.query;

      const users = await storage.getAllUsers(
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0,
        search as string
      );

      res.json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Update user
  app.put("/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Валидация данных обновления
      const userUpdateSchema = z.object({
        totalPoints: z.number().optional(),
        isAdmin: z.boolean().optional(),
        isBanned: z.boolean().optional(),
        bonusLives: z.number().optional(),
        btcBalance: z.number().optional(),
        ethBalance: z.number().optional(),
        usdtBalance: z.number().optional(),
      });
      
      const validatedData = userUpdateSchema.parse(updateData);
      
      const updatedUser = await storage.updateUser(id, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
}