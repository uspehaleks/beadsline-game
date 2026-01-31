import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { optimizeAvatar } from "../lib/imageOptimizer";

// Конфигурация для загрузки аватаров
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
const charactersDir = path.join(uploadsDir, 'characters');
const accessoriesDir = path.join(uploadsDir, 'accessories');

// В Vercel среде не создаем директории, так как файловая система только для чтения
if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(charactersDir)) fs.mkdirSync(charactersDir, { recursive: true });
  if (!fs.existsSync(accessoriesDir)) fs.mkdirSync(accessoriesDir, { recursive: true });
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
    cb(null, uniqueSuffix + '.webp'); // Всегда сохраняем как WebP
  }
});

const accessoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadDestination(accessoriesDir)),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.webp'); // Всегда сохраняем как WebP
  }
});

const uploadCharacter = multer({
  storage: characterStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, WEBP, GIF images are allowed'));
    }
  }
});

const uploadAccessory = multer({
  storage: accessoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, WEBP, GIF images are allowed'));
    }
  }
});

export class ImageUploadController {
  // Метод для загрузки аватара персонажа с оптимизацией
  async uploadCharacterAvatar(req: Request, res: Response) {
    try {
      // Используем middleware для загрузки файла
      const uploadMiddleware = uploadCharacter.single('avatar');
      
      // Обертываем middleware в Promise для использования с async/await
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Оптимизируем изображение
      const optimizedBuffer = await optimizeAvatar(req.file.buffer);
      
      // Заменяем содержимое файла оптимизированным изображением
      const fs = await import('fs');
      const filePath = req.file.path;
      await fs.promises.writeFile(filePath, optimizedBuffer);
      
      res.json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/characters/${req.file.filename}`,
        originalName: req.file.originalname,
        size: optimizedBuffer.length,
      });
    } catch (error) {
      console.error('Upload character avatar error:', error);
      res.status(500).json({ error: 'Failed to upload character avatar' });
    }
  }

  // Метод для загрузки изображения аксессуара с оптимизацией
  async uploadAccessoryImage(req: Request, res: Response) {
    try {
      // Используем middleware для загрузки файла
      const uploadMiddleware = uploadAccessory.single('image');
      
      // Обертываем middleware в Promise для использования с async/await
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Оптимизируем изображение
      const optimizedBuffer = await optimizeAvatar(req.file.buffer);
      
      // Заменяем содержимое файла оптимизированным изображением
      const fs = await import('fs');
      const filePath = req.file.path;
      await fs.promises.writeFile(filePath, optimizedBuffer);
      
      res.json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/accessories/${req.file.filename}`,
        originalName: req.file.originalname,
        size: optimizedBuffer.length,
      });
    } catch (error) {
      console.error('Upload accessory image error:', error);
      res.status(500).json({ error: 'Failed to upload accessory image' });
    }
  }

  // Middleware для загрузки аватара персонажа
  getCharacterUploadMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      uploadCharacter.single('avatar')(req, res, next);
    };
  }

  // Middleware для загрузки изображения аксессуара
  getAccessoryUploadMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      uploadAccessory.single('image')(req, res, next);
    };
  }
}

export const imageUploadController = new ImageUploadController();