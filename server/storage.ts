import { 
  users, 
  gameScores, 
  gameConfig,
  prizePool,
  usdtFundSettings,
  realRewards,
  referralRewards,
  type User, 
  type InsertUser,
  type GameScore,
  type InsertGameScore,
  type GameConfig,
  type InsertGameConfig,
  type PrizePool,
  type InsertPrizePool,
  type LeaderboardEntry,
  type AdminCryptoBalances,
  type UserUpdate,
  type UsdtFundSettings,
  type InsertUsdtFundSettings,
  type RealReward,
  type InsertRealReward,
  type ReferralReward,
  type InsertReferralReward,
  type UsdtFundStats,
  type RewardResult,
  type GameEconomyConfig,
  type ReferralConfig,
  type ReferralInfo,
  type ReferralUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, isNull, and, gte, sum } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: string, score: number): Promise<User | undefined>;
  updateUser(userId: string, updates: UserUpdate): Promise<User | undefined>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined>;
  softDeleteUser(userId: string): Promise<User | undefined>;
  restoreUser(userId: string): Promise<User | undefined>;
  getAllUsers(limit?: number, offset?: number, includeDeleted?: boolean): Promise<User[]>;
  getActiveUsers(limit?: number, offset?: number): Promise<User[]>;
  getUserCount(includeDeleted?: boolean): Promise<number>;
  
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getUserScores(userId: string, limit?: number): Promise<GameScore[]>;
  getAllScores(limit?: number, offset?: number): Promise<GameScore[]>;
  getScoreCount(): Promise<number>;
  
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  
  getGameConfig(key: string): Promise<GameConfig | undefined>;
  getAllGameConfigs(): Promise<GameConfig[]>;
  setGameConfig(config: InsertGameConfig): Promise<GameConfig>;
  deleteGameConfig(key: string): Promise<void>;
  
  getAdminCryptoBalances(): Promise<AdminCryptoBalances>;
  setAdminCryptoBalances(balances: AdminCryptoBalances): Promise<AdminCryptoBalances>;
  
  getPrizePool(id: string): Promise<PrizePool | undefined>;
  getActivePrizePool(): Promise<PrizePool | undefined>;
  getAllPrizePools(): Promise<PrizePool[]>;
  createPrizePool(pool: InsertPrizePool): Promise<PrizePool>;
  updatePrizePool(id: string, pool: Partial<InsertPrizePool>): Promise<PrizePool | undefined>;
  deletePrizePool(id: string): Promise<void>;
  
  getUsdtFundSettings(): Promise<UsdtFundSettings>;
  updateUsdtFundSettings(updates: Partial<InsertUsdtFundSettings>): Promise<UsdtFundSettings>;
  getUsdtFundStats(): Promise<UsdtFundStats>;
  
  createRealReward(reward: InsertRealReward): Promise<RealReward>;
  getUserRewardsToday(userId: string): Promise<number>;
  getTotalDistributed(): Promise<number>;
  getDistributedToday(): Promise<number>;
  processUsdtReward(userId: string, usdtBallsCollected: number, gameScoreId: string): Promise<RewardResult>;
  isUsdtFundAvailable(): Promise<boolean>;
  
  getGameEconomyConfig(): Promise<GameEconomyConfig>;
  updateGameEconomyConfig(config: Partial<GameEconomyConfig>): Promise<GameEconomyConfig>;
  
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  generateReferralCode(): string;
  ensureUserHasReferralCode(userId: string): Promise<string>;
  processReferral(newUserId: string, referrerCode: string): Promise<boolean>;
  getReferralConfig(): Promise<ReferralConfig>;
  updateReferralConfig(config: Partial<ReferralConfig>): Promise<ReferralConfig>;
  getReferralInfo(userId: string, botUsername: string): Promise<ReferralInfo>;
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  processReferralRewards(gameScoreId: string, playerId: string, beadsEarned: number): Promise<void>;
  getUserReferralRewards(userId: string): Promise<ReferralReward[]>;
  getTotalReferralBeads(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStats(userId: string, score: number): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;

    const [user] = await db
      .update(users)
      .set({
        totalPoints: currentUser.totalPoints + score,
        gamesPlayed: currentUser.gamesPlayed + 1,
        bestScore: Math.max(currentUser.bestScore, score),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async softDeleteUser(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async restoreUser(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ deletedAt: null })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllUsers(limit: number = 50, offset: number = 0, includeDeleted: boolean = true): Promise<User[]> {
    if (includeDeleted) {
      return db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    }
    return db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getActiveUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserCount(includeDeleted: boolean = false): Promise<number> {
    if (includeDeleted) {
      const result = await db.select({ count: sql<number>`count(*)` }).from(users);
      return Number(result[0]?.count || 0);
    }
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(isNull(users.deletedAt));
    return Number(result[0]?.count || 0);
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const [score] = await db
      .insert(gameScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getUserScores(userId: string, limit: number = 10): Promise<GameScore[]> {
    return db
      .select()
      .from(gameScores)
      .where(eq(gameScores.odUserId, userId))
      .orderBy(desc(gameScores.createdAt))
      .limit(limit);
  }

  async getAllScores(limit: number = 50, offset: number = 0): Promise<GameScore[]> {
    return db
      .select()
      .from(gameScores)
      .orderBy(desc(gameScores.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getScoreCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(gameScores);
    return Number(result[0]?.count || 0);
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        id: users.id,
        username: users.username,
        photoUrl: users.photoUrl,
        totalPoints: users.totalPoints,
        gamesPlayed: users.gamesPlayed,
        bestScore: users.bestScore,
      })
      .from(users)
      .orderBy(desc(users.totalPoints))
      .limit(limit);

    return results.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      photoUrl: user.photoUrl,
      totalPoints: user.totalPoints,
      gamesPlayed: user.gamesPlayed,
      bestScore: user.bestScore,
    }));
  }

  async getGameConfig(key: string): Promise<GameConfig | undefined> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, key));
    return config || undefined;
  }

  async getAllGameConfigs(): Promise<GameConfig[]> {
    return db.select().from(gameConfig).orderBy(gameConfig.key);
  }

  async setGameConfig(insertConfig: InsertGameConfig): Promise<GameConfig> {
    const existing = await this.getGameConfig(insertConfig.key);
    
    if (existing) {
      const [config] = await db
        .update(gameConfig)
        .set({ 
          value: insertConfig.value,
          description: insertConfig.description,
          updatedAt: new Date(),
        })
        .where(eq(gameConfig.key, insertConfig.key))
        .returning();
      return config;
    }
    
    const [config] = await db
      .insert(gameConfig)
      .values(insertConfig)
      .returning();
    return config;
  }

  async deleteGameConfig(key: string): Promise<void> {
    await db.delete(gameConfig).where(eq(gameConfig.key, key));
  }

  async getAdminCryptoBalances(): Promise<AdminCryptoBalances> {
    const config = await this.getGameConfig('admin_crypto_balances');
    if (!config) {
      return { btc: 0, eth: 0, usdt: 0 };
    }
    const value = config.value as Record<string, number>;
    return {
      btc: value.btc || 0,
      eth: value.eth || 0,
      usdt: value.usdt || 0,
    };
  }

  async setAdminCryptoBalances(balances: AdminCryptoBalances): Promise<AdminCryptoBalances> {
    await this.setGameConfig({
      key: 'admin_crypto_balances',
      value: balances,
      description: 'Admin crypto fund balances for BTC, ETH, USDT',
    });
    return balances;
  }

  async getPrizePool(id: string): Promise<PrizePool | undefined> {
    const [pool] = await db
      .select()
      .from(prizePool)
      .where(eq(prizePool.id, id));
    return pool || undefined;
  }

  async getActivePrizePool(): Promise<PrizePool | undefined> {
    const [pool] = await db
      .select()
      .from(prizePool)
      .where(eq(prizePool.isActive, true));
    return pool || undefined;
  }

  async getAllPrizePools(): Promise<PrizePool[]> {
    return db.select().from(prizePool).orderBy(desc(prizePool.createdAt));
  }

  async createPrizePool(insertPool: InsertPrizePool): Promise<PrizePool> {
    const [pool] = await db
      .insert(prizePool)
      .values(insertPool)
      .returning();
    return pool;
  }

  async updatePrizePool(id: string, updates: Partial<InsertPrizePool>): Promise<PrizePool | undefined> {
    const [pool] = await db
      .update(prizePool)
      .set(updates)
      .where(eq(prizePool.id, id))
      .returning();
    return pool || undefined;
  }

  async deletePrizePool(id: string): Promise<void> {
    await db.delete(prizePool).where(eq(prizePool.id, id));
  }

  async getUsdtFundSettings(): Promise<UsdtFundSettings> {
    const [settings] = await db.select().from(usdtFundSettings).limit(1);
    
    if (!settings) {
      const [newSettings] = await db
        .insert(usdtFundSettings)
        .values({
          usdtTotalFund: 50,
          usdtAvailable: 50,
          usdtDailyLimit: 1.0,
          usdtPerDrop: 0.02,
          usdtMaxPerUserPerDay: 0.1,
          usdtDistributedToday: 0,
          lastResetDate: new Date(),
        })
        .returning();
      return newSettings;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(settings.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);
    
    if (lastReset.getTime() < today.getTime()) {
      const [updatedSettings] = await db
        .update(usdtFundSettings)
        .set({ 
          usdtDistributedToday: 0,
          lastResetDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usdtFundSettings.id, settings.id))
        .returning();
      return updatedSettings;
    }
    
    return settings;
  }

  async updateUsdtFundSettings(updates: Partial<InsertUsdtFundSettings>): Promise<UsdtFundSettings> {
    const current = await this.getUsdtFundSettings();
    
    const [settings] = await db
      .update(usdtFundSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(usdtFundSettings.id, current.id))
      .returning();
    
    return settings;
  }

  async getUsdtFundStats(): Promise<UsdtFundStats> {
    const settings = await this.getUsdtFundSettings();
    const totalDistributed = await this.getTotalDistributed();
    
    return {
      settings,
      totalDistributed,
      distributedToday: settings.usdtDistributedToday,
    };
  }

  async createRealReward(reward: InsertRealReward): Promise<RealReward> {
    const [newReward] = await db
      .insert(realRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  async getUserRewardsToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(realRewards)
      .where(
        and(
          eq(realRewards.userId, userId),
          gte(realRewards.createdAt, today)
        )
      );
    
    return Number(result[0]?.total || 0);
  }

  async getTotalDistributed(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(realRewards);
    
    return Number(result[0]?.total || 0);
  }

  async getDistributedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(realRewards)
      .where(gte(realRewards.createdAt, today));
    
    return Number(result[0]?.total || 0);
  }

  async isUsdtFundAvailable(): Promise<boolean> {
    const settings = await this.getUsdtFundSettings();
    return settings.usdtAvailable > 0 && settings.usdtDistributedToday < settings.usdtDailyLimit;
  }

  async processUsdtReward(userId: string, usdtBallsCollected: number, gameScoreId: string): Promise<RewardResult> {
    if (usdtBallsCollected <= 0) {
      return { usdtAwarded: 0 };
    }
    
    const settings = await this.getUsdtFundSettings();
    const userTodayTotal = await this.getUserRewardsToday(userId);
    
    const potentialReward = usdtBallsCollected * settings.usdtPerDrop;
    
    const remainingDailyLimit = settings.usdtDailyLimit - settings.usdtDistributedToday;
    const remainingUserLimit = settings.usdtMaxPerUserPerDay - userTodayTotal;
    const remainingFund = settings.usdtAvailable;
    
    const actualReward = Math.min(
      potentialReward,
      remainingDailyLimit,
      remainingUserLimit,
      remainingFund
    );
    
    if (actualReward <= 0) {
      return { usdtAwarded: 0 };
    }
    
    const roundedReward = Math.round(actualReward * 100) / 100;
    
    const reward = await this.createRealReward({
      userId,
      cryptoType: 'usdt',
      amount: roundedReward,
      gameScoreId,
    });
    
    await this.updateUsdtFundSettings({
      usdtAvailable: settings.usdtAvailable - roundedReward,
      usdtDistributedToday: settings.usdtDistributedToday + roundedReward,
    });
    
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(userId, {
        usdtBalance: (user.usdtBalance || 0) + roundedReward,
      });
    }
    
    return { usdtAwarded: roundedReward, rewardId: reward.id };
  }

  private getDefaultEconomyConfig(): GameEconomyConfig {
    return {
      points: {
        normal: 100,
        btc: 500,
        eth: 300,
        usdt: 200,
      },
      combo: {
        multiplier: 1.5,
        maxChain: 10,
      },
      crypto: {
        spawnChance: 0.08,
      },
    };
  }

  async getGameEconomyConfig(): Promise<GameEconomyConfig> {
    const config = await this.getGameConfig('game_economy');
    if (!config) {
      const defaultConfig = this.getDefaultEconomyConfig();
      await this.setGameConfig({
        key: 'game_economy',
        value: defaultConfig,
        description: 'Game economy configuration (points, combo, crypto spawn)',
      });
      return defaultConfig;
    }
    
    const stored = config.value as GameEconomyConfig;
    const defaults = this.getDefaultEconomyConfig();
    
    return {
      points: {
        normal: stored.points?.normal ?? defaults.points.normal,
        btc: stored.points?.btc ?? defaults.points.btc,
        eth: stored.points?.eth ?? defaults.points.eth,
        usdt: stored.points?.usdt ?? defaults.points.usdt,
      },
      combo: {
        multiplier: stored.combo?.multiplier ?? defaults.combo.multiplier,
        maxChain: stored.combo?.maxChain ?? defaults.combo.maxChain,
      },
      crypto: {
        spawnChance: stored.crypto?.spawnChance ?? defaults.crypto.spawnChance,
      },
    };
  }

  async updateGameEconomyConfig(updates: Partial<GameEconomyConfig>): Promise<GameEconomyConfig> {
    const current = await this.getGameEconomyConfig();
    
    const newConfig: GameEconomyConfig = {
      points: {
        normal: updates.points?.normal ?? current.points.normal,
        btc: updates.points?.btc ?? current.points.btc,
        eth: updates.points?.eth ?? current.points.eth,
        usdt: updates.points?.usdt ?? current.points.usdt,
      },
      combo: {
        multiplier: updates.combo?.multiplier ?? current.combo.multiplier,
        maxChain: updates.combo?.maxChain ?? current.combo.maxChain,
      },
      crypto: {
        spawnChance: updates.crypto?.spawnChance ?? current.crypto.spawnChance,
      },
    };
    
    await this.setGameConfig({
      key: 'game_economy',
      value: newConfig,
      description: 'Game economy configuration (points, combo, crypto spawn)',
    });
    
    return newConfig;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user || undefined;
  }

  generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async ensureUserHasReferralCode(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (user.referralCode) {
      return user.referralCode;
    }
    
    let code: string;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      code = this.generateReferralCode();
      const existing = await this.getUserByReferralCode(code);
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      code = `${this.generateReferralCode()}${userId.substring(0, 4).toUpperCase()}`;
    }
    
    try {
      await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
    } catch (error: any) {
      if (error?.code === '23505') {
        code = `${this.generateReferralCode()}${Date.now().toString(36).toUpperCase()}`;
        await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
      } else {
        throw error;
      }
    }
    
    return code;
  }

  async processReferral(newUserId: string, referrerCode: string): Promise<boolean> {
    const referrer = await this.getUserByReferralCode(referrerCode);
    if (!referrer) {
      console.log(`Referral code ${referrerCode} not found`);
      return false;
    }
    
    const newUser = await this.getUser(newUserId);
    if (!newUser) {
      console.log(`New user ${newUserId} not found`);
      return false;
    }
    
    if (newUser.referredBy) {
      console.log(`User ${newUserId} already has a referrer`);
      return false;
    }
    
    if (referrer.id === newUserId) {
      console.log(`User cannot refer themselves`);
      return false;
    }
    
    const config = await this.getReferralConfig();
    if (referrer.directReferralsCount >= config.maxDirectReferralsPerUser) {
      console.log(`Referrer ${referrer.id} has reached max referrals limit`);
      return false;
    }
    
    await db.update(users)
      .set({ referredBy: referrer.id })
      .where(eq(users.id, newUserId));
    
    await db.update(users)
      .set({ directReferralsCount: referrer.directReferralsCount + 1 })
      .where(eq(users.id, referrer.id));
    
    console.log(`User ${newUserId} successfully referred by ${referrer.id}`);
    return true;
  }

  private getDefaultReferralConfig(): ReferralConfig {
    return {
      maxDirectReferralsPerUser: 1000,
      level1RewardPercent: 10,
      level2RewardPercent: 3,
      maxReferralBeadsPerRefPerDay: 1000000,
      maxReferralBeadsPerUserPerDay: 10000000,
    };
  }

  async getReferralConfig(): Promise<ReferralConfig> {
    const config = await this.getGameConfig('referral_config');
    if (!config) {
      const defaultConfig = this.getDefaultReferralConfig();
      await this.setGameConfig({
        key: 'referral_config',
        value: defaultConfig,
        description: 'Referral system configuration (limits, reward percentages)',
      });
      return defaultConfig;
    }
    
    const stored = config.value as Partial<ReferralConfig>;
    const defaults = this.getDefaultReferralConfig();
    
    return {
      maxDirectReferralsPerUser: stored.maxDirectReferralsPerUser ?? defaults.maxDirectReferralsPerUser,
      level1RewardPercent: stored.level1RewardPercent ?? defaults.level1RewardPercent,
      level2RewardPercent: stored.level2RewardPercent ?? defaults.level2RewardPercent,
      maxReferralBeadsPerRefPerDay: stored.maxReferralBeadsPerRefPerDay ?? defaults.maxReferralBeadsPerRefPerDay,
      maxReferralBeadsPerUserPerDay: stored.maxReferralBeadsPerUserPerDay ?? defaults.maxReferralBeadsPerUserPerDay,
    };
  }

  async updateReferralConfig(updates: Partial<ReferralConfig>): Promise<ReferralConfig> {
    const current = await this.getReferralConfig();
    
    const newConfig: ReferralConfig = {
      maxDirectReferralsPerUser: updates.maxDirectReferralsPerUser ?? current.maxDirectReferralsPerUser,
      level1RewardPercent: updates.level1RewardPercent ?? current.level1RewardPercent,
      level2RewardPercent: updates.level2RewardPercent ?? current.level2RewardPercent,
      maxReferralBeadsPerRefPerDay: updates.maxReferralBeadsPerRefPerDay ?? current.maxReferralBeadsPerRefPerDay,
      maxReferralBeadsPerUserPerDay: updates.maxReferralBeadsPerUserPerDay ?? current.maxReferralBeadsPerUserPerDay,
    };
    
    await this.setGameConfig({
      key: 'referral_config',
      value: newConfig,
      description: 'Referral system configuration (limits, reward percentages)',
    });
    
    return newConfig;
  }

  async getReferralInfo(userId: string, botUsername: string): Promise<ReferralInfo> {
    const referralCode = await this.ensureUserHasReferralCode(userId);
    const user = await this.getUser(userId);
    const totalEarnedBeads = await this.getTotalReferralBeads(userId);
    
    return {
      referralCode,
      referralLink: `https://t.me/${botUsername}?start=${referralCode}`,
      directReferralsCount: user?.directReferralsCount ?? 0,
      totalEarnedBeads,
    };
  }

  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const [created] = await db.insert(referralRewards).values(reward).returning();
    return created;
  }

  async getReferralBeadsEarnedToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({ total: sum(referralRewards.beadsAmount) })
      .from(referralRewards)
      .where(and(
        eq(referralRewards.userId, userId),
        gte(referralRewards.createdAt, today)
      ));
    
    return Number(result[0]?.total) || 0;
  }

  async getReferralBeadsFromRefToday(userId: string, refUserId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({ total: sum(referralRewards.beadsAmount) })
      .from(referralRewards)
      .where(and(
        eq(referralRewards.userId, userId),
        eq(referralRewards.refUserId, refUserId),
        gte(referralRewards.createdAt, today)
      ));
    
    return Number(result[0]?.total) || 0;
  }

  async processReferralRewards(gameScoreId: string, playerId: string, beadsEarned: number): Promise<void> {
    if (beadsEarned <= 0) return;
    
    const player = await this.getUser(playerId);
    if (!player || !player.referredBy) return;
    
    const config = await this.getReferralConfig();
    
    const level1Referrer = await this.getUser(player.referredBy);
    if (level1Referrer) {
      let level1Reward = Math.floor(beadsEarned * config.level1RewardPercent / 100);
      
      if (level1Reward > 0) {
        const todayFromRef = await this.getReferralBeadsFromRefToday(level1Referrer.id, playerId);
        const remainingFromRef = Math.max(0, config.maxReferralBeadsPerRefPerDay - todayFromRef);
        
        const todayTotal = await this.getReferralBeadsEarnedToday(level1Referrer.id);
        const remainingTotal = Math.max(0, config.maxReferralBeadsPerUserPerDay - todayTotal);
        
        level1Reward = Math.min(level1Reward, remainingFromRef, remainingTotal);
        
        if (level1Reward > 0) {
          await this.createReferralReward({
            userId: level1Referrer.id,
            refUserId: playerId,
            level: 1,
            beadsAmount: level1Reward,
            gameScoreId,
          });
          
          await db.update(users)
            .set({ totalPoints: level1Referrer.totalPoints + level1Reward })
            .where(eq(users.id, level1Referrer.id));
          
          console.log(`Level 1 referral reward: ${level1Reward} beads to ${level1Referrer.username}`);
        }
      }
      
      if (level1Referrer.referredBy) {
        const level2Referrer = await this.getUser(level1Referrer.referredBy);
        if (level2Referrer) {
          let level2Reward = Math.floor(beadsEarned * config.level2RewardPercent / 100);
          
          if (level2Reward > 0) {
            const todayFromRef = await this.getReferralBeadsFromRefToday(level2Referrer.id, playerId);
            const remainingFromRef = Math.max(0, config.maxReferralBeadsPerRefPerDay - todayFromRef);
            
            const todayTotal = await this.getReferralBeadsEarnedToday(level2Referrer.id);
            const remainingTotal = Math.max(0, config.maxReferralBeadsPerUserPerDay - todayTotal);
            
            level2Reward = Math.min(level2Reward, remainingFromRef, remainingTotal);
            
            if (level2Reward > 0) {
              await this.createReferralReward({
                userId: level2Referrer.id,
                refUserId: playerId,
                level: 2,
                beadsAmount: level2Reward,
                gameScoreId,
              });
              
              await db.update(users)
                .set({ totalPoints: level2Referrer.totalPoints + level2Reward })
                .where(eq(users.id, level2Referrer.id));
              
              console.log(`Level 2 referral reward: ${level2Reward} beads to ${level2Referrer.username}`);
            }
          }
        }
      }
    }
  }

  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    return await db.select()
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId))
      .orderBy(desc(referralRewards.createdAt));
  }

  async getTotalReferralBeads(userId: string): Promise<number> {
    const result = await db.select({ total: sum(referralRewards.beadsAmount) })
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));
    
    return Number(result[0]?.total) || 0;
  }

  async getLevel2ReferralsCount(userId: string): Promise<number> {
    const directReferrals = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.referredBy, userId));
    
    if (directReferrals.length === 0) return 0;
    
    let level2Count = 0;
    for (const ref of directReferrals) {
      const count = await db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.referredBy, ref.id));
      level2Count += count[0]?.count || 0;
    }
    
    return level2Count;
  }

  async getReferralUserStats(): Promise<ReferralUserStats[]> {
    const allUsers = await db.select()
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.totalPoints));
    
    const stats: ReferralUserStats[] = [];
    
    for (const user of allUsers) {
      let referredByUsername: string | null = null;
      if (user.referredBy) {
        const referrer = await this.getUser(user.referredBy);
        referredByUsername = referrer?.username || null;
      }
      
      const totalReferralBeads = await this.getTotalReferralBeads(user.id);
      const level2Count = await this.getLevel2ReferralsCount(user.id);
      
      stats.push({
        userId: user.id,
        username: user.username,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referredByUsername,
        level1ReferralsCount: user.directReferralsCount,
        level2ReferralsCount: level2Count,
        totalReferralBeads,
      });
    }
    
    return stats;
  }
}

export const storage = new DatabaseStorage();
