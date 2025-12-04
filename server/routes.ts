import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";

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

// App URL for Mini App
function getAppUrl(): string {
  return process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPLIT_DEPLOYMENT_URL || 'https://beadsline--uspehaleks.replit.app';
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
  const command = text.split(' ')[0].toLowerCase();
  const appUrl = getAppUrl();
  
  switch (command) {
    case '/start':
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
        appUrl
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
  
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, photoUrl } = req.body;
      
      if (!telegramId || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
      }
      
      req.session.userId = user.id;
      
      res.json(user);
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
      
      const score = await storage.createGameScore(validatedData);
      
      await storage.updateUserStats(userId, validatedData.score);
      
      let rewardResult: { usdtAwarded: number; rewardId?: string } = { usdtAwarded: 0 };
      const usdtCollected = validatedData.cryptoUsdt ?? 0;
      if (usdtCollected > 0) {
        rewardResult = await storage.processUsdtReward(
          userId, 
          usdtCollected, 
          score.id
        );
      }
      
      res.json({ 
        ...score, 
        usdtAwarded: rewardResult.usdtAwarded,
        rewardId: rewardResult.rewardId,
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
      const { username, totalPoints, gamesPlayed, bestScore, isAdmin } = req.body;
      
      const updates: Record<string, unknown> = {};
      if (username !== undefined) updates.username = username;
      if (totalPoints !== undefined) updates.totalPoints = Number(totalPoints);
      if (gamesPlayed !== undefined) updates.gamesPlayed = Number(gamesPlayed);
      if (bestScore !== undefined) updates.bestScore = Number(bestScore);
      if (isAdmin !== undefined) updates.isAdmin = Boolean(isAdmin);
      
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
      const user = await storage.softDeleteUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, user });
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
      const balances = await storage.getAdminCryptoBalances();
      const usdtFundStats = await storage.getUsdtFundStats();
      
      const usdtFundAvailable = usdtFundStats.settings && 
        usdtFundStats.settings.usdtAvailable > 0 &&
        usdtFundStats.distributedToday < usdtFundStats.settings.usdtDailyLimit;
      
      res.json(formatNumbersInObject({
        ...config,
        cryptoAvailable: {
          btc: balances.btc > 0,
          eth: balances.eth > 0,
          usdt: balances.usdt > 0 && usdtFundAvailable,
        },
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
      const { points, combo, crypto } = req.body;
      
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
      
      const config = await storage.updateGameEconomyConfig(updates);
      res.json(formatNumbersInObject(config));
    } catch (error) {
      console.error("Update admin game economy error:", error);
      res.status(500).json({ error: "Failed to update game economy" });
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

  // Telegram Bot Webhook
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update: TelegramUpdate = req.body;
      
      if (update.message) {
        await handleTelegramCommand(update.message);
      }
      
      res.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      res.json({ ok: true });
    }
  });

  // Setup Telegram webhook (admin only)
  app.post("/api/telegram/setup-webhook", requireAdmin, async (req, res) => {
    try {
      const appUrl = getAppUrl();
      const webhookUrl = `${appUrl}/api/telegram/webhook`;
      
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

  return httpServer;
}
