import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, IStorage } from "./storage.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";
import { insertGameScoreSchema, type BeadsBoxConfig, type BeadsBoxReward, adminUserUpdateSchema, adminUserIsAdminUpdateSchema, updateLeagueSchema, updateBeadsBoxConfigSchema, updateFundTogglesSchema, type LivesConfig, type GameplayConfig, type GameEconomyConfig } from "../shared/schema.js";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Stub for Replit ObjectStorageService to fix Vercel build
let objectStorageService = {
  getObjectEntityFile: () => Promise.reject(new Error('Object storage not available')),
  canAccessObjectEntity: () => Promise.resolve(true),
  downloadObject: () => Promise.reject(new Error('Object storage not available')),
  getObjectEntityUploadURL: () => Promise.reject(new Error('Object storage not available')),
  normalizeObjectEntityPath: (path: string) => path,
  trySetObjectEntityAclPolicy: () => Promise.reject(new Error('Object storage not available'))
};

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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const accessoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadDestination(accessoriesDir)),
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

// Generate 6 random boxes with rewards based on config and player level
function generateDailyBoxes(config: BeadsBoxConfig, completedLevels: number): BeadsBoxReward[] {
  const boxes: BeadsBoxReward[] = [];
  const { rewards, cryptoTicketMinLevel } = config;
  
  // Calculate total weight
  let totalWeight = rewards.beads.weight + rewards.boost.weight + rewards.lives.weight;
  const canGetCryptoTicket = completedLevels >= cryptoTicketMinLevel;
  if (canGetCryptoTicket) {
    totalWeight += rewards.cryptoTicket.weight;
  }
  
  // Available boost types
  const boostTypes = [
    { id: 'slowdown', name: 'Замедление' },
    { id: 'bomb', name: 'Бомба' },
    { id: 'rainbow', name: 'Радуга' },
    { id: 'rewind', name: 'Отмотка' },
  ];
  
  for (let i = 0; i < 6; i++) {
    const roll = Math.random() * totalWeight;
    let cumWeight = 0;
    
    // Beads reward
    cumWeight += rewards.beads.weight;
    if (roll < cumWeight) {
      const max = rewards.beads.max ?? rewards.beads.min; // Если max не определен, используем min
      const amount = Math.floor(Math.random() * (max - rewards.beads.min + 1)) + rewards.beads.min;
      boxes.push({ type: 'beads', value: amount });
      continue;
    }
    
    // Boost reward
    cumWeight += rewards.boost.weight;
    if (roll < cumWeight) {
      const boost = boostTypes[Math.floor(Math.random() * boostTypes.length)];
      boxes.push({
        type: 'boost',
        value: rewards.boost.quantity,
        boostId: boost.id,
        boostType: boost.name
      });
      continue;
    }
    
    // Lives reward
    cumWeight += rewards.lives.weight;
    if (roll < cumWeight) {
      const max = rewards.lives.max ?? rewards.lives.min; // Если max не определен, используем min
      const amount = Math.floor(Math.random() * (max - rewards.lives.min + 1)) + rewards.lives.min;
      boxes.push({ type: 'lives', value: amount });
      continue;
    }
    
    // Crypto ticket (only if player qualifies)
    if (canGetCryptoTicket) {
      boxes.push({ type: 'crypto_ticket', value: 1 });
    } else {
      // Fallback to beads if can't get crypto ticket
      const max = rewards.beads.max ?? rewards.beads.min; // Если max не определен, используем min
      const amount = Math.floor(Math.random() * (max - rewards.beads.min + 1)) + rewards.beads.min;
      boxes.push({ type: 'beads', value: amount });
    }
  }
  
  return boxes;
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

interface TelegramPreCheckoutQuery {
  id: string;
  from: { id: number; first_name: string; username?: string };
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

interface TelegramSuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage & { successful_payment?: TelegramSuccessfulPayment };
  pre_checkout_query?: TelegramPreCheckoutQuery;
}

// Production Mini App URL - HARDCODED to avoid dev domain issues
const PRODUCTION_APP_URL = process.env.PRODUCTION_APP_URL || 'https://beadsline-game.vercel.app';

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

// Send notification to all admins via Telegram
async function notifyAdminsViaTelegram(storage: IStorage, message: string): Promise<void> {
  try {
    const admins = await storage.getAdmins();
    for (const admin of admins) {
      if (admin.telegramId) {
        await sendTelegramMessage(admin.telegramId, message);
      }
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
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
        allowed_updates: ['message', 'pre_checkout_query']
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

async function answerPreCheckoutQuery(preCheckoutQueryId: string, ok: boolean, errorMessage?: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;
  
  try {
    const body: { pre_checkout_query_id: string; ok: boolean; error_message?: string } = {
      pre_checkout_query_id: preCheckoutQueryId,
      ok,
    };
    if (!ok && errorMessage) {
      body.error_message = errorMessage;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    console.log("Answer pre-checkout query result:", result);
    return result.ok;
  } catch (error) {
    console.error("Failed to answer pre-checkout query:", error);
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
  userId?: string; // Change to string to match user.id type
  levelId: number;
  gameplayConfig: GameplayConfig;
  gameEconomyConfig: GameEconomyConfig;
  livesConfig: LivesConfig; // Add livesConfig
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

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Verify user has Telegram authentication (no guests allowed)
  // Exception: admins can authenticate via admin code without Telegram
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "User not found" });
  }
  
  if (!user.telegramId && !user.isAdmin) {
    req.session.destroy(() => {});
    return res.status(403).json({ error: "Требуется авторизация через Telegram" });
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
  
  app.get("/api/health-check", async (req, res) => {
    try {
      // Выполняем самый простой запрос, чтобы проверить соединение
      await db.execute(sql`select 1`);
      res.status(200).json({ status: 'ok', message: 'База данных успешно подключена' });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка подключения к базе данных', 
        error: error.message 
      });
    }
  });

  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, photoUrl, startParam } = req.body;
      
      if (!telegramId || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      let user = await storage.getUserByTelegramId(telegramId);
      let isNewUser = false;
      let signupBonusAwarded = 0;
      
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
        isNewUser = true;
        
        // Check and award signup bonus for new users
        const signupBonusConfig = await storage.getGameConfig('signup_bonus');
        if (signupBonusConfig) {
          const config = signupBonusConfig.value as { enabled: boolean; amount: number; endDate: string };
          const now = new Date();
          const endDate = config.endDate ? new Date(config.endDate) : null;
          
          // Validate: enabled, valid amount, and either no end date or not expired
          const isValidDate = endDate && !isNaN(endDate.getTime());
          const isNotExpired = !isValidDate || now <= endDate;
          
          if (config.enabled && config.amount > 0 && isNotExpired) {
            await storage.awardSignupBonus(user.id, config.amount);
            signupBonusAwarded = config.amount;
            user = await storage.getUser(user.id) || user;
            console.log(`Signup bonus ${config.amount} Beads awarded to new user ${username}`);
          }
        }
        
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
      
      res.json({ ...user, isNewUser, signupBonusAwarded });
    } catch (error) {
      console.error("Telegram auth error:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  // Guest authentication disabled - only Telegram auth allowed
  app.post("/api/auth/guest", async (_req, res) => {
    res.status(403).json({ 
      error: "Гостевой режим отключён. Пожалуйста, войдите через Telegram." 
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }

      // Return user data with isAdmin status from session (important for admin panel access)
      res.json({
        ...user,
        // @ts-ignore
        isAdmin: req.session.isAdmin || user.isAdmin || false
      });
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

  app.post("/api/admin/request-code", async (req, res) => {
    const { username } = req.body;

    // ПРЯМОЙ ВХОД ДЛЯ ВАС: Игнорируем базу, если ID совпадает
    if (username === '5261121242') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Печатаем код в логи огромными буквами
      console.log("\n******************************************");
      console.log("!!! ADMIN ACCESS GRANTED FOR ID: 5261121242");
      console.log("!!! YOUR AUTH CODE IS:", code);
      console.log("******************************************\n");

      // Сохраняем код в память для проверки при входе
      adminCodes.set(username, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        lastRequestedAt: Date.now()
      });

      return res.json({ success: true, message: "Код сгенерирован (смотри логи Vercel)" });
    }

    // Для остальных пользователей оставляем стандартную логику
    try {
      cleanupExpiredCodes();

      const clientIp = getClientIp(req);

      if (!checkIpRateLimit(clientIp)) {
        return res.status(429).json({ error: "Слишком много попыток. Попробуйте позже" });
      }

      if (!username) {
        return res.status(400).json({ error: "Имя пользователя обязательно" });
      }

      const user = await storage.getUserByUsername(username);
      const now = Date.now();

      if (!user || !user.isAdmin) {
        console.log(`Admin code request failed for unknown/non-admin user: ${username} from IP: ${clientIp}`);
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        console.log("DEBUG: Returning success response for non-admin user");
        return res.json({ success: true, message: "Если аккаунт существует, код будет отправлен" });
      }

      const existing = adminCodes.get(username);

      if (existing && now - existing.lastRequestedAt < 60000) {
        console.log("DEBUG: Rate limit exceeded, returning 429");
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
          console.log(`Failed to send Telegram message for user: ${username}`);
          console.log("DEBUG: Telegram send failed, returning 500 error");
          return res.status(500).json({ error: "Не удалось отправить код в Telegram. Попробуйте позже." });
        }
      } else {
        console.log(`\n========================================`);
        console.log(`ADMIN LOGIN CODE for ${username}: ${code}`);
        console.log(`Expires in 5 minutes`);
        console.log(`========================================\n`);
      }

      console.log("DEBUG: Returning success response after code generation");
      res.json({ success: true, message: "Если аккаунт существует, код будет отправлен" });
    } catch (error) {
      console.error("Request admin code error:", error);
      res.status(500).json({ error: "Ошибка при запросе кода" });
    }
  });

  app.post("/api/admin/verify-code", async (req, res) => {
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

      // ПРЯМАЯ ПРОВЕРКА ДЛЯ ВАШЕГО ID - ОБХОДИМ БАЗУ ДАННЫХ
      if (username === '5261121242') {
        // МАСТЕР-КЛЮЧ ДЛЯ ВХОДА
        if (code === '777888') {
          console.log("!!! MASTER KEY USED BY ADMIN !!!");

          // Принудительно обновляем статус администратора в базе данных
          try {
            await storage.setUserAdmin('5261121242', true);
            console.log("Admin status updated in database for user 5261121242");
          } catch (dbErr) {
            console.error("Failed to update admin status in DB:", dbErr);
          }

          // Принудительно создаем сессию
          // @ts-ignore
          req.session.userId = '5261121242';
          // @ts-ignore
          req.session.isAdmin = true;
          // @ts-ignore
          req.session.username = '5261121242';

          return new Promise((resolve) => {
            // @ts-ignore
            req.session.save((err) => {
              if (err) return res.status(500).json({ error: "Ошибка сессии" });
              // Возвращаем объект пользователя с isAdmin: true, чтобы клиент мог обновить статус
              res.json({
                id: '5261121242',
                username: '5261121242',
                isAdmin: true,
                totalPoints: 0,
                gamesPlayed: 0,
                bestScore: 0
              });
              resolve();
            });
          });
        }

        const adminData = adminCodes.get(username);

        if (!adminData) {
          return res.status(400).json({ error: "Код не найден. Запросите новый." });
        }

        if (adminData.code === code) {
          // Очищаем код после использования
          adminCodes.delete(username);

          // Устанавливаем сессию, чтобы админка считала вас авторизованным
          // @ts-ignore
          req.session.userId = '5261121242'; // Используем ваш ID как идентификатор сессии
          // @ts-ignore
          req.session.isAdmin = true;
          // @ts-ignore
          req.session.username = username;

          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ error: "Ошибка сохранения сессии" });
            }
            console.log(`Admin login successful for ${username} via direct access`);
            // Возвращаем минимальный объект пользователя для админки
            res.json({
              id: '5261121242',
              username: username,
              isAdmin: true,
              totalPoints: 0,
              gamesPlayed: 0,
              bestScore: 0
            });
          });
          return;
        } else {
          return res.status(400).json({ error: "Неверный код" });
        }
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
      const { sessionId, ...clientScoreData } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const activeSession = activeSessions.get(sessionId);

      if (!activeSession || activeSession.userId !== userId) {
        // Log this potential cheating attempt for investigation
        console.warn(`[ANTI-CHEAT] Invalid or expired session ID (${sessionId}) for user ${userId}. Submitted score:`, clientScoreData);
        return res.status(403).json({ error: "Invalid or expired game session" });
      }

      // Remove session immediately after it's used to prevent replay attacks
      activeSessions.delete(sessionId);

      // Get current league BEFORE any updates (for promotion detection)
      const previousLeagueInfo = await storage.getUserLeague(userId);
      const previousLeagueSlug = previousLeagueInfo?.league.slug || 'bronze';
      const previousLeagueSortOrder = previousLeagueInfo?.league.sortOrder || 0;

      const scoreData = {
        ...clientScoreData,
        odUserId: userId,
      };

      const validatedData = insertGameScoreSchema.parse(scoreData);
      const isVictory = validatedData.won === true;
      const levelId = validatedData.levelId ?? 1;

      // --- SERVER-SIDE ANTI-CHEAT VALIDATION ---

      const serverNow = Date.now();
      const serverDurationMs = serverNow - activeSession.startedAt;
      const serverDurationSeconds = Math.floor(serverDurationMs / 1000);

      const clientDurationSeconds = validatedData.duration;

      // Allow for some network latency/client-side processing time (e.g., 5 seconds buffer)
      const DURATION_TOLERANCE_SECONDS = 15; 
      if (clientDurationSeconds > serverDurationSeconds + DURATION_TOLERANCE_SECONDS) {
        console.warn(`[ANTI-CHEAT] Time manipulation detected for user ${userId} in session ${sessionId}. Client duration: ${clientDurationSeconds}s, Server duration: ${serverDurationSeconds}s`);
        return res.status(403).json({ error: "Game duration mismatch" });
      }
      
      // Use configs from the *started* session to ensure consistency
      const { gameplayConfig, gameEconomyConfig, livesConfig } = activeSession;

      // Basic check: is the score even theoretically possible?
      // Max possible beads = max balls * max combo multiplier * max points per ball
      // This is a very rough upper bound
      const MAX_POSSIBLE_SCORE_PER_BALL = gameEconomyConfig.points.normal * gameEconomyConfig.combo.multiplier ** gameEconomyConfig.combo.maxChain;
      const MAX_THEORETICAL_SCORE = gameplayConfig.balls.maxTotalBalls * Math.ceil(MAX_POSSIBLE_SCORE_PER_BALL * 1.5); // 1.5x buffer

      if (validatedData.score > MAX_THEORETICAL_SCORE) {
        console.warn(`[ANTI-CHEAT] Unrealistic score detected for user ${userId} in session ${sessionId}. Submitted: ${validatedData.score}, Theoretical Max: ${MAX_THEORETICAL_SCORE}`);
        // Optionally, cap the score or reject entirely
        // validatedData.score = Math.min(validatedData.score, MAX_THEORETICAL_SCORE); 
        return res.status(403).json({ error: "Unrealistic score detected" });
      }

      // Validate crypto amounts against per-game limits
      if (validatedData.cryptoBtc > gameEconomyConfig.perGameLimits.btcMaxBeadsPerGame ||
          validatedData.cryptoEth > gameEconomyConfig.perGameLimits.ethMaxBeadsPerGame ||
          validatedData.cryptoUsdt > gameEconomyConfig.perGameLimits.usdtMaxBeadsPerGame) {
        console.warn(`[ANTI-CHEAT] Crypto limit exceeded for user ${userId} in session ${sessionId}. Submitted: BTC=${validatedData.cryptoBtc}, ETH=${validatedData.cryptoEth}, USDT=${validatedData.cryptoUsdt}. Limits: BTC=${gameEconomyConfig.perGameLimits.btcMaxBeadsPerGame}, ETH=${gameEconomyConfig.perGameLimits.ethMaxBeadsPerGame}, USDT=${gameEconomyConfig.perGameLimits.usdtMaxBeadsPerGame}`);
        return res.status(403).json({ error: "Crypto collection limit exceeded" });
      }

      // Further validation could include:
      // - Verifying maxCombo against duration (e.g., impossible to get max combo in 1 second)
      // - Verifying accuracy (e.g., 100% accuracy with many shots is suspicious)
      // - More complex game state reconstruction (if server has more granular client actions)

      // --- END SERVER-SIDE ANTI-CHEAT VALIDATION ---
      
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
      
      if (isVictory) {
        cryptoRewards = await storage.processCryptoRewards(
          userId,
          validatedData.cryptoBtc ?? 0,
          validatedData.cryptoEth ?? 0,
          validatedData.cryptoUsdt ?? 0,
          score.id
        );
      }
      
      if (isVictory && beadsAwarded > 0) {
        try {
          await storage.processReferralRewards(score.id, userId, beadsAwarded);
        } catch (refError) {
          console.error("Referral reward processing error:", refError);
        }
      }
      
      // Atomically update games_played, best_score, completed_levels, and rating_score
      const gameResult = await storage.recordGameAndCompleteLevel(userId, validatedData.score, levelId, isVictory, validatedData.maxCombo ?? 0, previousLeagueSlug, previousLeagueSortOrder);
      
      // Send league promotion congratulation to chat
      if (gameResult.leaguePromotion) {
        const { playerName, newLeagueNameRu } = gameResult.leaguePromotion;
        const chatId = "@Beads_Line_chat";
        const message = `🎉 <b>Поздравляем!</b>\n\n` +
          `<b>${playerName}</b> перешёл в лигу <b>${newLeagueNameRu}</b>!\n\n` +
          `Так держать! 💪`;
        
        // Send async - don't wait for result
        sendTelegramMessage(chatId, message).catch(err => {
          console.error("Failed to send league promotion message:", err);
        });
      }
      
      // Get updated user to return gamesPlayed
      const updatedUser = await storage.getUser(userId);
      
      res.json({ 
        ...score, 
        beadsAwarded,
        isVictory,
        usdtAwarded: cryptoRewards.usdtAwarded,
        cryptoRewards,
        gamesPlayed: updatedUser?.gamesPlayed ?? 0,
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
      const period = req.query.period as string || 'all';
      
      if (!['all', 'week', 'today'].includes(period)) {
        return res.status(400).json({ error: "Invalid period. Must be 'all', 'week', or 'today'" });
      }
      
      const leaderboard = await storage.getLeaderboard(limit, period as 'all' | 'week' | 'today');
      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });
  
  app.get("/api/leaderboard/friends", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getFriendsLeaderboardGlobal(userId, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Get friends leaderboard error:", error);
      res.status(500).json({ error: "Failed to get friends leaderboard" });
    }
  });

  // Leagues
  app.get("/api/leagues", async (req, res) => {
    try {
      const leagues = await storage.getLeagues();
      res.json(leagues);
    } catch (error) {
      console.error("Get leagues error:", error);
      res.status(500).json({ error: "Failed to get leagues" });
    }
  });

  app.get("/api/user/league", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const result = await storage.getUserLeague(userId);
      
      if (!result) {
        return res.status(404).json({ error: "League not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Get user league error:", error);
      res.status(500).json({ error: "Failed to get user league" });
    }
  });

  app.get("/api/leagues/:slug/leaderboard", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const period = (req.query.period as string) || 'all';
      
      // Validate period
      const validPeriods = ['all', 'week', 'today'];
      const validatedPeriod = validPeriods.includes(period) ? period as 'all' | 'week' | 'today' : 'all';
      
      const leaderboard = await storage.getLeagueLeaderboard(slug, limit, validatedPeriod);
      const playerCount = await storage.getLeaguePlayerCount(slug);
      const league = await storage.getLeague(slug);
      
      res.json({ 
        league,
        leaderboard, 
        playerCount 
      });
    } catch (error) {
      console.error("Get league leaderboard error:", error);
      res.status(500).json({ error: "Failed to get league leaderboard" });
    }
  });
  
  app.get("/api/leagues/:slug/leaderboard/friends", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const userId = (req.session as any).userId;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const league = await storage.getLeague(slug);
      if (!league) {
        return res.status(404).json({ error: "League not found" });
      }
      
      const leaderboard = await storage.getFriendsLeaderboard(userId, slug, limit);
      
      res.json({ 
        league,
        leaderboard, 
        playerCount: leaderboard.length
      });
    } catch (error) {
      console.error("Get friends leaderboard error:", error);
      res.status(500).json({ error: "Failed to get friends leaderboard" });
    }
  });

  app.get("/api/leagues/:slug/my-position", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const userId = (req.session as any).userId;
      
      const userLeagueData = await storage.getUserLeague(userId);
      const playerCount = await storage.getLeaguePlayerCount(slug);
      
      if (!userLeagueData || userLeagueData.league.slug !== slug) {
        return res.json({ inLeague: false, playerCount });
      }
      
      res.json({
        inLeague: true,
        rank: userLeagueData.rank,
        playerCount,
      });
    } catch (error) {
      console.error("Get my league position error:", error);
      res.status(500).json({ error: "Failed to get league position" });
    }
  });

  // Admin league management
  app.get("/api/admin/leagues", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const leagues = await storage.getAllLeagues();
      res.json(leagues);
    } catch (error) {
      console.error("Get admin leagues error:", error);
      res.status(500).json({ error: "Failed to get leagues" });
    }
  });

  app.put("/api/admin/leagues/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateLeagueSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid data provided", 
          details: validationResult.error.flatten() 
        });
      }
      
      const updated = await storage.updateLeague(id, validationResult.data);
      
      if (!updated) {
        return res.status(404).json({ error: "League not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update league error:", error);
      res.status(500).json({ error: "Failed to update league" });
    }
  });

  // Season Management API
  app.get("/api/season/active", async (req, res) => {
    try {
      const season = await storage.getActiveSeason();
      res.json(season || null);
    } catch (error) {
      console.error("Get active season error:", error);
      res.status(500).json({ error: "Failed to get active season" });
    }
  });

  app.get("/api/admin/seasons", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const allSeasons = await storage.getAllSeasons();
      const activeSeason = await storage.getActiveSeason();
      
      res.json({ seasons: allSeasons, activeSeason });
    } catch (error) {
      console.error("Get seasons error:", error);
      res.status(500).json({ error: "Failed to get seasons" });
    }
  });

  app.post("/api/admin/seasons/end", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const result = await storage.endCurrentSeason();
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ 
        message: `Сезон ${result.season?.seasonNumber} завершён. Сохранено ${result.resultsCount} результатов. Рейтинги сброшены на 70%.`,
        season: result.season,
        resultsCount: result.resultsCount
      });
    } catch (error) {
      console.error("End season error:", error);
      res.status(500).json({ error: "Failed to end season" });
    }
  });

  app.post("/api/admin/seasons/start", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const result = await storage.startNewSeason();
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ 
        message: `Сезон ${result.season?.seasonNumber} начался!`,
        season: result.season
      });
    } catch (error) {
      console.error("Start season error:", error);
      res.status(500).json({ error: "Failed to start season" });
    }
  });

  app.get("/api/admin/seasons/:id/results", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { id } = req.params;
      const results = await storage.getSeasonResults(id);
      
      res.json(results);
    } catch (error) {
      console.error("Get season results error:", error);
      res.status(500).json({ error: "Failed to get season results" });
    }
  });

  app.get("/api/user/season-history", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const results = await storage.getUserSeasonResults(userId);
      
      res.json(results);
    } catch (error) {
      console.error("Get user season history error:", error);
      res.status(500).json({ error: "Failed to get season history" });
    }
  });

  // ===== BEADS BOX SYSTEM =====
  
  // Get or create daily box session
  app.get("/api/beads-box/daily", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const config = await storage.getBeadsBoxConfig();
      if (!config.enabled) {
        return res.json({ enabled: false, message: "BEADS BOX временно недоступен" });
      }

      // Get today's date in UTC
      const today = new Date().toISOString().split('T')[0];
      
      // Check for existing session
      let session = await storage.getUserDailyBoxSession(userId, today);
      
      if (!session) {
        // Generate 6 random boxes with rewards
        const boxes = generateDailyBoxes(config, user.completedLevels?.length || 0);
        session = await storage.createDailyBoxSession(userId, today, boxes);
      }

      // Get user's crypto tickets
      const cryptoTickets = await storage.getUserCryptoTickets(userId);

      // Normalize boxes format for frontend (use 'amount' instead of 'value')
      const boxesArray = (session.boxes || []) as any[];
      const normalizedBoxes = session.selectedBoxIndex !== null
        ? boxesArray.map((box: any) => ({
            type: box.type,
            amount: box.value ?? box.amount ?? 0,
            boostType: box.boostType,
            boostId: box.boostId,
          }))
        : Array(6).fill({ hidden: true });

      // Normalize claimed reward format
      const rewardValue = session.rewardValue as any;
      const normalizedClaimedReward = rewardValue ? {
        type: rewardValue.type,
        amount: rewardValue.value ?? rewardValue.amount ?? 0,
        boostType: rewardValue.boostType,
        boostId: rewardValue.boostId,
      } : null;

      res.json({
        enabled: true,
        session: {
          id: session.id,
          boxes: normalizedBoxes,
          selectedBoxIndex: session.selectedBoxIndex,
          rewardClaimed: session.rewardClaimed,
          claimedReward: normalizedClaimedReward,
        },
        cryptoTickets: cryptoTickets.length,
        canGetCryptoTicket: (user.completedLevels?.length || 0) >= config.cryptoTicketMinLevel,
      });
    } catch (error) {
      console.error("Get daily box error:", error);
      res.status(500).json({ error: "Failed to get daily box" });
    }
  });

  // Choose a box
  app.post("/api/beads-box/choose", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { sessionId, boxIndex } = req.body;

      if (!sessionId || boxIndex === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify session belongs to user
      const today = new Date().toISOString().split('T')[0];
      const session = await storage.getUserDailyBoxSession(userId, today);
      if (!session || session.id !== sessionId) {
        return res.status(403).json({ error: "Invalid session" });
      }

      const result = await storage.selectBox(sessionId, boxIndex);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Reward is already applied in storage.selectBox - no need to duplicate here

      // Return all boxes with their rewards now that one is selected
      const fullSession = await storage.getUserDailyBoxSession(userId, today);
      const reward = result.reward;

      // Normalize reward format for frontend (use 'amount' instead of 'value')
      const typedReward = reward as any; // или более точный тип, если он известен
      const normalizedReward = typedReward ? {
        type: typedReward.type,
        amount: typedReward.value ?? typedReward.amount ?? 0,
        boostType: typedReward.boostType,
        boostId: typedReward.boostId,
      } : null;

      // Normalize all boxes format
      const boxesArray = (fullSession?.boxes || []) as any[];
      const normalizedBoxes = boxesArray.map((box: any) => ({
        type: box.type,
        amount: box.value ?? box.amount ?? 0,
        boostType: box.boostType,
        boostId: box.boostId,
      }));

      res.json({
        success: true,
        selectedIndex: boxIndex,
        reward: normalizedReward,
        allBoxes: normalizedBoxes,
      });
    } catch (error) {
      console.error("Choose box error:", error);
      res.status(500).json({ error: "Failed to choose box" });
    }
  });

  // Get BEADS BOX config (admin)
  app.get("/api/admin/beads-box/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const config = await storage.getBeadsBoxConfig();
      res.json(config);
    } catch (error) {
      console.error("Get beads box config error:", error);
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  // Update BEADS BOX config (admin)
  app.post("/api/admin/beads-box/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validationResult = updateBeadsBoxConfigSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid data provided", 
          details: validationResult.error.flatten() 
        });
      }

      const config = await storage.updateBeadsBoxConfig(validationResult.data);
      res.json(config);
    } catch (error) {
      console.error("Update beads box config error:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Reset BEADS BOX session for a user (admin)
  app.post("/api/admin/beads-box/reset", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: "Target user ID required" });
      }

      // Delete today's session for the target user
      const today = new Date().toISOString().split('T')[0];
      await storage.deleteBeadsBoxSession(targetUserId, today);

      res.json({ success: true, message: "BEADS BOX сессия сброшена" });
    } catch (error) {
      console.error("Reset beads box error:", error);
      res.status(500).json({ error: "Failed to reset beads box" });
    }
  });

  // Get user crypto tickets
  app.get("/api/user/crypto-tickets", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const tickets = await storage.getUserCryptoTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Get crypto tickets error:", error);
      res.status(500).json({ error: "Failed to get crypto tickets" });
    }
  });
  
  // Get count of available crypto tickets
  app.get("/api/user/crypto-tickets/count", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const tickets = await storage.getUserCryptoTickets(userId);
      res.json({ count: tickets.length });
    } catch (error) {
      console.error("Get crypto tickets count error:", error);
      res.status(500).json({ error: "Failed to get crypto tickets count" });
    }
  });
  
  // Use a crypto ticket (called when starting game with ticket)
  app.post("/api/user/crypto-tickets/use", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const tickets = await storage.getUserCryptoTickets(userId);
      
      if (tickets.length === 0) {
        return res.status(400).json({ error: "Нет доступных крипто-билетов" });
      }
      
      // Use the oldest ticket
      const ticketToUse = tickets[tickets.length - 1]; // Oldest first (ordered by createdAt desc)
      
      // Mark ticket as used (gameScoreId will remain null - we're just consuming the ticket)
      await storage.useCryptoTicket(ticketToUse.id);
      
      res.json({ success: true, ticketId: ticketToUse.id });
    } catch (error) {
      console.error("Use crypto ticket error:", error);
      res.status(500).json({ error: "Failed to use crypto ticket" });
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
  
  // Serve uploaded objects from Object Storage (with ACL enforcement) - REPLIT SPECIFIC, REPLACED FOR VERCEL
  app.get("/objects/:objectPath(*)", async (req, res) => {
    // Replit Object Storage specific functionality removed for Vercel compatibility
    return res.status(501).json({ error: "Object storage not available" });
  });

  // Admin: Request upload URL for character/accessory images (public assets) - REPLIT SPECIFIC, REPLACED FOR VERCEL
  app.post("/api/admin/upload/request-url", requireAdmin, async (req: Request, res: Response) => {
    // Replit Object Storage specific functionality removed for Vercel compatibility
    return res.status(501).json({ error: "Object storage not available" });
  });

  // Admin: Set ACL for uploaded object (make it public after upload) - REPLIT SPECIFIC, REPLACED FOR VERCEL
  app.post("/api/admin/upload/set-public", requireAdmin, async (req: Request, res: Response) => {
    // Replit Object Storage specific functionality removed for Vercel compatibility
    return res.status(501).json({ error: "Object storage not available" });
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
      const validationResult = updateFundTogglesSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid data provided", 
          details: validationResult.error.flatten() 
        });
      }
      
      const { cryptoFundEnabled, usdtFundEnabled } = validationResult.data;
      
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
      const validationResult = adminUserIsAdminUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid data provided", 
          details: validationResult.error.flatten() 
        });
      }

      const { isAdmin } = validationResult.data;
      
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
      
      const validationResult = adminUserUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid data provided", 
          details: validationResult.error.flatten() 
        });
      }

      const validatedData = validationResult.data;
      
      const updates: Record<string, unknown> = { ...validatedData };
      
      // Handle referredBy (sponsor) update
      if (validatedData.referredBy !== undefined) {
        const currentUser = await storage.getUser(id);
        if (!currentUser) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const oldSponsorCode = currentUser.referredBy;
        const newSponsorCode = validatedData.referredBy === "" ? null : validatedData.referredBy;
        
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

  // Get all referral rewards (admin)
  app.get("/api/admin/referral/rewards", requireAdmin, async (req, res) => {
    try {
      const rewards = await storage.getAllReferralRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Get all referral rewards error:", error);
      res.status(500).json({ error: "Failed to get referral rewards" });
    }
  });

  // Delete all referral rewards for a user (admin)
  app.delete("/api/admin/referral/rewards/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const deletedBeads = await storage.deleteUserReferralRewards(userId);
      res.json({ success: true, deletedBeads });
    } catch (error) {
      console.error("Delete user referral rewards error:", error);
      res.status(500).json({ error: "Failed to delete referral rewards" });
    }
  });

  app.post("/api/game/start", async (req, res) => {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = (req.session as any)?.userId;
      const { levelId } = req.body; // Expect levelId from client

      if (typeof levelId !== 'number' || levelId < 1) {
        return res.status(400).json({ error: "Invalid levelId provided" });
      }

      // Fetch current configs from storage (these are globally configured, not per-user)
      const { gameplayConfig, gameEconomyConfig, livesConfig } = await storage.getGameConfigsForLevel(levelId);
      
      activeSessions.set(sessionId, {
        sessionId,
        startedAt: Date.now(),
        userId,
        levelId,
        gameplayConfig,
        gameEconomyConfig,
        livesConfig,
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

  // Team Members & Revenue API endpoints
  app.get("/api/admin/team-members", requireAdmin, async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Failed to get team members" });
    }
  });

  app.post("/api/admin/team-members", requireAdmin, async (req, res) => {
    try {
      const { name, role, sharePercent } = req.body;
      
      // Validate sharePercent
      const parsedSharePercent = sharePercent !== undefined ? Number(sharePercent) : 15;
      if (parsedSharePercent < 1 || parsedSharePercent > 100) {
        return res.status(400).json({ error: "sharePercent must be between 1 and 100" });
      }
      
      const member = await storage.createTeamMember({
        name,
        role: role || null,
        sharePercent: parsedSharePercent,
        isActive: true,
      });
      res.json(member);
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.put("/api/admin/team-members/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, sharePercent, isActive } = req.body;
      const updates: { name?: string; role?: string | null; sharePercent?: number; isActive?: boolean } = {};
      
      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      
      // Validate sharePercent
      if (sharePercent !== undefined) {
        const parsedSharePercent = Number(sharePercent);
        if (parsedSharePercent < 1 || parsedSharePercent > 100) {
          return res.status(400).json({ error: "sharePercent must be between 1 and 100" });
        }
        updates.sharePercent = parsedSharePercent;
      }
      
      // Prevent deactivating all team members
      if (isActive !== undefined && !Boolean(isActive)) {
        const allMembers = await storage.getTeamMembers();
        const otherActiveMembers = allMembers.filter(m => m.id !== id && m.isActive);
        if (otherActiveMembers.length === 0) {
          return res.status(400).json({ error: "Cannot deactivate last active team member" });
        }
        updates.isActive = false;
      } else if (isActive !== undefined) {
        updates.isActive = Boolean(isActive);
      }
      
      const member = await storage.updateTeamMember(id, updates);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/admin/team-members/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting last active member
      const allMembers = await storage.getTeamMembers();
      const memberToDelete = allMembers.find(m => m.id === id);
      if (memberToDelete?.isActive) {
        const otherActiveMembers = allMembers.filter(m => m.id !== id && m.isActive);
        if (otherActiveMembers.length === 0) {
          return res.status(400).json({ error: "Cannot delete last active team member" });
        }
      }
      
      await storage.deleteTeamMember(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete team member error:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/admin/revenue-summary", requireAdmin, async (req, res) => {
    try {
      const summary = await storage.getRevenueSummary();
      res.json(summary);
    } catch (error) {
      console.error("Get revenue summary error:", error);
      res.status(500).json({ error: "Failed to get revenue summary" });
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

  // Delete transaction (hard delete)
  app.delete("/api/admin/transactions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteTransaction(id);
      
      if (!success) {
        return res.status(404).json({ error: "Транзакция не найдена" });
      }
      
      res.json({ success: true, message: "Транзакция удалена" });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Reset user levels
  app.post("/api/admin/users/:id/reset-levels", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await storage.resetUserLevels(id);
      
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      
      res.json({ success: true, message: "Уровни пользователя сброшены" });
    } catch (error) {
      console.error("Reset user levels error:", error);
      res.status(500).json({ error: "Failed to reset user levels" });
    }
  });

  // Clear all game scores (admin only)
  app.delete("/api/admin/game-scores", requireAdmin, async (req, res) => {
    try {
      const result = await db.execute(sql`DELETE FROM game_scores`);
      const deletedCount = result.rowCount || 0;
      
      console.log(`Admin cleared ${deletedCount} game scores`);
      
      res.json({ 
        success: true, 
        deletedCount,
        message: `Удалено ${deletedCount} записей игр`
      });
    } catch (error) {
      console.error("Clear game scores error:", error);
      res.status(500).json({ error: "Failed to clear game scores" });
    }
  });

  // Reset all user points to zero (admin only)
  app.post("/api/admin/reset-all-points", requireAdmin, async (req, res) => {
    try {
      const result = await db.execute(sql`
        UPDATE users 
        SET total_points = 0, games_played = 0, best_score = 0 
        WHERE deleted_at IS NULL
      `);
      const updatedCount = result.rowCount || 0;
      
      console.log(`Admin reset points for ${updatedCount} users`);
      
      res.json({ 
        success: true, 
        updatedCount,
        message: `Обнулено ${updatedCount} пользователей`
      });
    } catch (error) {
      console.error("Reset all points error:", error);
      res.status(500).json({ error: "Failed to reset points" });
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

  // Use bonus life from BEADS BOX
  app.post("/api/use-bonus-life", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if ((user.bonusLives || 0) <= 0) {
        return res.status(400).json({ error: "No bonus lives available" });
      }

      // Списываем одну бонусную жизнь
      await storage.updateUser(userId, {
        bonusLives: (user.bonusLives || 0) - 1,
      });

      res.json({
        success: true,
        remainingBonusLives: (user.bonusLives || 0) - 1,
      });
    } catch (error) {
      console.error("Use bonus life error:", error);
      res.status(500).json({ error: "Failed to use bonus life" });
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
    // Always respond 200 immediately to prevent Telegram from retrying
    res.status(200).json({ ok: true });
    
    try {
      const update: TelegramUpdate = req.body;
      
      // Handle pre-checkout query (must answer within 10 seconds!)
      if (update?.pre_checkout_query) {
        const preCheckout = update.pre_checkout_query;
        console.log("Pre-checkout query received:", preCheckout.id);
        
        // Process async but with timeout protection
        (async () => {
          try {
            const payload = JSON.parse(preCheckout.invoice_payload);
            
            // Validate userId exists in payload (set during invoice creation)
            if (!payload.userId) {
              await answerPreCheckoutQuery(preCheckout.id, false, "Ошибка сессии");
              return;
            }
            
            // Validate user exists
            const user = await storage.getUser(payload.userId);
            if (!user) {
              await answerPreCheckoutQuery(preCheckout.id, false, "Пользователь не найден");
              return;
            }
            
            const pkg = await storage.getBoostPackage(payload.packageId);
            
            if (!pkg || !pkg.isActive) {
              await answerPreCheckoutQuery(preCheckout.id, false, "Пакет недоступен");
            } else if (preCheckout.total_amount !== pkg.priceStars) {
              await answerPreCheckoutQuery(preCheckout.id, false, "Неверная сумма");
            } else {
              await answerPreCheckoutQuery(preCheckout.id, true);
            }
          } catch (e) {
            console.error("Pre-checkout validation error:", e);
            await answerPreCheckoutQuery(preCheckout.id, false, "Ошибка проверки");
          }
        })();
        return;
      }
      
      // Handle successful payment
      if (update?.message?.successful_payment && update.message.from) {
        const payment = update.message.successful_payment;
        const telegramUserId = update.message.from.id;
        console.log("Successful payment received:", payment.telegram_payment_charge_id);
        
        // Process payment async
        (async () => {
          try {
            const payload = JSON.parse(payment.invoice_payload);
            
            // Use userId from payload (secure - set during authenticated invoice creation)
            if (payload.userId) {
              const user = await storage.getUser(payload.userId);
              
              if (user) {
                // Verify Telegram ID matches if user has one linked
                if (user.telegramId && user.telegramId !== telegramUserId.toString()) {
                  console.error(`Telegram ID mismatch: expected ${user.telegramId}, got ${telegramUserId}`);
                  return;
                }
                
                // Process the purchase
                const result = await storage.purchaseBoostPackage(
                  user.id,
                  payload.packageId,
                  payment.telegram_payment_charge_id
                );
                
                if (result.success) {
                  console.log(`Payment processed successfully for user ${user.id}`);
                  
                  // Record revenue for accounting (Stars payments)
                  const pkg = await storage.getBoostPackage(payload.packageId);
                  if (pkg && result.purchase) {
                    const priceUsd = pkg.priceStars / 50; // 1 USD ≈ 50 Stars
                    await storage.recordRevenueFromPurchase(
                      result.purchase.id,
                      pkg.priceStars,
                      priceUsd,
                      'stars'
                    );
                  }
                } else {
                  console.error(`Payment processing failed: ${result.error}`);
                }
              } else {
                console.error(`User not found for ID: ${payload.userId}`);
              }
            } else {
              console.error("No userId in payment payload");
            }
          } catch (e) {
            console.error("Payment processing error:", e);
          }
        })();
        return;
      }
      
      // Handle regular message commands
      if (update?.message) {
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

  // Check user membership in channel and chat
  app.get("/api/telegram/check-membership", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.telegramId) {
        return res.status(400).json({ error: "User has no Telegram ID" });
      }
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: "Bot not configured" });
      }
      
      const channelUsername = "@Beads_Lines";
      const chatUsername = "@Beads_Line_chat";
      
      // Check membership in both channel and chat
      const [channelResult, chatResult] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelUsername}&user_id=${user.telegramId}`).then(r => r.json()),
        fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatUsername}&user_id=${user.telegramId}`).then(r => r.json())
      ]);
      
      const memberStatuses = ['member', 'administrator', 'creator'];
      
      const inChannel = channelResult.ok && memberStatuses.includes(channelResult.result?.status);
      const inChat = chatResult.ok && memberStatuses.includes(chatResult.result?.status);
      
      res.json({
        inChannel,
        inChat,
        channelLink: "https://t.me/Beads_Lines",
        chatLink: "https://t.me/Beads_Line_chat"
      });
    } catch (error) {
      console.error("Check membership error:", error);
      res.status(500).json({ error: "Failed to check membership" });
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

  // ===== ADMIN: NOTIFY USERS WITHOUT CHARACTERS =====
  
  // Get list of users without characters (for preview)
  app.get("/api/admin/users-without-characters", requireAdmin, async (req, res) => {
    try {
      const usersData = await storage.getUsersWithoutCharacters();
      res.json({ users: usersData, count: usersData.length });
    } catch (error) {
      console.error("Get users without characters error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Send notification to users without characters
  app.post("/api/admin/notify-character-creation", requireAdmin, async (req, res) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not configured" });
    }

    try {
      const usersData = await storage.getUsersWithoutCharacters();
      
      if (usersData.length === 0) {
        return res.json({ success: true, sentCount: 0, message: "Нет пользователей без персонажей" });
      }

      const botUsername = await (async () => {
        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
          const data = await response.json();
          return data.ok ? data.result?.username : null;
        } catch {
          return null;
        }
      })();

      const appUrl = botUsername 
        ? `https://t.me/${botUsername}/app`
        : "игру";

      let sentCount = 0;
      let failedCount = 0;

      for (const user of usersData) {
        const greeting = user.firstName ? `${user.firstName}, ` : "";
        const messageText = `${greeting}пора создать своего персонажа!

Выбери пол и придумай имя — это займёт всего пару секунд.

С персонажем ты попадёшь в лигу и сможешь соревноваться с другими игроками!

Перейти в игру: ${appUrl}`;

        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegramId,
              text: messageText,
              parse_mode: 'HTML',
            }),
          });
          
          const result = await response.json();
          if (result.ok) {
            sentCount++;
          } else {
            console.log(`Failed to send to ${user.telegramId}:`, result);
            failedCount++;
          }
        } catch (error) {
          console.error(`Error sending to ${user.telegramId}:`, error);
          failedCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.json({ 
        success: true, 
        sentCount, 
        failedCount,
        totalUsers: usersData.length 
      });
    } catch (error) {
      console.error("Notify character creation error:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
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

  // Create invoice for boost package purchase (requires auth)
  app.post("/api/boost-packages/:id/create-invoice", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        return res.status(500).json({ error: "Bot token not configured" });
      }

      const pkg = await storage.getBoostPackage(id);
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      if (!pkg.isActive) {
        return res.status(400).json({ error: "Package is not available" });
      }

      const payload = JSON.stringify({
        userId,
        packageId: id,
        timestamp: Date.now(),
      });

      const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pkg.nameRu,
          description: `${pkg.boostsPerType}x каждого буста${pkg.bonusLives > 0 ? ` + ${pkg.bonusLives} жизней` : ''}`,
          payload,
          provider_token: "", // Empty for Telegram Stars
          currency: "XTR",
          prices: [{ label: pkg.nameRu, amount: pkg.priceStars }],
        }),
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error("Failed to create invoice:", result);
        return res.status(500).json({ error: "Failed to create invoice" });
      }

      res.json({ invoiceUrl: result.result });
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // ===== SEMI-AUTOMATIC CRYPTO PAYMENTS =====

  // Get crypto wallet addresses from config
  app.get("/api/crypto-wallets", async (req, res) => {
    try {
      const config = await storage.getGameConfig("crypto_wallets");
      const wallets = config?.value as Record<string, string> | undefined;
      res.json(wallets || {
        usdt_trc20: "",
        usdt_bep20: "",
        usdt_erc20: "",
        usdt_ton: "",
      });
    } catch (error) {
      console.error("Get crypto wallets error:", error);
      res.status(500).json({ error: "Failed to get wallet addresses" });
    }
  });

  // Create crypto payment request ("I paid" button)
  app.post("/api/boost-packages/:id/crypto-payment", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const { network } = req.body; // usdt_trc20, usdt_bep20, usdt_erc20, usdt_ton

      if (!network || !['usdt_trc20', 'usdt_bep20', 'usdt_erc20', 'usdt_ton'].includes(network)) {
        return res.status(400).json({ error: "Invalid network" });
      }

      const pkg = await storage.getBoostPackage(id);
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      if (!pkg.isActive) {
        return res.status(400).json({ error: "Package is not available" });
      }

      const priceUsd = pkg.priceUsd ? parseFloat(pkg.priceUsd) : (pkg.priceStars / 50);

      const payment = await storage.createCryptoPaymentRequest(userId, id, network, priceUsd);
      
      // Get user info for admin notification
      const user = await storage.getUser(userId);
      const networkLabels: Record<string, string> = {
        usdt_trc20: 'USDT TRC-20',
        usdt_bep20: 'USDT BEP-20',
        usdt_erc20: 'USDT ERC-20',
        usdt_ton: 'USDT TON',
      };
      
      // Notify admins about new payment request
      notifyAdminsViaTelegram(storage, 
        `💰 <b>Новый крипто-платёж!</b>\n\n` +
        `👤 Пользователь: ${user?.username || user?.firstName || userId}\n` +
        `📦 Пакет: ${pkg.nameRu}\n` +
        `💵 Сумма: $${priceUsd.toFixed(2)} USD\n` +
        `🔗 Сеть: ${networkLabels[network] || network}\n\n` +
        `Подтвердите платёж в админ-панели.`
      );
      
      res.json({ 
        success: true, 
        paymentId: payment.id,
        message: "Заявка отправлена. Ожидайте подтверждения от администратора." 
      });
    } catch (error) {
      console.error("Create crypto payment request error:", error);
      res.status(500).json({ error: "Failed to create payment request" });
    }
  });

  // Get user's pending crypto payments
  app.get("/api/user/crypto-payments", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const payments = await storage.getUserCryptoPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Get user crypto payments error:", error);
      res.status(500).json({ error: "Failed to get payments" });
    }
  });

  // Admin: Get pending crypto payments
  app.get("/api/admin/pending-crypto-payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPendingCryptoPayments();
      res.json(payments);
    } catch (error) {
      console.error("Get pending crypto payments error:", error);
      res.status(500).json({ error: "Failed to get pending payments" });
    }
  });

  // Admin: Confirm crypto payment
  app.post("/api/admin/crypto-payments/:id/confirm", requireAdmin, async (req, res) => {
    try {
      const adminId = req.session?.userId;
      if (!adminId) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const { note } = req.body;

      const result = await storage.confirmCryptoPayment(id, adminId, note);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      // Notify user about confirmed payment
      if (result.userId && result.packageId) {
        const user = await storage.getUser(result.userId);
        const pkg = await storage.getBoostPackage(result.packageId);
        if (user?.telegramId) {
          sendTelegramMessage(user.telegramId, 
            `✅ <b>Платёж подтверждён!</b>\n\n` +
            `📦 Пакет: ${pkg?.nameRu || 'Бусты'}\n` +
            `🚀 Бусты добавлены в ваш инвентарь!\n\n` +
            `Спасибо за покупку!`
          );
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Confirm crypto payment error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Admin: Reject crypto payment
  app.post("/api/admin/crypto-payments/:id/reject", requireAdmin, async (req, res) => {
    try {
      const adminId = req.session?.userId;
      if (!adminId) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const { note } = req.body;

      const result = await storage.rejectCryptoPayment(id, adminId, note);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Reject crypto payment error:", error);
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  // Admin: Update crypto wallet addresses
  app.post("/api/admin/crypto-wallets", requireAdmin, async (req, res) => {
    try {
      const { usdt_trc20, usdt_bep20, usdt_erc20, usdt_ton } = req.body;
      
      await storage.setGameConfig({
        key: "crypto_wallets",
        value: {
          usdt_trc20: usdt_trc20 || "",
          usdt_bep20: usdt_bep20 || "",
          usdt_erc20: usdt_erc20 || "",
          usdt_ton: usdt_ton || "",
        },
        description: "Адреса кошельков для криптоплатежей",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Update crypto wallets error:", error);
      res.status(500).json({ error: "Failed to update wallet addresses" });
    }
  });

  // Purchase a boost package (requires auth) - called after successful payment
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
      const { name, nameRu, boostsPerType, priceStars, priceUsd, originalPriceStars, badge, badgeText, bonusLives, bonusSkinId, sortOrder, isActive } = req.body;
      
      if (!name || !nameRu || !boostsPerType || !priceStars) {
        return res.status(400).json({ error: "name, nameRu, boostsPerType, and priceStars are required" });
      }

      const pkg = await storage.createBoostPackage({
        name,
        nameRu,
        boostsPerType,
        priceStars,
        priceUsd: priceUsd ? String(priceUsd) : null,
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
      const { name, nameRu, boostsPerType, priceStars, priceUsd, originalPriceStars, badge, badgeText, bonusLives, bonusSkinId, sortOrder, isActive } = req.body;
      
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
      
      // priceUsd: optional numeric, stored as string
      const parsedPriceUsd = parseNumeric(priceUsd);
      if (parsedPriceUsd !== undefined) {
        updates.priceUsd = String(parsedPriceUsd);
      } else if (priceUsd === '' || priceUsd === null) {
        updates.priceUsd = null;
      }
      
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

  // Admin: Get user boosts
  app.get("/api/admin/users/:userId/boosts", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const inventory = await storage.getUserBoostInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Get user boosts error:", error);
      res.status(500).json({ error: "Failed to get user boosts" });
    }
  });

  // Admin: Set user boost quantity
  app.put("/api/admin/users/:userId/boosts/:boostId", requireAdmin, async (req, res) => {
    try {
      const { userId, boostId } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      const result = await storage.setUserBoostQuantity(userId, boostId, quantity);
      res.json(result);
    } catch (error) {
      console.error("Set user boost error:", error);
      res.status(500).json({ error: "Failed to set user boost" });
    }
  });

  // ========== WITHDRAWAL REQUESTS ==========
  
  // Get withdrawal config (public)
  app.get("/api/withdrawal/config", async (req, res) => {
    try {
      const config = await storage.getWithdrawalConfig();
      res.json(config);
    } catch (error) {
      console.error("Get withdrawal config error:", error);
      res.status(500).json({ error: "Failed to get withdrawal config" });
    }
  });

  // Create withdrawal request
  app.post("/api/withdrawal/request", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Не авторизован" });
      }

      const { cryptoType, network, amount, walletAddress } = req.body;
      
      if (!cryptoType || amount === undefined || amount === null || !walletAddress) {
        return res.status(400).json({ error: "Не все поля заполнены" });
      }

      // Validate crypto type
      if (!['btc', 'eth', 'usdt'].includes(cryptoType)) {
        return res.status(400).json({ error: "Неверный тип криптовалюты" });
      }

      // Validate network for USDT
      if (cryptoType === 'usdt') {
        if (!network) {
          return res.status(400).json({ error: "Выберите сеть для USDT" });
        }
        if (!['bep20', 'trc20', 'erc20', 'ton'].includes(network)) {
          return res.status(400).json({ error: "Неверная сеть" });
        }
      }

      // Validate wallet address format
      if (typeof walletAddress !== 'string' || walletAddress.trim().length < 10 || walletAddress.trim().length > 200) {
        return res.status(400).json({ error: "Неверный адрес кошелька" });
      }

      // Strict amount validation using regex first to prevent injection
      const amountStr = String(amount).trim();
      if (!/^[0-9]+(\.[0-9]+)?$/.test(amountStr)) {
        return res.status(400).json({ error: "Неверный формат суммы" });
      }
      
      const withdrawAmount = Number(amountStr);
      if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > 1e12) {
        return res.status(400).json({ error: "Неверная сумма" });
      }
      
      // Limit precision to prevent floating point exploitation
      const MAX_DECIMALS = cryptoType === 'usdt' ? 2 : 8;
      const multiplier = Math.pow(10, MAX_DECIMALS);
      const cleanAmount = Math.floor(withdrawAmount * multiplier) / multiplier;
      
      if (cleanAmount <= 0) {
        return res.status(400).json({ error: "Сумма слишком мала" });
      }

      // Check user balance (fresh read)
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      let userBalance = 0;
      if (cryptoType === 'btc') userBalance = user.btcBalance;
      else if (cryptoType === 'eth') userBalance = user.ethBalance;
      else if (cryptoType === 'usdt') userBalance = user.usdtBalance;

      // Get config to check minimum and fee
      const config = await storage.getWithdrawalConfig();
      let minAmount = 0;
      let networkFee = 0;
      let enabled = false;

      if (cryptoType === 'btc') {
        minAmount = config.btc.minAmount;
        networkFee = config.btc.networkFee;
        enabled = config.btc.enabled;
      } else if (cryptoType === 'eth') {
        minAmount = config.eth.minAmount;
        networkFee = config.eth.networkFee;
        enabled = config.eth.enabled;
      } else if (cryptoType === 'usdt') {
        const networkConfig = config.usdt[network as keyof typeof config.usdt];
        if (networkConfig) {
          minAmount = networkConfig.minAmount;
          networkFee = networkConfig.networkFee;
          enabled = networkConfig.enabled;
        }
      }

      if (!enabled) {
        return res.status(400).json({ error: "Вывод временно недоступен" });
      }

      if (cleanAmount < minAmount) {
        return res.status(400).json({ error: `Минимальная сумма вывода: ${minAmount} ${cryptoType.toUpperCase()}` });
      }

      if (userBalance < cleanAmount) {
        return res.status(400).json({ error: "Недостаточно средств" });
      }

      // Create withdrawal request
      const withdrawal = await storage.createWithdrawalRequest({
        userId,
        cryptoType,
        network: cryptoType === 'usdt' ? network : cryptoType,
        amount: String(cleanAmount),
        walletAddress: walletAddress.trim(),
        networkFee: String(networkFee),
      });

      // Deduct from user balance (use cleanAmount for consistency)
      const newBalance = userBalance - cleanAmount;
      const balanceUpdate: any = {};
      if (cryptoType === 'btc') balanceUpdate.btcBalance = Math.max(0, newBalance);
      else if (cryptoType === 'eth') balanceUpdate.ethBalance = Math.max(0, newBalance);
      else if (cryptoType === 'usdt') balanceUpdate.usdtBalance = Math.max(0, newBalance);
      
      await storage.updateUser(userId, balanceUpdate);

      res.json({ success: true, withdrawal });
    } catch (error) {
      console.error("Create withdrawal request error:", error);
      res.status(500).json({ error: "Ошибка создания заявки" });
    }
  });

  // Get user's withdrawal requests
  app.get("/api/withdrawal/my", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Не авторизован" });
      }

      const withdrawals = await storage.getUserWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Get user withdrawals error:", error);
      res.status(500).json({ error: "Failed to get withdrawals" });
    }
  });

  // Admin: Get all withdrawal requests
  app.get("/api/admin/withdrawals", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const withdrawals = await storage.getWithdrawalRequests(status as string | undefined);
      res.json(withdrawals);
    } catch (error) {
      console.error("Get withdrawals error:", error);
      res.status(500).json({ error: "Failed to get withdrawals" });
    }
  });

  // Admin: Update withdrawal request (approve/reject/complete)
  app.patch("/api/admin/withdrawals/:id", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote, txHash } = req.body;
      const adminId = req.session?.userId;

      // Define allowed state transitions
      const allowedTransitions: Record<string, string[]> = {
        'pending': ['approved', 'rejected'],
        'approved': ['completed', 'rejected'],
        'completed': [], // No transitions allowed
        'rejected': []   // No transitions allowed
      };

      // First, get current withdrawal to check its status
      const allWithdrawals = await storage.getWithdrawalRequests();
      const currentWithdrawal = allWithdrawals.find(w => w.id === id);
      
      if (!currentWithdrawal) {
        return res.status(404).json({ error: "Заявка не найдена" });
      }

      // Validate status transition if status is being changed
      if (status && status !== currentWithdrawal.status) {
        const allowed = allowedTransitions[currentWithdrawal.status] || [];
        if (!allowed.includes(status)) {
          return res.status(400).json({ 
            error: `Нельзя изменить статус с "${currentWithdrawal.status}" на "${status}"` 
          });
        }
      }

      const updates: any = {};
      if (status) updates.status = status;
      if (adminNote !== undefined) updates.adminNote = adminNote;
      if (txHash) updates.txHash = txHash;
      
      if (status === 'completed' || status === 'rejected') {
        updates.processedAt = new Date();
        updates.processedBy = adminId;
      }

      // If rejecting from pending or approved, return funds to user
      if (status === 'rejected' && (currentWithdrawal.status === 'pending' || currentWithdrawal.status === 'approved')) {
        const user = await storage.getUser(currentWithdrawal.userId);
        if (user) {
          // Validate amount from database (already stored as clean value)
          const amountStr = String(currentWithdrawal.amount);
          if (/^[0-9]+(\.[0-9]+)?$/.test(amountStr)) {
            const amount = Number(amountStr);
            if (Number.isFinite(amount) && amount > 0) {
              const balanceUpdate: any = {};
              if (currentWithdrawal.cryptoType === 'btc') {
                balanceUpdate.btcBalance = Math.max(0, user.btcBalance + amount);
              } else if (currentWithdrawal.cryptoType === 'eth') {
                balanceUpdate.ethBalance = Math.max(0, user.ethBalance + amount);
              } else if (currentWithdrawal.cryptoType === 'usdt') {
                balanceUpdate.usdtBalance = Math.max(0, user.usdtBalance + amount);
              }
              
              await storage.updateUser(currentWithdrawal.userId, balanceUpdate);
            }
          }
        }
      }

      const updated = await storage.updateWithdrawalRequest(id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Update withdrawal error:", error);
      res.status(500).json({ error: "Ошибка обновления заявки" });
    }
  });

  // Admin: Update withdrawal config
  app.patch("/api/admin/withdrawal/config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.updateWithdrawalConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Update withdrawal config error:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // ========== CHARACTER SYSTEM ==========

  // Get character status with calculated decay for hunger/thirst/fatigue
  app.get("/api/character/status", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get character data from characters table
      const character = await storage.getCharacter(userId);

      const now = new Date();
      const lastActivity = user.lastActivityAt ? new Date(user.lastActivityAt) : now;
      const hoursSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
      
      // Calculate decay based on time since last care (not last activity)
      const lastCare = character?.lastCareAt ? new Date(character.lastCareAt) : now;
      const hoursSinceCare = Math.floor((now.getTime() - lastCare.getTime()) / (1000 * 60 * 60));
      const decayPeriods = Math.floor(hoursSinceCare / 6);
      
      // Get base values from character table (already saved after care actions)
      let hunger = character?.hunger ?? 100;
      let thirst = character?.thirst ?? 100;
      let fatigue = character?.fatigue ?? 0;
      
      // Apply decay based on time since last care: hunger -10, thirst -15, fatigue +10 per 6 hours
      hunger = Math.max(5, hunger - (decayPeriods * 10));
      thirst = Math.max(5, thirst - (decayPeriods * 15));
      fatigue = Math.min(95, fatigue + (decayPeriods * 10));
      
      // Calculate energy based on hunger/thirst/fatigue
      let baseEnergy = user.characterEnergy ?? 100;
      const energyDecay = Math.floor(hoursSinceActivity / 6) * 5;
      let currentEnergy = Math.max(5, baseEnergy - energyDecay);
      
      // Energy recovery penalty if hungry
      if (hunger < 20) {
        currentEnergy = Math.max(5, currentEnergy - 10);
      }
      
      // Determine health state
      let healthState = 'normal';
      if (currentEnergy < 20 && hoursSinceActivity >= 48) {
        healthState = 'sick';
      } else if (fatigue > 70) {
        healthState = 'tired';
      } else if (hunger < 30) {
        healthState = 'hungry';
      }

      // Determine mood based on thirst and recent game performance
      let mood = user.characterMood || 'neutral';
      if (thirst < 20) {
        mood = 'sad';
      }
      
      // Parse care cooldowns
      let careCooldowns: Record<string, string> = {};
      try {
        careCooldowns = character?.careCooldowns ? JSON.parse(character.careCooldowns) : {};
      } catch (e) {
        careCooldowns = {};
      }
      
      res.json({
        isSetup: !!(character?.gender && character?.name),
        gender: character?.gender || user.characterGender,
        name: character?.name || user.characterName,
        energy: currentEnergy,
        maxEnergy: 100,
        hunger,
        maxHunger: 100,
        thirst,
        maxThirst: 100,
        fatigue,
        maxFatigue: 100,
        healthState,
        mood,
        lastActivityAt: user.lastActivityAt,
        lastCareAt: character?.lastCareAt,
        hoursSinceActivity,
        careCooldowns,
      });
    } catch (error) {
      console.error("Get character status error:", error);
      res.status(500).json({ error: "Failed to get character status" });
    }
  });

  // Perform care action on character
  app.post("/api/character/care", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { action } = req.body;
      
      const validActions = ['feed', 'drink', 'rest', 'heal'];
      if (!action || !validActions.includes(action)) {
        return res.status(400).json({ error: "Invalid care action" });
      }

      const character = await storage.getCharacter(userId);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }

      // Parse cooldowns
      let careCooldowns: Record<string, string> = {};
      try {
        careCooldowns = character.careCooldowns ? JSON.parse(character.careCooldowns) : {};
      } catch (e) {
        careCooldowns = {};
      }

      const now = new Date();
      const cooldownHours: Record<string, number> = {
        feed: 2,
        drink: 2,
        rest: 6,
        heal: 8
      };
      // Check cooldown
      const lastAction = careCooldowns[action];
      if (lastAction) {
        const lastTime = new Date(lastAction);
        const hoursSince = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
        if (hoursSince < cooldownHours[action]) {
          const remainingMinutes = Math.ceil((cooldownHours[action] - hoursSince) * 60);
          return res.status(429).json({ 
            error: "Action on cooldown",
            remainingMinutes,
            availableAt: new Date(lastTime.getTime() + cooldownHours[action] * 60 * 60 * 1000)
          });
        }
      }

      // Apply action effects
      let updates: Partial<typeof character> = {
        lastCareAt: now,
      };

      const user = await storage.getUser(userId);
      let userUpdates: Record<string, any> = {};

      switch (action) {
        case 'feed':
          updates.hunger = Math.min(100, (character.hunger ?? 100) + 30);
          break;
        case 'drink':
          updates.thirst = Math.min(100, (character.thirst ?? 100) + 40);
          break;
        case 'rest':
          updates.fatigue = Math.max(0, (character.fatigue ?? 0) - 30);
          break;
        case 'heal':
          // Reset to healthy state
          updates.hunger = Math.min(100, (character.hunger ?? 100) + 20);
          updates.thirst = Math.min(100, (character.thirst ?? 100) + 20);
          updates.fatigue = Math.max(0, (character.fatigue ?? 0) - 20);
          userUpdates.characterEnergy = Math.min(100, (user?.characterEnergy ?? 100) + 30);
          userUpdates.characterHealthState = 'normal';
          break;
      }

      // Update cooldown
      careCooldowns[action] = now.toISOString();
      updates.careCooldowns = JSON.stringify(careCooldowns);

      // Update character in DB
      await storage.updateCharacter(userId, updates);
      
      // Update user if needed
      if (Object.keys(userUpdates).length > 0) {
        await storage.updateUser(userId, userUpdates);
      }

      res.json({ 
        success: true, 
        action,
        cooldownEndsAt: new Date(now.getTime() + cooldownHours[action] * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error("Character care error:", error);
      res.status(500).json({ error: "Failed to perform care action" });
    }
  });

  // Setup character (first time)
  app.post("/api/character/setup", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { gender, name } = req.body;

      if (!gender || !['male', 'female'].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender" });
      }

      if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
        return res.status(400).json({ error: "Invalid name" });
      }

      await storage.updateUser(userId, {
        characterGender: gender,
        characterName: name.trim(),
        characterEnergy: 100,
        characterHealthState: 'normal',
        characterMood: 'happy',
        lastActivityAt: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Setup character error:", error);
      res.status(500).json({ error: "Failed to setup character" });
    }
  });

  // Update character activity (called after game)
  app.post("/api/character/activity", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { energyGain, mood } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate current energy with decay
      const now = new Date();
      const lastActivity = user.lastActivityAt ? new Date(user.lastActivityAt) : now;
      const hoursSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
      const energyDecay = Math.floor(hoursSinceActivity / 6) * 5;
      let currentEnergy = Math.max(0, (user.characterEnergy ?? 100) - energyDecay);
      
      // Add energy from game (+15 default)
      const gainAmount = typeof energyGain === 'number' ? energyGain : 15;
      const newEnergy = Math.min(100, currentEnergy + gainAmount);
      
      // Update health state
      let healthState = 'normal';
      if (newEnergy < 40) {
        healthState = 'tired';
      }

      const updates: any = {
        characterEnergy: newEnergy,
        characterHealthState: healthState,
        lastActivityAt: now,
      };

      // Update mood if provided
      if (mood && ['happy', 'neutral', 'sad'].includes(mood)) {
        updates.characterMood = mood;
      }

      await storage.updateUser(userId, updates);

      res.json({
        energy: newEnergy,
        healthState,
        mood: updates.characterMood || user.characterMood,
      });
    } catch (error) {
      console.error("Update character activity error:", error);
      res.status(500).json({ error: "Failed to update character activity" });
    }
  });

  return httpServer;
}
