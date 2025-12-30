import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";

const objectStorageService = new ObjectStorageService();

const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
const charactersDir = path.join(uploadsDir, 'characters');
const accessoriesDir = path.join(uploadsDir, 'accessories');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(charactersDir)) fs.mkdirSync(charactersDir, { recursive: true });
if (!fs.existsSync(accessoriesDir)) fs.mkdirSync(accessoriesDir, { recursive: true });

const characterStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, charactersDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const accessoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, accessoriesDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

function formatNumbersInObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'number') {
    if (obj === 0) return 0;
    if (Math.abs(obj) < 0.0001 || Math.abs(obj) >= 1e15) {
      return obj.toFixed(20).replace(/\.?0+$/, '');
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(formatNumbersInObject);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = formatNumbersInObject(obj[key]);
    }
    return result;
  }
  return obj;
}

async function initializeDefaultGameSkins(): Promise<string | null> {
  // Check if Golden Boost skin already exists
  let goldenSkin = await storage.getGameSkinByName('golden_boost');
  
  if (!goldenSkin) {
    try {
      goldenSkin = await storage.createGameSkin({
        name: 'golden_boost',
        nameRu: 'Золотой Буст',
        descriptionRu: 'Эксклюзивный золотой скин для VIP-игроков. Превращает все шарики в золотые с особыми эффектами.',
        previewImageUrl: null, // Will be set by admin later or use placeholder
        skinType: 'game',
        colorPrimary: '#FFD700', // Gold
        colorSecondary: '#FFA500', // Orange-gold
        isActive: true,
      });
      console.log('Created Golden Boost skin');
    } catch (error) {
      console.error('Failed to create Golden Boost skin:', error);
      return null;
    }
  }
  
  return goldenSkin.id;
}

async function initializeDefaultBoostPackages() {
  // First ensure Golden Boost skin exists
  const goldenSkinId = await initializeDefaultGameSkins();
  
  const existingPackages = await storage.getBoostPackages(false);
  const existingNames = new Set(existingPackages.map(p => p.name));
  
  const defaultPackages = [
    {
      name: 'starter',
      nameRu: 'СТАРТОВЫЙ',
      boostsPerType: 3,
      priceStars: 50,
      originalPriceStars: null,
      badge: null,
      badgeText: null,
      bonusLives: 0,
      bonusSkinId: null,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'basic',
      nameRu: 'БАЗОВЫЙ',
      boostsPerType: 7,
      priceStars: 100,
      originalPriceStars: 117,
      badge: null,
      badgeText: null,
      bonusLives: 0,
      bonusSkinId: null,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'mega',
      nameRu: 'МЕГА-НАБОР',
      boostsPerType: 15,
      priceStars: 200,
      originalPriceStars: 250,
      badge: 'hot',
      badgeText: 'ХИТ ПРОДАЖ!',
      bonusLives: 3,
      bonusSkinId: null,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'vip',
      nameRu: 'VIP-НАБОР',
      boostsPerType: 40,
      priceStars: 350,
      originalPriceStars: 500,
      badge: 'best_value',
      badgeText: 'VIP',
      bonusLives: 10,
      bonusSkinId: goldenSkinId, // Assign Golden Boost skin to VIP package
      sortOrder: 4,
      isActive: true,
    },
  ];
  
  let created = 0;
  for (const pkg of defaultPackages) {
    if (existingNames.has(pkg.name)) {
      // Update VIP package to add skin if it wasn't set before
      if (pkg.name === 'vip' && goldenSkinId) {
        const vipPkg = existingPackages.find(p => p.name === 'vip');
        if (vipPkg && !vipPkg.bonusSkinId) {
          await storage.updateBoostPackage(vipPkg.id, { bonusSkinId: goldenSkinId });
          console.log('Updated VIP package with Golden Boost skin');
        }
      }
      continue;
    }
    try {
      await storage.createBoostPackage(pkg);
      console.log(`Created boost package: ${pkg.nameRu}`);
      created++;
    } catch (error) {
      console.error(`Failed to create package ${pkg.name}:`, error);
    }
  }
  
  if (created > 0) {
    console.log(`Initialized ${created} default boost packages`);
  }
}

// Debug Logs Storage (in-memory, for game debugging)
const MAX_DEBUG_LOGS = 200;
const serverDebugLogs: string[] = [];

function addDebugLog(log: string) {
  serverDebugLogs.push(log);
  if (serverDebugLogs.length > MAX_DEBUG_LOGS) {
    serverDebugLogs.shift();
  }
}

// Telegram Bot Types
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  date: number;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// Production Mini App URL - HARDCODED to avoid dev domain issues
const PRODUCTION_APP_URL = 'https://igri--uspehaleks.replit.app';

// App URL for Mini App - always use production URL for Telegram bot
function getAppUrl(): string {
  return PRODUCTION_APP_URL;
}

async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log("TELEGRAM_BOT_TOKEN not configured, falling back to console");
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    if (!result.ok) {
      console.error("Telegram API error:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

async function sendTelegramMessageWithButton(
  chatId: number, 
  text: string, 
  buttonText: string, 
  webAppUrl: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log("TELEGRAM_BOT_TOKEN not configured");
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: buttonText,
              web_app: { url: webAppUrl }
            }
          ]]
        }
      })
    });
    
    const result = await response.json();
    if (!result.ok) {
      console.error("Telegram API error:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

async function handleTelegramCommand(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text || '';
  const parts = text.split(' ');
  const command = parts[0].toLowerCase();
  const referralCode = parts[1]?.trim() || ''; // Extract referral code from /start REFERRAL_CODE
  const appUrl = getAppUrl();
  
  // Build app URL with referral code if present
  // Use hash fragment since Telegram doesn't pass query params to initDataUnsafe for web_app buttons
  const getAppUrlWithReferral = (code: string) => {
    if (code) {
      return `${appUrl}#ref=${code}`;
    }
    return appUrl;
  };
  
  switch (command) {
    case '/start':
      const startAppUrl = getAppUrlWithReferral(referralCode);
      
      // Log referral code for debugging
      if (referralCode) {
        console.log(`[Referral] User ${chatId} opened with referral code: ${referralCode}`);
      }
      
      await sendTelegramMessageWithButton(
        chatId,
        `<b>Добро пожаловать в BeadLine!</b>\n` +
        `Матч-3 аркада с шариками и крипто-бонусами.\n\n` +
        `<b>Что делать:</b>\n` +
        `• Стреляй по линии шаров и собирай 3+ одного цвета.\n` +
        `• Лови BTC, ETH и USDT-шарики для дополнительных поинтов.\n` +
        `• Бей свои рекорды и поднимайся в таблице лидеров.\n\n` +
        `Нажми кнопку ниже, чтобы начать игру.`,
        '🎮 Играть',
        startAppUrl
      );
      break;
      
    case '/play':
    case '/game':
      await sendTelegramMessageWithButton(
        chatId,
        `<b>Готовы к игре?</b>\n\n` +
        `Нажмите кнопку, чтобы запустить Beads Line!`,
        '🎮 Играть сейчас',
        appUrl
      );
      break;
      
    case '/leaderboard':
    case '/top':
      const leaderboard = await storage.getLeaderboard(10);
      if (leaderboard.length === 0) {
        await sendTelegramMessage(
          chatId.toString(),
          `<b>Таблица лидеров пуста</b>\n\nБудьте первым, кто сыграет!`
        );
      } else {
        let leaderboardText = `<b>🏆 Топ-10 игроков:</b>\n\n`;
        leaderboard.forEach((player, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          const name = player.username || 'Игрок';
          leaderboardText += `${medal} <b>${name}</b> — ${player.bestScore} очков\n`;
        });
        await sendTelegramMessageWithButton(
          chatId,
          leaderboardText,
          '🎮 Играть',
          appUrl
        );
      }
      break;
      
    case '/help':
      await sendTelegramMessage(
        chatId.toString(),
        `<b>Помощь по Beads Line:</b>\n\n` +
        `<b>Команды:</b>\n` +
        `/start - Начать игру\n` +
        `/play - Запустить игру\n` +
        `/leaderboard - Таблица лидеров\n` +
        `/help - Эта справка\n\n` +
        `<b>Как играть:</b>\n` +
        `- Целься и стреляй шариками\n` +
        `- Собирай 3+ шарика одного цвета\n` +
        `- Крипто-шарики дают бонусы:\n` +
        `  BTC = +500 очков\n` +
        `  ETH = +300 очков\n` +
        `  USDT = +200 очков\n` +
        `- Набери 5000+ очков за 45 секунд!`
      );
      break;
      
    default:
      if (text.startsWith('/')) {
        await sendTelegramMessage(
          chatId.toString(),
          `Неизвестная команда. Используйте /help для списка команд.`
        );
      }
      break;
  }
}

async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log("TELEGRAM_BOT_TOKEN not configured");
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });
    
    const result = await response.json();
    console.log("Set webhook result:", result);
    return result.ok;
  } catch (error) {
    console.error("Failed to set webhook:", error);
    return false;
  }
}

