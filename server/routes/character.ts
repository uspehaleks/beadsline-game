// server/routes/character.ts
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
const charactersDir = path.join(uploadsDir, 'characters');

// В Vercel среде не создаем директории, так как файловая система только для чтения
if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(charactersDir)) fs.mkdirSync(charactersDir, { recursive: true });
}

// Используем /tmp директорию в Vercel среде для временных файлов
const getUploadDestination = (dir: string) => {
  if (process.env.VERCEL) {
    return '/tmp';
  }
  return dir;
};

const characterStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadDestination(charactersDir)),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: characterStorage });

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerCharacterRoutes(app: Express) {
  // Get character status
  app.get("/api/character/status", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const character = await storage.getCharacterByUserId(userId);
      
      res.json(character || { exists: false });
    } catch (error) {
      console.error("Get character status error:", error);
      res.status(500).json({ error: "Failed to get character status" });
    }
  });

  // Check if character exists
  app.get("/api/character/exists", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const character = await storage.getCharacterByUserId(userId);
      
      res.json({ exists: !!character });
    } catch (error) {
      console.error("Check character exists error:", error);
      res.status(500).json({ error: "Failed to check character" });
    }
  });

  // Create/update character
  app.post("/api/character", requireAuth, upload.single('avatar'), async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const characterData = {
        ...req.body,
        avatar: req.file ? req.file.filename : undefined
      };

      const characterSchema = z.object({
        name: z.string().min(1).max(50),
        gender: z.enum(['male', 'female', 'other']),
        energy: z.number().min(0).max(100).optional().default(100),
        healthState: z.string().optional(),
        mood: z.string().optional(),
        avatar: z.string().optional()
      });

      const validatedData = characterSchema.parse(characterData);

      // Check if character already exists
      let character = await storage.getCharacterByUserId(userId);
      if (character) {
        // Update existing character
        character = await storage.updateCharacter(userId, validatedData);
      } else {
        // Create new character
        character = await storage.createCharacter({
          userId,
          ...validatedData
        });
      }

      res.json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create/update character error:", error);
      res.status(500).json({ error: "Failed to create/update character" });
    }
  });

  // Get all character customization options
  app.get("/api/character/options", async (req, res) => {
    try {
      const categories = await storage.getAllAccessoryCategories();
      const baseBodies = await storage.getAllBaseBodies();
      
      res.json({
        categories,
        baseBodies
      });
    } catch (error) {
      console.error("Get character options error:", error);
      res.status(500).json({ error: "Failed to get character options" });
    }
  });
}