async function setTelegramBotCommands(): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Начать игру' },
          { command: 'play', description: 'Играть сейчас' },
          { command: 'leaderboard', description: 'Таблица лидеров' },
          { command: 'help', description: 'Помощь' }
        ]
      })
    });
    
    const result = await response.json();
    console.log("Set commands result:", result);
    return result.ok;
  } catch (error) {
    console.error("Failed to set commands:", error);
    return false;
  }
}

interface AdminCode {
  code: string;
  expiresAt: number;
  attempts: number;
  lastRequestedAt: number;
}

interface IpRateLimit {
  count: number;
  firstAttempt: number;
}

interface ActiveSession {
  sessionId: string;
  startedAt: number;
  userId?: number;
}

const adminCodes = new Map<string, AdminCode>();
const ipRateLimits = new Map<string, IpRateLimit>();
const activeSessions = new Map<string, ActiveSession>();

const SESSION_TIMEOUT = 3 * 60 * 1000;

function cleanupStaleSessions() {
  const now = Date.now();
  Array.from(activeSessions.entries()).forEach(([sessionId, session]) => {
    if (now - session.startedAt > SESSION_TIMEOUT) {
      activeSessions.delete(sessionId);
    }
  });
}

function getActivePlayersCount(): number {
  cleanupStaleSessions();
  return activeSessions.size;
}

const IP_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const IP_RATE_LIMIT_MAX = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanupExpiredCodes() {
  const now = Date.now();
  Array.from(adminCodes.entries()).forEach(([username, data]) => {
    if (data.expiresAt < now) {
      adminCodes.delete(username);
    }
  });
  Array.from(ipRateLimits.entries()).forEach(([ip, data]) => {
    if (now - data.firstAttempt > IP_RATE_LIMIT_WINDOW) {
      ipRateLimits.delete(ip);
    }
  });
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = ipRateLimits.get(ip);
  
  if (!limit) {
    ipRateLimits.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  
  if (now - limit.firstAttempt > IP_RATE_LIMIT_WINDOW) {
    ipRateLimits.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  
  if (limit.count >= IP_RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

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
  
  const express = await import('express');
  app.use('/uploads', express.default.static(uploadsDir));

  initializeDefaultBoostPackages().catch(err => {
    console.error('Failed to initialize default boost packages:', err);
  });
  
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, photoUrl, startParam } = req.body;
      
      if (!telegramId || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      let user = await storage.getUserByTelegramId(telegramId);
      let isNewUser = false;
      
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
        isNewUser = true;
        
        if (startParam && typeof startParam === 'string' && startParam.length > 0) {
          try {
            const referralSuccess = await storage.processReferral(user.id, startParam);
            if (referralSuccess) {
              console.log(`New user ${username} referred by code: ${startParam}`);
              user = await storage.getUser(user.id) || user;
            }
          } catch (refError) {
            console.error("Referral processing error:", refError);
          }
        }
      }
      
      req.session.userId = user.id;
      
      res.json({ ...user, isNewUser });
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

  app.post("/api/auth/admin/request-code", async (req, res) => {
    try {
      cleanupExpiredCodes();
      
      const clientIp = getClientIp(req);
      
      if (!checkIpRateLimit(clientIp)) {
        return res.status(429).json({ error: "Слишком много попыток. Попробуйте позже" });
      }
      
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Имя пользователя обязательно" });
      }
      
      const user = await storage.getUserByUsername(username);
      const now = Date.now();
      
      if (!user || !user.isAdmin) {
        console.log(`Admin code request failed for unknown/non-admin user: ${username} from IP: ${clientIp}`);
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return res.json({ success: true, message: "Если аккаунт существует, код будет отправлен" });
      }
      
      const existing = adminCodes.get(username);
      
      if (existing && now - existing.lastRequestedAt < 60000) {
        return res.status(429).json({ error: "Подождите минуту перед повторным запросом кода" });
      }
      
      const code = generateCode();
      const expiresAt = now + 5 * 60 * 1000;
      
      adminCodes.set(username, {
        code,
        expiresAt,
        attempts: 0,
        lastRequestedAt: now,
      });
      
      if (user.telegramId) {
        const message = `🔐 <b>Код для входа в админ-панель Beads Line:</b>\n\n<code>${code}</code>\n\nКод действителен 5 минут.`;
        const sent = await sendTelegramMessage(user.telegramId, message);
        if (sent) {
          console.log(`Admin code sent to Telegram for user: ${username}`);
        } else {
          console.log(`Failed to send Telegram, code for ${username}: ${code}`);
        }
      } else {
        console.log(`\n========================================`);
        console.log(`ADMIN LOGIN CODE for ${username}: ${code}`);
        console.log(`Expires in 5 minutes`);
        console.log(`========================================\n`);
      }
      
      res.json({ success: true, message: "Если аккаунт существует, код будет отправлен" });
    } catch (error) {
      console.error("Request admin code error:", error);
      res.status(500).json({ error: "Ошибка при запросе кода" });
    }
  });

  app.post("/api/auth/admin/verify-code", async (req, res) => {
    try {
      cleanupExpiredCodes();
      
      const clientIp = getClientIp(req);
      
      if (!checkIpRateLimit(clientIp)) {
        return res.status(429).json({ error: "Слишком много попыток. Попробуйте позже" });
      }
      
      const { username, code } = req.body;
      
      if (!username || !code) {
        return res.status(400).json({ error: "Имя пользователя и код обязательны" });
      }
      
      const stored = adminCodes.get(username);
      
      if (!stored) {
        return res.status(400).json({ error: "Код не найден или истёк. Запросите новый код" });
      }
      
      if (stored.attempts >= 5) {
        adminCodes.delete(username);
        return res.status(429).json({ error: "Слишком много попыток. Запросите новый код" });
      }
      
      if (Date.now() > stored.expiresAt) {
        adminCodes.delete(username);
        return res.status(400).json({ error: "Код истёк. Запросите новый код" });
      }
      
      if (stored.code !== code) {
        stored.attempts++;
        return res.status(400).json({ error: `Неверный код. Осталось попыток: ${5 - stored.attempts}` });
      }
      
      adminCodes.delete(username);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      
      req.session.userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Ошибка сохранения сессии" });
        }
        console.log(`Admin login successful for ${username}, session userId: ${req.session.userId}`);
        res.json(user);
      });
    } catch (error) {
      console.error("Verify admin code error:", error);
      res.status(500).json({ error: "Ошибка при проверке кода" });
    }
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
      const isVictory = validatedData.won === true;
      const levelId = validatedData.levelId ?? 1;
      
      const score = await storage.createGameScore(validatedData);
      
      let beadsAwarded = 0;
      
      if (isVictory) {
        const beadsToAward = validatedData.score;
        const awardResult = await storage.awardBeadsWithHouse(
          userId,
          beadsToAward,
          "game_win_reward",
          `Награда за победу (очки: ${beadsToAward})`,
          score.id
        );
        
        if (awardResult.success) {
          beadsAwarded = beadsToAward;
        }
      }
      
      // Only process crypto rewards if player won
      let cryptoRewards = { btcAwarded: 0, ethAwarded: 0, usdtAwarded: 0, btcSatsAwarded: 0, ethWeiAwarded: 0 };
      let rewardResult: { usdtAwarded: number; rewardId?: string } = { usdtAwarded: 0 };
      
      if (isVictory) {
        cryptoRewards = await storage.processCryptoRewards(
          userId,
          validatedData.cryptoBtc ?? 0,
          validatedData.cryptoEth ?? 0,
          validatedData.cryptoUsdt ?? 0,
          score.id
        );
        
        const usdtCollected = validatedData.cryptoUsdt ?? 0;
        if (usdtCollected > 0) {
          rewardResult = await storage.processUsdtReward(
            userId, 
            usdtCollected, 
            score.id
          );
        }
      }
      
      if (isVictory && beadsAwarded > 0) {
        try {
          await storage.processReferralRewards(score.id, userId, beadsAwarded);
        } catch (refError) {
          console.error("Referral reward processing error:", refError);
        }
      }
      
      // Atomically update games_played, best_score, and completed_levels
      await storage.recordGameAndCompleteLevel(userId, validatedData.score, levelId, isVictory);
      
      res.json({ 
        ...score, 
        beadsAwarded,
        isVictory,
        usdtAwarded: rewardResult.usdtAwarded,
        rewardId: rewardResult.rewardId,
        cryptoRewards,
      });
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
  
  // Serve uploaded objects from Object Storage (with ACL enforcement)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check if user can access this object (enforces ACL policy)
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: undefined, // defaults to READ
      });
      
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(404).json({ error: "Object not found" });
    }
  });

  // Admin: Request upload URL for character/accessory images (public assets)
  app.post("/api/admin/upload/request-url", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, contentType, uploadType } = req.body;
      
      if (!name || !contentType) {
        return res.status(400).json({ error: "Missing name or contentType" });
      }
      
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: "Only PNG, JPG, WEBP, GIF images are allowed" });
      }
      
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      res.json({ 
        uploadURL, 
        objectPath,
        metadata: { name, contentType, uploadType }
      });
    } catch (error) {
      console.error("Request upload URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Admin: Set ACL for uploaded object (make it public after upload)
  app.post("/api/admin/upload/set-public", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { objectPath } = req.body;
      
      if (!objectPath) {
        return res.status(400).json({ error: "Missing objectPath" });
      }
      
      // Set ACL to public for character/accessory images
      const finalPath = await objectStorageService.trySetObjectEntityAclPolicy(objectPath, {
        owner: 'admin',
        visibility: 'public',
      });
      
      res.json({ objectPath: finalPath, visibility: 'public' });
    } catch (error) {
      console.error("Set public ACL error:", error);
      res.status(500).json({ error: "Failed to set public access" });
    }
  });

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

  // Fund toggle endpoints
  app.get("/api/admin/fund-toggles", requireAdmin, async (req, res) => {
    try {
      const cryptoConfig = await storage.getGameConfig("crypto_fund_enabled");
      const usdtConfig = await storage.getGameConfig("usdt_fund_enabled");
      
      res.json({
        cryptoFundEnabled: cryptoConfig?.value === true,
        usdtFundEnabled: usdtConfig?.value === true,
      });
    } catch (error) {
      console.error("Get fund toggles error:", error);
      res.status(500).json({ error: "Failed to get fund toggles" });
    }
  });

  app.put("/api/admin/fund-toggles", requireAdmin, async (req, res) => {
    try {
      const { cryptoFundEnabled, usdtFundEnabled } = req.body;
      
      if (typeof cryptoFundEnabled === "boolean") {
        await storage.setGameConfig({
          key: "crypto_fund_enabled",
          value: cryptoFundEnabled,
          description: "Enable/disable crypto ball rewards (BTC, ETH, USDT)",
        });
      }
      
      if (typeof usdtFundEnabled === "boolean") {
        await storage.setGameConfig({
          key: "usdt_fund_enabled",
          value: usdtFundEnabled,
          description: "Enable/disable real USDT rewards distribution",
        });
      }
      
      const cryptoConfig = await storage.getGameConfig("crypto_fund_enabled");
      const usdtConfig = await storage.getGameConfig("usdt_fund_enabled");
      
      res.json({
        cryptoFundEnabled: cryptoConfig?.value === true,
        usdtFundEnabled: usdtConfig?.value === true,
      });
    } catch (error) {
      console.error("Update fund toggles error:", error);
      res.status(500).json({ error: "Failed to update fund toggles" });
    }
  });

  // Public endpoint for checking if rewards are enabled
  app.get("/api/fund-status", async (req, res) => {
    try {
      const cryptoConfig = await storage.getGameConfig("crypto_fund_enabled");
      const usdtConfig = await storage.getGameConfig("usdt_fund_enabled");
      
      res.json({
        cryptoFundEnabled: cryptoConfig?.value === true,
        usdtFundEnabled: usdtConfig?.value === true,
      });
    } catch (error) {
      console.error("Get fund status error:", error);
      res.status(500).json({ error: "Failed to get fund status" });
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

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, totalPoints, gamesPlayed, bestScore, isAdmin, referredBy, btcBalanceSats, ethBalanceWei, usdtBalance } = req.body;
      
      const updates: Record<string, unknown> = {};
      if (username !== undefined) updates.username = username;
      if (totalPoints !== undefined) updates.totalPoints = Number(totalPoints);
      if (gamesPlayed !== undefined) updates.gamesPlayed = Number(gamesPlayed);
      if (bestScore !== undefined) updates.bestScore = Number(bestScore);
      if (isAdmin !== undefined) updates.isAdmin = Boolean(isAdmin);
      if (btcBalanceSats !== undefined) updates.btcBalanceSats = Number(btcBalanceSats);
      if (ethBalanceWei !== undefined) updates.ethBalanceWei = Number(ethBalanceWei);
      if (usdtBalance !== undefined) updates.usdtBalance = Number(usdtBalance);
      
      // Handle referredBy (sponsor) update
      if (referredBy !== undefined) {
        const currentUser = await storage.getUser(id);
        if (!currentUser) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const oldSponsorCode = currentUser.referredBy;
        const newSponsorCode = referredBy === "" ? null : referredBy;
        
        // Validate new sponsor if provided
        if (newSponsorCode) {
          const newSponsor = await storage.getUserByReferralCode(newSponsorCode);
          if (!newSponsor) {
            return res.status(400).json({ error: "Спонсор с таким кодом не найден" });
          }
          if (newSponsor.id === id) {
            return res.status(400).json({ error: "Пользователь не может быть спонсором самого себя" });
          }
        }
        
        // Update directReferralsCount for old and new sponsors
        if (oldSponsorCode !== newSponsorCode) {
          // Decrement old sponsor's count
          if (oldSponsorCode) {
            const oldSponsor = await storage.getUserByReferralCode(oldSponsorCode);
            if (oldSponsor && oldSponsor.directReferralsCount > 0) {
              await storage.updateUser(oldSponsor.id, { 
                directReferralsCount: oldSponsor.directReferralsCount - 1 
              });
            }
          }
          
          // Increment new sponsor's count
          if (newSponsorCode) {
            const newSponsor = await storage.getUserByReferralCode(newSponsorCode);
            if (newSponsor) {
              await storage.updateUser(newSponsor.id, { 
                directReferralsCount: newSponsor.directReferralsCount + 1 
              });
            }
          }
          
          updates.referredBy = newSponsorCode;
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
      }
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user has Beads balance - protect from accidental deletion
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.totalPoints > 0) {
        return res.status(400).json({ 
          error: "Нельзя удалить пользователя с Beads на балансе",
          hasBeads: true,
          beadsBalance: user.totalPoints
        });
      }
      
      const deleted = await storage.hardDeleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id/restore", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.restoreUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Restore user error:", error);
      res.status(500).json({ error: "Failed to restore user" });
    }
  });

  app.get("/api/admin/balances", requireAdmin, async (req, res) => {
    try {
      const balances = await storage.getAdminCryptoBalances();
      res.json(balances);
    } catch (error) {
      console.error("Get admin balances error:", error);
      res.status(500).json({ error: "Failed to get balances" });
    }
  });

  app.put("/api/admin/balances", requireAdmin, async (req, res) => {
    try {
      const { btc, eth, usdt } = req.body;
      
      const balances = {
        btc: Math.max(0, Number(btc) || 0),
        eth: Math.max(0, Number(eth) || 0),
        usdt: Math.max(0, Number(usdt) || 0),
      };
      
      const updated = await storage.setAdminCryptoBalances(balances);
      res.json(updated);
    } catch (error) {
      console.error("Update admin balances error:", error);
      res.status(500).json({ error: "Failed to update balances" });
    }
  });

  app.get("/api/crypto-balances", async (req, res) => {
    try {
      const balances = await storage.getAdminCryptoBalances();
      const usdtFundStats = await storage.getUsdtFundStats();
      
      const usdtFundAvailable = usdtFundStats.settings && 
        usdtFundStats.settings.usdtAvailable > 0 &&
        usdtFundStats.distributedToday < usdtFundStats.settings.usdtDailyLimit;
      
      res.json({
        btc: balances.btc > 0,
        eth: balances.eth > 0,
        usdt: balances.usdt > 0 && usdtFundAvailable,
      });
    } catch (error) {
      console.error("Get crypto balances error:", error);
      res.status(500).json({ error: "Failed to get balances" });
    }
  });

  app.get("/api/crypto-availability", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const availability = await storage.getCryptoAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Get crypto availability error:", error);
      res.status(500).json({ error: "Failed to get crypto availability" });
    }
  });

  app.get("/api/referral", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      let botUsername = 'BeadsLineBot';
      
      if (botToken) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
          const data = await response.json();
          if (data.ok && data.result?.username) {
            botUsername = data.result.username;
          }
        } catch (e) {
          console.error("Failed to get bot username:", e);
        }
      }
      
      const referralInfo = await storage.getReferralInfo(userId, botUsername);
      res.json(referralInfo);
    } catch (error) {
      console.error("Get referral info error:", error);
      res.status(500).json({ error: "Failed to get referral info" });
    }
  });

  app.get("/api/referral/rewards", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const rewards = await storage.getUserReferralRewards(userId);
      const total = await storage.getTotalReferralBeads(userId);
      
      // Получаем имена пользователей для каждой награды
      const rewardsWithUsernames = await Promise.all(
        rewards.map(async (reward) => {
          const refUser = await storage.getUser(reward.refUserId);
          return {
            ...reward,
            refUsername: refUser?.username || refUser?.firstName || 'Игрок',
          };
        })
      );
      
      res.json({ rewards: rewardsWithUsernames, total });
    } catch (error) {
      console.error("Get referral rewards error:", error);
      res.status(500).json({ error: "Failed to get referral rewards" });
    }
  });

  // Получить список прямых рефералов пользователя
  app.get("/api/referral/list", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user?.referralCode) {
        return res.json({ referrals: [], level2Referrals: [], level2Count: 0 });
      }
      
      // Получаем всех пользователей, которых пригласил текущий пользователь
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter(u => u.referredBy === user.referralCode && !u.deletedAt);
      
      // Для каждого прямого реферала подсчитываем сколько Beads заработано от него
      const rewards = await storage.getUserReferralRewards(userId);
      const referralsWithStats = directReferrals.map((ref) => {
        const earnedFromRef = rewards
          .filter(r => r.refUserId === ref.id && r.level === 1)
          .reduce((sum, r) => sum + r.beadsAmount, 0);
        
        return {
          id: ref.id,
          username: ref.username || ref.firstName || 'Игрок',
          gamesPlayed: ref.gamesPlayed,
          earnedFromRef,
          joinedAt: ref.createdAt,
        };
      });
      
      // Получаем рефералов второго уровня (рефералы наших рефералов)
      const level2Referrals: Array<{
        id: string;
        username: string;
        gamesPlayed: number;
        earnedFromRef: number;
        invitedBy: string;
        joinedAt: Date;
      }> = [];
      
      for (const directRef of directReferrals) {
        if (directRef.referralCode) {
          const theirReferrals = allUsers.filter(u => u.referredBy === directRef.referralCode && !u.deletedAt);
          for (const ref2 of theirReferrals) {
            const earnedFromRef = rewards
              .filter(r => r.refUserId === ref2.id && r.level === 2)
              .reduce((sum, r) => sum + r.beadsAmount, 0);
            
            level2Referrals.push({
              id: ref2.id,
              username: ref2.username || ref2.firstName || 'Игрок',
              gamesPlayed: ref2.gamesPlayed,
              earnedFromRef,
              invitedBy: directRef.username || directRef.firstName || 'Реферал',
              joinedAt: ref2.createdAt,
            });
          }
        }
      }
      
      res.json({ 
        referrals: referralsWithStats.sort((a, b) => 
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        ),
        level2Referrals: level2Referrals.sort((a, b) =>
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        ),
        level2Count: level2Referrals.length
      });
    } catch (error) {
      console.error("Get referral list error:", error);
      res.status(500).json({ error: "Failed to get referral list" });
    }
  });

  app.get("/api/referral/config", async (req, res) => {
    try {
      const config = await storage.getReferralConfig();
      res.json(config);
    } catch (error) {
      console.error("Get referral config error:", error);
      res.status(500).json({ error: "Failed to get referral config" });
    }
  });

  app.put("/api/admin/referral/config", requireAdmin, async (req, res) => {
    try {
      const { 
        maxDirectReferralsPerUser, 
        level1RewardPercent, 
        level2RewardPercent,
        maxReferralBeadsPerRefPerDay,
        maxReferralBeadsPerUserPerDay,
        title,
        description,
      } = req.body;
      
      const config = await storage.updateReferralConfig({
        maxDirectReferralsPerUser: maxDirectReferralsPerUser !== undefined 
          ? Math.max(1, Number(maxDirectReferralsPerUser)) : undefined,
        level1RewardPercent: level1RewardPercent !== undefined 
          ? Math.max(0, Math.min(100, Number(level1RewardPercent))) : undefined,
        level2RewardPercent: level2RewardPercent !== undefined 
          ? Math.max(0, Math.min(100, Number(level2RewardPercent))) : undefined,
        maxReferralBeadsPerRefPerDay: maxReferralBeadsPerRefPerDay !== undefined 
          ? Math.max(1, Number(maxReferralBeadsPerRefPerDay)) : undefined,
        maxReferralBeadsPerUserPerDay: maxReferralBeadsPerUserPerDay !== undefined 
          ? Math.max(1, Number(maxReferralBeadsPerUserPerDay)) : undefined,
        title: title !== undefined ? String(title) : undefined,
        description: description !== undefined ? String(description) : undefined,
      });
      
      res.json(config);
    } catch (error) {
      console.error("Update referral config error:", error);
      res.status(500).json({ error: "Failed to update referral config" });
    }
  });

  app.get("/api/admin/referral/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getReferralUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Get referral stats error:", error);
      res.status(500).json({ error: "Failed to get referral stats" });
    }
  });

  app.post("/api/game/start", async (req, res) => {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = (req.session as any)?.userId;
      
      activeSessions.set(sessionId, {
        sessionId,
        startedAt: Date.now(),
        userId,
      });
      
      res.json({ sessionId, activePlayers: getActivePlayersCount() });
    } catch (error) {
      console.error("Start game session error:", error);
      res.status(500).json({ error: "Failed to start session" });
    }
  });

  app.post("/api/game/end", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (sessionId) {
        activeSessions.delete(sessionId);
      }
      res.json({ success: true, activePlayers: getActivePlayersCount() });
    } catch (error) {
      console.error("End game session error:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  app.get("/api/active-players", async (req, res) => {
    try {
      res.json({ count: getActivePlayersCount() });
    } catch (error) {
      console.error("Get active players error:", error);
      res.status(500).json({ error: "Failed to get active players" });
    }
  });

  app.get("/api/admin/usdt-fund", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getUsdtFundStats();
      res.json(stats);
    } catch (error) {
      console.error("Get USDT fund error:", error);
      res.status(500).json({ error: "Failed to get USDT fund" });
    }
  });

  app.put("/api/admin/usdt-fund", requireAdmin, async (req, res) => {
    try {
      const { 
        usdtTotalFund, 
        usdtAvailable, 
        usdtDailyLimit, 
        usdtPerDrop, 
        usdtMaxPerUserPerDay 
      } = req.body;
      
      const updates: Record<string, number> = {};
      
      if (usdtTotalFund !== undefined) {
        updates.usdtTotalFund = Math.max(0, Number(usdtTotalFund) || 0);
      }
      if (usdtAvailable !== undefined) {
        updates.usdtAvailable = Math.max(0, Number(usdtAvailable) || 0);
      }
      if (usdtDailyLimit !== undefined) {
        updates.usdtDailyLimit = Math.max(0, Number(usdtDailyLimit) || 0);
      }
      if (usdtPerDrop !== undefined) {
        updates.usdtPerDrop = Math.max(0, Number(usdtPerDrop) || 0);
      }
      if (usdtMaxPerUserPerDay !== undefined) {
        updates.usdtMaxPerUserPerDay = Math.max(0, Number(usdtMaxPerUserPerDay) || 0);
      }
      
      const settings = await storage.updateUsdtFundSettings(updates);
      const stats = await storage.getUsdtFundStats();
      res.json(stats);
    } catch (error) {
      console.error("Update USDT fund error:", error);
      res.status(500).json({ error: "Failed to update USDT fund" });
    }
  });

  app.get("/api/usdt-fund-available", async (req, res) => {
    try {
      const isAvailable = await storage.isUsdtFundAvailable();
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Get USDT fund availability error:", error);
      res.status(500).json({ error: "Failed to check USDT fund availability" });
    }
  });

  app.get("/api/game-economy", async (req, res) => {
    try {
      const config = await storage.getGameEconomyConfig();
      const usdtFundStats = await storage.getUsdtFundStats();
      const fundToggles = await storage.getFundToggles();
      
      const usdtFundAvailable = usdtFundStats.settings && 
        usdtFundStats.settings.usdtAvailable > 0 &&
        usdtFundStats.distributedToday < usdtFundStats.settings.usdtDailyLimit;
      
      const btcHasPool = config.pools.btcBalanceSats > 0;
      const ethHasPool = config.pools.ethBalanceWei > 0;
      const usdtHasPool = config.pools.usdtBalance > 0;
      
      res.json(formatNumbersInObject({
        ...config,
        cryptoAvailable: {
          btc: fundToggles.cryptoFundEnabled && btcHasPool,
          eth: fundToggles.cryptoFundEnabled && ethHasPool,
          usdt: fundToggles.cryptoFundEnabled && usdtHasPool,
        },
        usdtFundEnabled: fundToggles.usdtFundEnabled && usdtFundAvailable,
      }));
    } catch (error) {
      console.error("Get game economy error:", error);
      res.status(500).json({ error: "Failed to get game economy" });
    }
  });

  app.get("/api/admin/game-economy", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getGameEconomyConfig();
      res.json(formatNumbersInObject(config));
    } catch (error) {
      console.error("Get admin game economy error:", error);
      res.status(500).json({ error: "Failed to get game economy" });
    }
  });

  app.put("/api/admin/game-economy", requireAdmin, async (req, res) => {
    try {
      const { points, combo, crypto, cryptoRewards, dailyLimits, pools, perGameLimits } = req.body;
      
      const updates: Record<string, any> = {};
      
      if (points) {
        updates.points = {
          normal: points.normal !== undefined ? Math.max(0, parseFloat(String(points.normal))) : undefined,
          btc: points.btc !== undefined ? Math.max(0, parseFloat(String(points.btc))) : undefined,
          eth: points.eth !== undefined ? Math.max(0, parseFloat(String(points.eth))) : undefined,
          usdt: points.usdt !== undefined ? Math.max(0, parseFloat(String(points.usdt))) : undefined,
        };
      }
      
      if (combo) {
        updates.combo = {
          multiplier: combo.multiplier !== undefined ? Math.max(1, parseFloat(String(combo.multiplier))) : undefined,
          maxChain: combo.maxChain !== undefined ? Math.max(1, Math.floor(parseFloat(String(combo.maxChain)))) : undefined,
        };
      }
      
      if (crypto) {
        updates.crypto = {
          spawnChance: crypto.spawnChance !== undefined ? Math.max(0, Math.min(1, parseFloat(String(crypto.spawnChance)))) : undefined,
        };
      }
      
      if (cryptoRewards) {
        updates.cryptoRewards = {
          btcPerBall: cryptoRewards.btcPerBall !== undefined ? Math.max(0, parseFloat(String(cryptoRewards.btcPerBall))) : undefined,
          ethPerBall: cryptoRewards.ethPerBall !== undefined ? Math.max(0, parseFloat(String(cryptoRewards.ethPerBall))) : undefined,
          usdtPerBall: cryptoRewards.usdtPerBall !== undefined ? Math.max(0, parseFloat(String(cryptoRewards.usdtPerBall))) : undefined,
        };
      }
      
      if (dailyLimits) {
        updates.dailyLimits = {
          btcMaxSatsPerDay: dailyLimits.btcMaxSatsPerDay !== undefined ? Math.max(0, Math.floor(parseFloat(String(dailyLimits.btcMaxSatsPerDay)))) : undefined,
          ethMaxWeiPerDay: dailyLimits.ethMaxWeiPerDay !== undefined ? Math.max(0, parseFloat(String(dailyLimits.ethMaxWeiPerDay))) : undefined,
          usdtMaxPerDay: dailyLimits.usdtMaxPerDay !== undefined ? Math.max(0, parseFloat(String(dailyLimits.usdtMaxPerDay))) : undefined,
        };
      }
      
      if (pools) {
        updates.pools = {
          btcBalanceSats: pools.btcBalanceSats !== undefined ? Math.max(0, Math.floor(parseFloat(String(pools.btcBalanceSats)))) : undefined,
          ethBalanceWei: pools.ethBalanceWei !== undefined ? Math.max(0, parseFloat(String(pools.ethBalanceWei))) : undefined,
          usdtBalance: pools.usdtBalance !== undefined ? Math.max(0, parseFloat(String(pools.usdtBalance))) : undefined,
        };
      }
      
      if (perGameLimits) {
        updates.perGameLimits = {
          btcMaxBeadsPerGame: perGameLimits.btcMaxBeadsPerGame !== undefined ? Math.max(0, Math.floor(parseFloat(String(perGameLimits.btcMaxBeadsPerGame)))) : undefined,
          ethMaxBeadsPerGame: perGameLimits.ethMaxBeadsPerGame !== undefined ? Math.max(0, Math.floor(parseFloat(String(perGameLimits.ethMaxBeadsPerGame)))) : undefined,
          usdtMaxBeadsPerGame: perGameLimits.usdtMaxBeadsPerGame !== undefined ? Math.max(0, Math.floor(parseFloat(String(perGameLimits.usdtMaxBeadsPerGame)))) : undefined,
        };
      }
      
      const config = await storage.updateGameEconomyConfig(updates);
      res.json(formatNumbersInObject(config));
    } catch (error) {
      console.error("Update admin game economy error:", error);
      res.status(500).json({ error: "Failed to update game economy" });
    }
  });

  app.get("/api/gameplay-config", async (req, res) => {
    try {
      const config = await storage.getGameplayConfig();
      res.json(config);
    } catch (error) {
      console.error("Get gameplay config error:", error);
      res.status(500).json({ error: "Failed to get gameplay config" });
    }
  });

  app.get("/api/admin/gameplay-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getGameplayConfig();
      res.json(config);
    } catch (error) {
      console.error("Get admin gameplay config error:", error);
      res.status(500).json({ error: "Failed to get gameplay config" });
    }
  });

  app.put("/api/admin/gameplay-config", requireAdmin, async (req, res) => {
    try {
      const { balls, spawn, speed, colors } = req.body;
      const updates: any = {};
      
      if (balls) {
        updates.balls = {
          initialCount: balls.initialCount !== undefined ? Math.max(1, Math.floor(parseFloat(String(balls.initialCount)))) : undefined,
          targetCount: balls.targetCount !== undefined ? Math.max(1, Math.floor(parseFloat(String(balls.targetCount)))) : undefined,
          maxTotalBalls: balls.maxTotalBalls !== undefined ? Math.max(1, Math.floor(parseFloat(String(balls.maxTotalBalls)))) : undefined,
        };
      }
      
      if (spawn) {
        updates.spawn = {
          period: spawn.period !== undefined ? Math.max(100, Math.floor(parseFloat(String(spawn.period)))) : undefined,
          resumeThreshold: spawn.resumeThreshold !== undefined ? Math.max(1, Math.floor(parseFloat(String(spawn.resumeThreshold)))) : undefined,
        };
      }
      
      if (speed) {
        updates.speed = {
          base: speed.base !== undefined ? Math.max(0.001, parseFloat(String(speed.base))) : undefined,
          max: speed.max !== undefined ? Math.max(0.001, parseFloat(String(speed.max))) : undefined,
          accelerationStart: speed.accelerationStart !== undefined ? Math.max(0, Math.min(1, parseFloat(String(speed.accelerationStart)))) : undefined,
        };
      }
      
      if (colors) {
        const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'amber', 'lime', 'violet'];
        let activeColors: string[] | undefined;
        
        if (Array.isArray(colors.activeColors)) {
          const filtered = colors.activeColors.filter((c: string) => validColors.includes(c)) as string[];
          const unique = Array.from(new Set(filtered)) as string[];
          if (unique.length >= 2 && unique.length <= 10) {
            activeColors = unique;
          }
        }
        
        updates.colors = {
          count: activeColors ? activeColors.length : (colors.count !== undefined ? Math.max(2, Math.min(10, Math.floor(parseFloat(String(colors.count))))) : undefined),
          activeColors: activeColors,
        };
      }
      
      const config = await storage.updateGameplayConfig(updates);
      res.json(config);
    } catch (error) {
      console.error("Update admin gameplay config error:", error);
      res.status(500).json({ error: "Failed to update gameplay config" });
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

  // Maintenance mode endpoints
  app.get("/api/maintenance", async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const config = await storage.getGameConfig("maintenance_mode");
      if (!config) {
        return res.json({ enabled: false, endTime: null, message: null });
      }
      const data = config.value as { enabled: boolean; endTime: string | null; message: string | null };
      res.json(data);
    } catch (error) {
      console.error("Get maintenance mode error:", error);
      res.json({ enabled: false, endTime: null, message: null });
    }
  });

  app.put("/api/admin/maintenance", requireAdmin, async (req, res) => {
    try {
      const { enabled, endTime, message } = req.body;
      
      const config = await storage.setGameConfig({
        key: "maintenance_mode",
        value: {
          enabled: Boolean(enabled),
          endTime: endTime || null,
          message: message || null
        }
      });
      
      res.json(config.value);
    } catch (error) {
      console.error("Set maintenance mode error:", error);
      res.status(500).json({ error: "Failed to set maintenance mode" });
    }
  });

  // House Account API endpoints
  app.get("/api/admin/house-account", requireAdmin, async (req, res) => {
    try {
      const house = await storage.getHouseAccount();
      res.json(house);
    } catch (error) {
      console.error("Get house account error:", error);
      res.status(500).json({ error: "Failed to get house account" });
    }
  });

  app.put("/api/admin/house-account", requireAdmin, async (req, res) => {
    try {
      const { balance, salesIncome, totalDistributed } = req.body;
      const house = await storage.updateHouseAccount({
        balance: balance !== undefined ? Number(balance) : undefined,
        salesIncome: salesIncome !== undefined ? Number(salesIncome) : undefined,
        totalDistributed: totalDistributed !== undefined ? Number(totalDistributed) : undefined,
      });
      res.json(house);
    } catch (error) {
      console.error("Update house account error:", error);
      res.status(500).json({ error: "Failed to update house account" });
    }
  });

  // Lives Config API endpoints
  app.get("/api/lives-config", async (req, res) => {
    try {
      const config = await storage.getLivesConfig();
      res.json(config);
    } catch (error) {
      console.error("Get lives config error:", error);
      res.status(500).json({ error: "Failed to get lives config" });
    }
  });

  app.put("/api/admin/lives-config", requireAdmin, async (req, res) => {
    try {
      const { livesPerGame, extraLifeCost, extraLifeSeconds, maxExtraLives } = req.body;
      const config = await storage.updateLivesConfig({
        livesPerGame: livesPerGame !== undefined ? Number(livesPerGame) : undefined,
        extraLifeCost: extraLifeCost !== undefined ? Number(extraLifeCost) : undefined,
        extraLifeSeconds: extraLifeSeconds !== undefined ? Number(extraLifeSeconds) : undefined,
        maxExtraLives: maxExtraLives !== undefined ? Number(maxExtraLives) : undefined,
      });
      res.json(config);
    } catch (error) {
      console.error("Update lives config error:", error);
      res.status(500).json({ error: "Failed to update lives config" });
    }
  });

  // Beads Transactions Journal
  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string | undefined;
      const search = req.query.search as string | undefined;
      
      const result = await storage.getBeadsTransactionsWithUsers({
        limit,
        offset,
        type,
        search,
      });
      
      res.json({ 
        transactions: result.transactions, 
        total: result.total, 
        limit, 
        offset 
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Crypto Rewards Journal
  app.get("/api/admin/crypto-rewards", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const cryptoType = req.query.cryptoType as string | undefined;
      const search = req.query.search as string | undefined;
      
      const result = await storage.getCryptoRewards({
        limit,
        offset,
        cryptoType,
        search,
      });
      
      res.json({ 
        rewards: result.rewards, 
        total: result.total, 
        limit, 
        offset 
      });
    } catch (error) {
      console.error("Get crypto rewards error:", error);
      res.status(500).json({ error: "Failed to get crypto rewards" });
    }
  });

  // Buy extra life endpoint
  app.post("/api/buy-life", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const livesConfig = await storage.getLivesConfig();
      const cost = livesConfig.extraLifeCost;

      if (user.totalPoints < cost) {
        return res.status(400).json({ 
          error: "Insufficient Beads", 
          required: cost, 
          current: user.totalPoints 
        });
      }

      const result = await storage.chargeBeadsToHouse(
        userId,
        cost,
        "buy_extra_life",
        `Покупка дополнительной жизни (+${livesConfig.extraLifeSeconds} сек)`
      );

      if (!result.success) {
        return res.status(400).json({ error: "Failed to process purchase" });
      }

      res.json({
        success: true,
        newBalance: result.newBalance,
        extraSeconds: livesConfig.extraLifeSeconds,
      });
    } catch (error) {
      console.error("Buy life error:", error);
      res.status(500).json({ error: "Failed to buy extra life" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Telegram Bot Webhook (GET for verification, POST for updates)
  app.get("/api/telegram/webhook", (req, res) => {
    res.json({ ok: true, message: "Webhook endpoint is active" });
  });

  app.post("/api/telegram/webhook", async (req, res) => {
    // Always respond with 200 OK immediately to prevent Telegram from retrying
    // Process the update asynchronously
    res.status(200).json({ ok: true });
    
    try {
      const update: TelegramUpdate = req.body;
      
      if (update?.message) {
        // Process in background after sending response
        handleTelegramCommand(update.message).catch(err => {
          console.error("Telegram command processing error:", err);
        });
      }
    } catch (error) {
      console.error("Telegram webhook error:", error);
    }
  });

  // Setup Telegram webhook (admin only)
  app.post("/api/telegram/setup-webhook", requireAdmin, async (req, res) => {
    try {
      const { customUrl } = req.body;
      let webhookUrl: string;
      
      if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
        // Use custom URL provided by admin
        const baseUrl = customUrl.trim().replace(/\/$/, ''); // Remove trailing slash
        webhookUrl = `${baseUrl}/api/telegram/webhook`;
      } else {
        // Use auto-detected URL
        const appUrl = getAppUrl();
        webhookUrl = `${appUrl}/api/telegram/webhook`;
      }
      
      const [webhookSuccess, commandsSuccess] = await Promise.all([
        setTelegramWebhook(webhookUrl),
        setTelegramBotCommands()
      ]);
      
      res.json({
        success: webhookSuccess && commandsSuccess,
        webhookUrl,
        webhookSet: webhookSuccess,
        commandsSet: commandsSuccess
      });
    } catch (error) {
      console.error("Setup webhook error:", error);
      res.status(500).json({ error: "Failed to setup webhook" });
    }
  });

  // Get Telegram bot info (admin only)
  app.get("/api/telegram/info", requireAdmin, async (req, res) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: "Bot token not configured" });
      }
      
      const [meResponse, webhookResponse] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/getMe`),
        fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
      ]);
      
      const [meResult, webhookResult] = await Promise.all([
        meResponse.json(),
        webhookResponse.json()
      ]);
      
      res.json({
        bot: meResult.result,
        webhook: webhookResult.result,
        appUrl: getAppUrl()
      });
    } catch (error) {
      console.error("Get bot info error:", error);
      res.status(500).json({ error: "Failed to get bot info" });
    }
  });

  // ========== BOOSTS API ==========
  
  // Get all active boosts
  app.get("/api/boosts", async (req, res) => {
    try {
      const boosts = await storage.getBoosts();
      res.json(boosts);
    } catch (error) {
      console.error("Get boosts error:", error);
      res.status(500).json({ error: "Failed to get boosts" });
    }
  });

  // Get user boost inventory
  app.get("/api/user/boosts", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const inventory = await storage.getUserBoostInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Get user boosts error:", error);
      res.status(500).json({ error: "Failed to get user boosts" });
    }
  });

  // Buy a boost
  app.post("/api/boosts/buy", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { boostId } = req.body;
      if (!boostId) {
        return res.status(400).json({ error: "boostId is required" });
      }
      const result = await storage.buyBoost(userId, boostId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true, newBalance: result.newBalance });
    } catch (error) {
      console.error("Buy boost error:", error);
      res.status(500).json({ error: "Failed to buy boost" });
    }
  });

  // Use a boost
  app.post("/api/boosts/use", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { boostId } = req.body;
      if (!boostId) {
        return res.status(400).json({ error: "boostId is required" });
      }
      const result = await storage.useBoost(userId, boostId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true, boost: result.boost });
    } catch (error) {
      console.error("Use boost error:", error);
      res.status(500).json({ error: "Failed to use boost" });
    }
  });

  // Admin: Get all boosts (including inactive)
  app.get("/api/admin/boosts", requireAdmin, async (req, res) => {
    try {
      const boosts = await storage.getBoosts();
      res.json(boosts);
    } catch (error) {
      console.error("Admin get boosts error:", error);
      res.status(500).json({ error: "Failed to get boosts" });
    }
  });

  // Admin: Update boost
  app.patch("/api/admin/boosts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const boost = await storage.updateBoost(id, updates);
      if (!boost) {
        return res.status(404).json({ error: "Boost not found" });
      }
      res.json(boost);
    } catch (error) {
      console.error("Update boost error:", error);
      res.status(500).json({ error: "Failed to update boost" });
    }
  });

  // Debug logs API - for game debugging
  app.post("/api/debug-logs", async (req, res) => {
    try {
      const { logs } = req.body;
      console.log(`[DEBUG] Received ${logs?.length || 0} logs, current total: ${serverDebugLogs.length}`);
      if (Array.isArray(logs)) {
        for (const log of logs) {
          if (typeof log === 'string') {
            addDebugLog(log);
          }
        }
      }
      console.log(`[DEBUG] After adding, total: ${serverDebugLogs.length}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add logs" });
    }
  });

  app.get("/api/admin/debug-logs", requireAdmin, async (req, res) => {
    console.log(`[DEBUG] GET logs, count: ${serverDebugLogs.length}`);
    res.json({ logs: [...serverDebugLogs] });
  });

  app.delete("/api/admin/debug-logs", requireAdmin, async (req, res) => {
    serverDebugLogs.length = 0;
    res.json({ success: true });
  });

  // ===== CHARACTER SYSTEM API =====

  // Get current user's character
  app.get("/api/character", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const characterData = await storage.getCharacterWithAccessories(userId);
      res.json(characterData);
    } catch (error) {
      console.error("Get character error:", error);
      res.status(500).json({ error: "Failed to get character" });
    }
  });

  // Check if user has a character
  app.get("/api/character/exists", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const character = await storage.getCharacter(userId);
      res.json({ exists: !!character, character });
    } catch (error) {
      console.error("Check character exists error:", error);
      res.status(500).json({ error: "Failed to check character" });
    }
  });

  // Create character
  app.post("/api/character", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { name, gender } = req.body;
      if (!name || !gender) {
        return res.status(400).json({ error: "name and gender are required" });
      }
      if (gender !== 'male' && gender !== 'female') {
        return res.status(400).json({ error: "gender must be 'male' or 'female'" });
      }

      const existingCharacter = await storage.getCharacter(userId);
      if (existingCharacter) {
        return res.status(400).json({ error: "Character already exists" });
      }

      const character = await storage.createCharacter({ userId, name, gender });
      res.json(character);
    } catch (error) {
      console.error("Create character error:", error);
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  // Update character
  app.patch("/api/character", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { name } = req.body;
      const character = await storage.updateCharacter(userId, { name });
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Update character error:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  // Get accessory categories
  app.get("/api/accessories/categories", async (req, res) => {
    try {
      const categories = await storage.getAccessoryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get accessory categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Get accessories (filtered by category and/or gender)
  app.get("/api/accessories", async (req, res) => {
    try {
      const { categoryId, gender } = req.query;
      const accessoriesData = await storage.getAccessories(
        categoryId as string | undefined, 
        gender as string | undefined
      );
      res.json(accessoriesData);
    } catch (error) {
      console.error("Get accessories error:", error);
      res.status(500).json({ error: "Failed to get accessories" });
    }
  });

  // Get user's purchased accessories
  app.get("/api/user/accessories", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const userAccessoriesData = await storage.getUserAccessories(userId);
      res.json(userAccessoriesData);
    } catch (error) {
      console.error("Get user accessories error:", error);
      res.status(500).json({ error: "Failed to get user accessories" });
    }
  });

  // Purchase accessory
  app.post("/api/accessories/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { accessoryId } = req.body;
      if (!accessoryId) {
        return res.status(400).json({ error: "accessoryId is required" });
      }

      const result = await storage.purchaseAccessory(userId, accessoryId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true, userAccessory: result.userAccessory });
    } catch (error) {
      console.error("Purchase accessory error:", error);
      res.status(500).json({ error: "Failed to purchase accessory" });
    }
  });

  // Equip accessory
  app.post("/api/accessories/equip", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { accessoryId } = req.body;
      if (!accessoryId) {
        return res.status(400).json({ error: "accessoryId is required" });
      }

      const result = await storage.equipAccessory(userId, accessoryId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Equip accessory error:", error);
      res.status(500).json({ error: "Failed to equip accessory" });
    }
  });

  // Unequip accessory
  app.post("/api/accessories/unequip", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { accessoryId } = req.body;
      if (!accessoryId) {
        return res.status(400).json({ error: "accessoryId is required" });
      }

      const result = await storage.unequipAccessory(userId, accessoryId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Unequip accessory error:", error);
      res.status(500).json({ error: "Failed to unequip accessory" });
    }
  });

  // Get base bodies
  app.get("/api/base-bodies", async (req, res) => {
    try {
      const { gender } = req.query;
      const bodies = await storage.getBaseBodies(gender as string | undefined);
      res.json(bodies);
    } catch (error) {
      console.error("Get base bodies error:", error);
      res.status(500).json({ error: "Failed to get base bodies" });
    }
  });

  // ===== ADMIN CHARACTER MANAGEMENT =====

  // Admin: Get accessory categories
  app.get("/api/admin/accessory-categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAccessoryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get accessory categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Admin: Create accessory category
  app.post("/api/admin/accessory-categories", requireAdmin, async (req, res) => {
    try {
      const { name, nameRu, slot, sortOrder } = req.body;
      if (!name || !nameRu || !slot) {
        return res.status(400).json({ error: "name, nameRu, and slot are required" });
      }
      const category = await storage.createAccessoryCategory({ name, nameRu, slot, sortOrder: sortOrder || 0 });
      res.json(category);
    } catch (error) {
      console.error("Create accessory category error:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Admin: Update accessory category
  app.patch("/api/admin/accessory-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateAccessoryCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update accessory category error:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Admin: Delete accessory category
  app.delete("/api/admin/accessory-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAccessoryCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete accessory category error:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Admin: Create base body
  app.post("/api/admin/base-bodies", requireAdmin, async (req, res) => {
    try {
      const { gender, imageUrl, isDefault } = req.body;
      if (!gender || !imageUrl) {
        return res.status(400).json({ error: "gender and imageUrl are required" });
      }
      const body = await storage.createBaseBody({ gender, imageUrl, isDefault: isDefault || false });
      res.json(body);
    } catch (error) {
      console.error("Create base body error:", error);
      res.status(500).json({ error: "Failed to create base body" });
    }
  });

  // Admin: Update base body
  app.patch("/api/admin/base-bodies/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const body = await storage.updateBaseBody(id, req.body);
      if (!body) {
        return res.status(404).json({ error: "Base body not found" });
      }
      res.json(body);
    } catch (error) {
      console.error("Update base body error:", error);
      res.status(500).json({ error: "Failed to update base body" });
    }
  });

  // Admin: Delete base body
  app.delete("/api/admin/base-bodies/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBaseBody(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete base body error:", error);
      res.status(500).json({ error: "Failed to delete base body" });
    }
  });

  // Admin: Create accessory
  app.post("/api/admin/accessories", requireAdmin, async (req, res) => {
    try {
      const { categoryId, name, nameRu, descriptionRu, imageUrl, gender, positionX, positionY, zIndex, price, maxQuantity, isActive } = req.body;
      if (!categoryId || !name || !nameRu || !imageUrl || !gender) {
        return res.status(400).json({ error: "categoryId, name, nameRu, imageUrl, and gender are required" });
      }
      const accessory = await storage.createAccessory({
        categoryId, name, nameRu, descriptionRu, imageUrl, gender,
        positionX: positionX || 0,
        positionY: positionY || 0,
        zIndex: zIndex || 1,
        price: price || 100,
        maxQuantity: maxQuantity || null,
        isActive: isActive !== false,
      });
      res.json(accessory);
    } catch (error) {
      console.error("Create accessory error:", error);
      res.status(500).json({ error: "Failed to create accessory" });
    }
  });

  // Admin: Update accessory
  app.patch("/api/admin/accessories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const accessory = await storage.updateAccessory(id, req.body);
      if (!accessory) {
        return res.status(404).json({ error: "Accessory not found" });
      }
      res.json(accessory);
    } catch (error) {
      console.error("Update accessory error:", error);
      res.status(500).json({ error: "Failed to update accessory" });
    }
  });

  // Admin: Delete accessory
  app.delete("/api/admin/accessories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAccessory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete accessory error:", error);
      res.status(500).json({ error: "Failed to delete accessory" });
    }
  });

  // Admin: Get all accessories (including inactive)
  app.get("/api/admin/accessories", requireAdmin, async (req, res) => {
    try {
      const allAccessories = await storage.getAccessories();
      res.json(allAccessories);
    } catch (error) {
      console.error("Admin get accessories error:", error);
      res.status(500).json({ error: "Failed to get accessories" });
    }
  });

  // Admin: Get all base bodies
  app.get("/api/admin/base-bodies", requireAdmin, async (req, res) => {
    try {
      const bodies = await storage.getBaseBodies();
      res.json(bodies);
    } catch (error) {
      console.error("Admin get base bodies error:", error);
      res.status(500).json({ error: "Failed to get base bodies" });
    }
  });

  // ===== BOOST PACKAGES API =====

  // Get all active boost packages (public)
  app.get("/api/boost-packages", async (req, res) => {
    try {
      const packages = await storage.getBoostPackages(true);
      res.json(packages);
    } catch (error) {
      console.error("Get boost packages error:", error);
      res.status(500).json({ error: "Failed to get boost packages" });
    }
  });

  // Purchase a boost package (requires auth)
  app.post("/api/boost-packages/:id/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const { telegramPaymentId } = req.body;

      const result = await storage.purchaseBoostPackage(userId, id, telegramPaymentId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true, purchase: result.purchase });
    } catch (error) {
      console.error("Purchase boost package error:", error);
      res.status(500).json({ error: "Failed to purchase boost package" });
    }
  });

  // Get user's package purchases (requires auth)
  app.get("/api/user/boost-package-purchases", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const purchases = await storage.getUserBoostPackagePurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Get user boost package purchases error:", error);
      res.status(500).json({ error: "Failed to get purchases" });
    }
  });

  // Admin: Get all boost packages (including inactive)
  app.get("/api/admin/boost-packages", requireAdmin, async (req, res) => {
    try {
      const packages = await storage.getBoostPackages(false);
      res.json(packages);
    } catch (error) {
      console.error("Admin get boost packages error:", error);
      res.status(500).json({ error: "Failed to get boost packages" });
    }
  });

  // Admin: Create boost package
  app.post("/api/admin/boost-packages", requireAdmin, async (req, res) => {
    try {
      const { name, nameRu, boostsPerType, priceStars, originalPriceStars, badge, badgeText, bonusLives, bonusSkinId, sortOrder, isActive } = req.body;
      
      if (!name || !nameRu || !boostsPerType || !priceStars) {
        return res.status(400).json({ error: "name, nameRu, boostsPerType, and priceStars are required" });
      }

      const pkg = await storage.createBoostPackage({
        name,
        nameRu,
        boostsPerType,
        priceStars,
        originalPriceStars: originalPriceStars || null,
        badge: badge || null,
        badgeText: badgeText || null,
        bonusLives: bonusLives || 0,
        bonusSkinId: bonusSkinId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      });
      res.json(pkg);
    } catch (error) {
      console.error("Create boost package error:", error);
      res.status(500).json({ error: "Failed to create boost package" });
    }
  });

  // Admin: Update boost package
  app.patch("/api/admin/boost-packages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, nameRu, boostsPerType, priceStars, originalPriceStars, badge, badgeText, bonusLives, bonusSkinId, sortOrder, isActive } = req.body;
      
      // Parse numeric - returns undefined for blank/invalid, allowing skip
      const parseNumeric = (val: any): number | undefined => {
        if (val === undefined || val === '' || val === null) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      };
      
      const updates: Record<string, any> = {};
      
      // String fields: only update if non-empty
      if (name !== undefined && name !== '') updates.name = name;
      if (nameRu !== undefined && nameRu !== '') updates.nameRu = nameRu;
      
      // Required numeric fields: only update if valid number provided
      const parsedBoostsPerType = parseNumeric(boostsPerType);
      if (parsedBoostsPerType !== undefined) updates.boostsPerType = parsedBoostsPerType;
      
      const parsedPriceStars = parseNumeric(priceStars);
      if (parsedPriceStars !== undefined) updates.priceStars = parsedPriceStars;
      
      // Optional numeric: null if explicitly cleared, undefined to skip
      const parsedOriginalPrice = parseNumeric(originalPriceStars);
      if (parsedOriginalPrice !== undefined) {
        updates.originalPriceStars = parsedOriginalPrice;
      } else if (originalPriceStars === '' || originalPriceStars === null) {
        updates.originalPriceStars = null;
      }
      
      // Optional text fields: null if explicitly cleared
      if (badge !== undefined) updates.badge = badge || null;
      if (badgeText !== undefined) updates.badgeText = badgeText || null;
      
      // Optional numeric with defaults: only update if valid number, skip blank to preserve existing
      const parsedBonusLives = parseNumeric(bonusLives);
      if (parsedBonusLives !== undefined) updates.bonusLives = parsedBonusLives;
      
      if (bonusSkinId !== undefined) updates.bonusSkinId = bonusSkinId || null;
      
      const parsedSortOrder = parseNumeric(sortOrder);
      if (parsedSortOrder !== undefined) updates.sortOrder = parsedSortOrder;
      
      if (isActive !== undefined) updates.isActive = isActive;
      
      const pkg = await storage.updateBoostPackage(id, updates);
      if (!pkg) {
        return res.status(404).json({ error: "Boost package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Update boost package error:", error);
      res.status(500).json({ error: "Failed to update boost package" });
    }
  });

  // Admin: Delete boost package
  app.delete("/api/admin/boost-packages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBoostPackage(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete boost package error:", error);
      res.status(500).json({ error: "Failed to delete boost package" });
    }
  });

  return httpServer;
}
