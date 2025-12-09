import { 
  users, 
  gameScores, 
  gameConfig,
  prizePool,
  usdtFundSettings,
  realRewards,
  referralRewards,
  beadsTransactions,
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
  type BeadsTransaction,
  type InsertBeadsTransaction,
  type HouseAccountConfig,
  type LivesConfig,
  type TransactionType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, isNull, and, or, gte, sum, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: string, score: number): Promise<User | undefined>;
  updateUser(userId: string, updates: UserUpdate): Promise<User | undefined>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined>;
  softDeleteUser(userId: string): Promise<User | undefined>;
  hardDeleteUser(userId: string): Promise<boolean>;
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
  processCryptoRewards(userId: string, cryptoBtc: number, cryptoEth: number, cryptoUsdt: number): Promise<{ btcAwarded: number; ethAwarded: number; usdtAwarded: number; btcSatsAwarded: number; ethWeiAwarded: number }>;
  
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
  
  getFundToggles(): Promise<{ cryptoFundEnabled: boolean; usdtFundEnabled: boolean }>;
  
  getHouseAccount(): Promise<HouseAccountConfig>;
  updateHouseAccount(updates: Partial<HouseAccountConfig>): Promise<HouseAccountConfig>;
  getLivesConfig(): Promise<LivesConfig>;
  updateLivesConfig(config: Partial<LivesConfig>): Promise<LivesConfig>;
  createBeadsTransaction(tx: InsertBeadsTransaction): Promise<BeadsTransaction>;
  getBeadsTransactions(limit?: number, offset?: number): Promise<BeadsTransaction[]>;
  getBeadsTransactionsCount(): Promise<number>;
  getBeadsTransactionsWithUsers(options: {
    limit?: number;
    offset?: number;
    type?: string;
    search?: string;
  }): Promise<{ transactions: Array<BeadsTransaction & { username?: string }>; total: number }>;
  awardBeadsWithHouse(userId: string, amount: number, type: TransactionType, description: string, gameScoreId?: string): Promise<{ success: boolean; newBalance: number }>;
  chargeBeadsToHouse(userId: string, amount: number, type: TransactionType, description: string): Promise<{ success: boolean; newBalance: number }>;
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

  async hardDeleteUser(userId: string): Promise<boolean> {
    // First delete related records to avoid foreign key constraint errors
    await db.delete(gameScores).where(eq(gameScores.odUserId, userId));
    await db.delete(referralRewards).where(eq(referralRewards.userId, userId));
    await db.delete(referralRewards).where(eq(referralRewards.refUserId, userId));
    await db.delete(realRewards).where(eq(realRewards.userId, userId));
    
    // Now delete the user
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    return result.length > 0;
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
        normal: 5,
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
      cryptoRewards: {
        btcPerBall: 0.00000005,
        ethPerBall: 0.0000001,
        usdtPerBall: 0.01,
      },
      dailyLimits: {
        btcMaxSatsPerDay: 300,
        ethMaxWeiPerDay: 3000000000000000,
        usdtMaxPerDay: 3.0,
      },
      pools: {
        btcBalanceSats: 100000,
        ethBalanceWei: 1000000000000000,
        usdtBalance: 100,
      },
      perGameLimits: {
        btcMaxBeadsPerGame: 15,
        ethMaxBeadsPerGame: 15,
        usdtMaxBeadsPerGame: 15,
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
      cryptoRewards: {
        btcPerBall: stored.cryptoRewards?.btcPerBall ?? defaults.cryptoRewards.btcPerBall,
        ethPerBall: stored.cryptoRewards?.ethPerBall ?? defaults.cryptoRewards.ethPerBall,
        usdtPerBall: stored.cryptoRewards?.usdtPerBall ?? defaults.cryptoRewards.usdtPerBall,
      },
      dailyLimits: {
        btcMaxSatsPerDay: stored.dailyLimits?.btcMaxSatsPerDay ?? defaults.dailyLimits.btcMaxSatsPerDay,
        ethMaxWeiPerDay: stored.dailyLimits?.ethMaxWeiPerDay ?? defaults.dailyLimits.ethMaxWeiPerDay,
        usdtMaxPerDay: stored.dailyLimits?.usdtMaxPerDay ?? defaults.dailyLimits.usdtMaxPerDay,
      },
      pools: {
        btcBalanceSats: stored.pools?.btcBalanceSats ?? defaults.pools.btcBalanceSats,
        ethBalanceWei: stored.pools?.ethBalanceWei ?? defaults.pools.ethBalanceWei,
        usdtBalance: stored.pools?.usdtBalance ?? defaults.pools.usdtBalance,
      },
      perGameLimits: {
        btcMaxBeadsPerGame: stored.perGameLimits?.btcMaxBeadsPerGame ?? defaults.perGameLimits.btcMaxBeadsPerGame,
        ethMaxBeadsPerGame: stored.perGameLimits?.ethMaxBeadsPerGame ?? defaults.perGameLimits.ethMaxBeadsPerGame,
        usdtMaxBeadsPerGame: stored.perGameLimits?.usdtMaxBeadsPerGame ?? defaults.perGameLimits.usdtMaxBeadsPerGame,
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
      cryptoRewards: {
        btcPerBall: updates.cryptoRewards?.btcPerBall ?? current.cryptoRewards.btcPerBall,
        ethPerBall: updates.cryptoRewards?.ethPerBall ?? current.cryptoRewards.ethPerBall,
        usdtPerBall: updates.cryptoRewards?.usdtPerBall ?? current.cryptoRewards.usdtPerBall,
      },
      dailyLimits: {
        btcMaxSatsPerDay: updates.dailyLimits?.btcMaxSatsPerDay ?? current.dailyLimits.btcMaxSatsPerDay,
        ethMaxWeiPerDay: updates.dailyLimits?.ethMaxWeiPerDay ?? current.dailyLimits.ethMaxWeiPerDay,
        usdtMaxPerDay: updates.dailyLimits?.usdtMaxPerDay ?? current.dailyLimits.usdtMaxPerDay,
      },
      pools: {
        btcBalanceSats: updates.pools?.btcBalanceSats ?? current.pools.btcBalanceSats,
        ethBalanceWei: updates.pools?.ethBalanceWei ?? current.pools.ethBalanceWei,
        usdtBalance: updates.pools?.usdtBalance ?? current.pools.usdtBalance,
      },
      perGameLimits: {
        btcMaxBeadsPerGame: updates.perGameLimits?.btcMaxBeadsPerGame ?? current.perGameLimits.btcMaxBeadsPerGame,
        ethMaxBeadsPerGame: updates.perGameLimits?.ethMaxBeadsPerGame ?? current.perGameLimits.ethMaxBeadsPerGame,
        usdtMaxBeadsPerGame: updates.perGameLimits?.usdtMaxBeadsPerGame ?? current.perGameLimits.usdtMaxBeadsPerGame,
      },
    };
    
    await this.setGameConfig({
      key: 'game_economy',
      value: newConfig,
      description: 'Game economy configuration (points, combo, crypto spawn)',
    });
    
    return newConfig;
  }

  async processCryptoRewards(
    userId: string, 
    cryptoBtc: number, 
    cryptoEth: number, 
    cryptoUsdt: number
  ): Promise<{ btcAwarded: number; ethAwarded: number; usdtAwarded: number; btcSatsAwarded: number; ethWeiAwarded: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      console.log(`processCryptoRewards: User ${userId} not found`);
      return { btcAwarded: 0, ethAwarded: 0, usdtAwarded: 0, btcSatsAwarded: 0, ethWeiAwarded: 0 };
    }

    const MAX_CRYPTO_BALLS_PER_GAME = 50;
    
    const sanitizeCounts = (val: any): number => {
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      if (isNaN(num) || !isFinite(num) || num < 0) return 0;
      return Math.min(Math.floor(num), MAX_CRYPTO_BALLS_PER_GAME);
    };

    const safeBtc = sanitizeCounts(cryptoBtc);
    const safeEth = sanitizeCounts(cryptoEth);
    const safeUsdt = sanitizeCounts(cryptoUsdt);

    if (safeBtc === 0 && safeEth === 0 && safeUsdt === 0) {
      return { btcAwarded: 0, ethAwarded: 0, usdtAwarded: 0, btcSatsAwarded: 0, ethWeiAwarded: 0 };
    }

    const economyConfig = await this.getGameEconomyConfig();
    const { cryptoRewards, dailyLimits, pools } = economyConfig;

    const sanitizeRewardRate = (val: any, defaultVal: number): number => {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      if (isNaN(num) || !isFinite(num) || num < 0) return defaultVal;
      return num;
    };

    const btcRate = sanitizeRewardRate(cryptoRewards.btcPerBall, 0.00000005);
    const ethRate = sanitizeRewardRate(cryptoRewards.ethPerBall, 0.0000001);
    const usdtRate = sanitizeRewardRate(cryptoRewards.usdtPerBall, 0.01);

    const SATS_PER_BTC = 100_000_000;
    const WEI_PER_ETH = 1_000_000_000;

    const btcSatsPerBall = Math.round(btcRate * SATS_PER_BTC);
    const ethWeiPerBall = Math.round(ethRate * WEI_PER_ETH);

    const today = new Date().toISOString().split('T')[0];

    const btcMaxSats = dailyLimits?.btcMaxSatsPerDay ?? 1000;
    const ethMaxWei = dailyLimits?.ethMaxWeiPerDay ?? 10000000;
    const usdtMax = dailyLimits?.usdtMaxPerDay ?? 1.0;

    const btcSatsRequested = safeBtc * btcSatsPerBall;
    const ethWeiRequested = safeEth * ethWeiPerBall;
    const usdtRequested = safeUsdt * usdtRate;

    const btcPoolAvailable = pools?.btcBalanceSats ?? 0;
    const ethPoolAvailable = pools?.ethBalanceWei ?? 0;
    const usdtPoolAvailable = pools?.usdtBalance ?? 0;

    const result = await db.execute(sql`
      WITH locked_user AS (
        SELECT 
          id,
          CASE WHEN btc_today_date = ${today} THEN btc_today_sats ELSE 0 END as current_btc_today,
          CASE WHEN eth_today_date = ${today} THEN eth_today_wei ELSE 0 END as current_eth_today,
          CASE WHEN usdt_today_date = ${today} THEN usdt_today::numeric ELSE 0 END as current_usdt_today
        FROM users 
        WHERE id = ${userId}
        FOR UPDATE
      ),
      amounts AS (
        SELECT 
          -- Check both daily limit AND pool balance, take minimum
          LEAST(
            ${btcSatsRequested}::bigint,
            GREATEST(0::bigint, ${btcMaxSats}::bigint - current_btc_today),
            ${btcPoolAvailable}::bigint
          ) as btc_to_add,
          LEAST(
            ${ethWeiRequested}::bigint,
            GREATEST(0::bigint, ${ethMaxWei}::bigint - current_eth_today),
            ${ethPoolAvailable}::bigint
          ) as eth_to_add,
          LEAST(
            ${usdtRequested}::numeric,
            GREATEST(0::numeric, ${usdtMax}::numeric - current_usdt_today),
            ${usdtPoolAvailable}::numeric
          ) as usdt_to_add,
          current_btc_today,
          current_eth_today,
          current_usdt_today
        FROM locked_user
      )
      UPDATE users u SET
        btc_balance = u.btc_balance + (SELECT btc_to_add FROM amounts)::numeric / ${SATS_PER_BTC}::numeric,
        eth_balance = u.eth_balance + (SELECT eth_to_add FROM amounts)::numeric / ${WEI_PER_ETH}::numeric,
        usdt_balance = u.usdt_balance + (SELECT usdt_to_add FROM amounts),
        btc_balance_sats = u.btc_balance_sats + (SELECT btc_to_add FROM amounts),
        eth_balance_wei = u.eth_balance_wei + (SELECT eth_to_add FROM amounts),
        btc_today_sats = (SELECT current_btc_today + btc_to_add FROM amounts),
        eth_today_wei = (SELECT current_eth_today + eth_to_add FROM amounts),
        usdt_today = (SELECT (current_usdt_today + usdt_to_add)::numeric FROM amounts),
        btc_today_date = ${today},
        eth_today_date = ${today},
        usdt_today_date = ${today}
      FROM locked_user lu
      WHERE u.id = lu.id
      RETURNING 
        (SELECT btc_to_add FROM amounts) as btc_sats_awarded,
        (SELECT eth_to_add FROM amounts) as eth_wei_awarded,
        (SELECT usdt_to_add FROM amounts) as usdt_awarded
    `);

    const row = (result.rows?.[0] as any) || {};
    const btcSatsAwarded = Number(row.btc_sats_awarded) || 0;
    const ethWeiAwarded = Number(row.eth_wei_awarded) || 0;
    const usdtAwarded = Number(row.usdt_awarded) || 0;

    const btcAwarded = btcSatsAwarded / SATS_PER_BTC;
    const ethAwarded = ethWeiAwarded / WEI_PER_ETH;

    console.log(`Crypto rewards for user ${userId}: BTC +${btcSatsAwarded} sats (${btcAwarded}), ETH +${ethWeiAwarded} wei (${ethAwarded}), USDT +${usdtAwarded}`);

    if (btcSatsAwarded > 0 || ethWeiAwarded > 0 || usdtAwarded > 0) {
      await this.updateGameEconomyConfig({
        pools: {
          btcBalanceSats: Math.max(0, btcPoolAvailable - btcSatsAwarded),
          ethBalanceWei: Math.max(0, ethPoolAvailable - ethWeiAwarded),
          usdtBalance: Math.max(0, usdtPoolAvailable - usdtAwarded),
        },
      });
      console.log(`Pools updated: BTC ${btcPoolAvailable} -> ${btcPoolAvailable - btcSatsAwarded} sats, ETH ${ethPoolAvailable} -> ${ethPoolAvailable - ethWeiAwarded} wei, USDT ${usdtPoolAvailable} -> ${usdtPoolAvailable - usdtAwarded}`);
    }

    return { btcAwarded, ethAwarded, usdtAwarded, btcSatsAwarded, ethWeiAwarded };
  }

  async getCryptoAvailability(userId: string): Promise<import('@shared/schema').CryptoAvailability> {
    const user = await this.getUser(userId);
    const config = await this.getGameEconomyConfig();
    const { dailyLimits, pools, perGameLimits, cryptoRewards } = config;

    const today = new Date().toISOString().split('T')[0];

    const SATS_PER_BTC = 100_000_000;
    const WEI_PER_ETH = 1_000_000_000;

    const btcSatsPerBall = Math.round(cryptoRewards.btcPerBall * SATS_PER_BTC);
    const ethWeiPerBall = Math.round(cryptoRewards.ethPerBall * WEI_PER_ETH);

    const minBtcReward = 3 * btcSatsPerBall;
    const minEthReward = 3 * ethWeiPerBall;
    const minUsdtReward = 3 * cryptoRewards.usdtPerBall;

    let btcTodaySats = 0;
    let ethTodayWei = 0;
    let usdtToday = 0;

    if (user) {
      btcTodaySats = user.btcTodayDate === today ? Number(user.btcTodaySats) || 0 : 0;
      ethTodayWei = user.ethTodayDate === today ? Number(user.ethTodayWei) || 0 : 0;
      usdtToday = user.usdtTodayDate === today ? parseFloat(String(user.usdtToday)) || 0 : 0;
    }

    const btcRemaining = Math.max(0, dailyLimits.btcMaxSatsPerDay - btcTodaySats);
    const ethRemaining = Math.max(0, dailyLimits.ethMaxWeiPerDay - ethTodayWei);
    const usdtRemaining = Math.max(0, dailyLimits.usdtMaxPerDay - usdtToday);

    const btcHasFund = pools.btcBalanceSats >= minBtcReward;
    const ethHasFund = pools.ethBalanceWei >= minEthReward;
    const usdtHasFund = pools.usdtBalance >= minUsdtReward;

    const btcHasLimit = btcRemaining >= btcSatsPerBall;
    const ethHasLimit = ethRemaining >= ethWeiPerBall;
    const usdtHasLimit = usdtRemaining >= cryptoRewards.usdtPerBall;

    return {
      btcEnabled: btcHasFund && btcHasLimit,
      ethEnabled: ethHasFund && ethHasLimit,
      usdtEnabled: usdtHasFund && usdtHasLimit,
      btcRemainingToday: btcRemaining,
      ethRemainingToday: ethRemaining,
      usdtRemainingToday: usdtRemaining,
      btcMaxBeadsPerGame: perGameLimits.btcMaxBeadsPerGame,
      ethMaxBeadsPerGame: perGameLimits.ethMaxBeadsPerGame,
      usdtMaxBeadsPerGame: perGameLimits.usdtMaxBeadsPerGame,
    };
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
    
    // Store the referral CODE (not user ID) in referredBy field
    await db.update(users)
      .set({ referredBy: referrerCode })
      .where(eq(users.id, newUserId));
    
    await db.update(users)
      .set({ directReferralsCount: referrer.directReferralsCount + 1 })
      .where(eq(users.id, referrer.id));
    
    console.log(`User ${newUserId} successfully referred by code ${referrerCode} (user: ${referrer.username})`);
    return true;
  }

  private getDefaultReferralConfig(): ReferralConfig {
    return {
      maxDirectReferralsPerUser: 1000,
      level1RewardPercent: 10,
      level2RewardPercent: 3,
      maxReferralBeadsPerRefPerDay: 1000000,
      maxReferralBeadsPerUserPerDay: 10000000,
      title: 'Реферальная программа',
      description: 'Зови друзей — получай 10% их Beads!',
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
      title: stored.title ?? defaults.title,
      description: stored.description ?? defaults.description,
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
      title: updates.title ?? current.title,
      description: updates.description ?? current.description,
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
    
    // referredBy contains the referral CODE, not user ID
    const level1Referrer = await this.getUserByReferralCode(player.referredBy);
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
      
      // Check for level 2 referrer (level1Referrer's sponsor)
      if (level1Referrer.referredBy) {
        const level2Referrer = await this.getUserByReferralCode(level1Referrer.referredBy);
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
    // First get user's referral code
    const user = await this.getUser(userId);
    if (!user?.referralCode) return 0;
    
    // Find direct referrals by referral code
    const directReferrals = await db.select({ id: users.id, referralCode: users.referralCode })
      .from(users)
      .where(eq(users.referredBy, user.referralCode));
    
    if (directReferrals.length === 0) return 0;
    
    // Count level 2 referrals (referrals of direct referrals)
    let level2Count = 0;
    for (const ref of directReferrals) {
      if (ref.referralCode) {
        const count = await db.select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.referredBy, ref.referralCode));
        level2Count += count[0]?.count || 0;
      }
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
        // referredBy contains the referral CODE, so find user by that code
        const referrer = await this.getUserByReferralCode(user.referredBy);
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

  async getFundToggles(): Promise<{ cryptoFundEnabled: boolean; usdtFundEnabled: boolean }> {
    const cryptoConfig = await this.getGameConfig("crypto_fund_enabled");
    const usdtConfig = await this.getGameConfig("usdt_fund_enabled");
    
    return {
      cryptoFundEnabled: cryptoConfig?.value === true,
      usdtFundEnabled: usdtConfig?.value === true,
    };
  }

  private getDefaultHouseAccount(): HouseAccountConfig {
    return {
      balance: 1000000,
      salesIncome: 0,
      totalDistributed: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getHouseAccount(): Promise<HouseAccountConfig> {
    const config = await this.getGameConfig('house_account');
    if (!config) {
      const defaultConfig = this.getDefaultHouseAccount();
      await this.setGameConfig({
        key: 'house_account',
        value: defaultConfig,
        description: 'House account balance for Beads distribution',
      });
      return defaultConfig;
    }
    
    const stored = config.value as Partial<HouseAccountConfig>;
    const defaults = this.getDefaultHouseAccount();
    
    return {
      balance: stored.balance ?? defaults.balance,
      salesIncome: stored.salesIncome ?? defaults.salesIncome,
      totalDistributed: stored.totalDistributed ?? defaults.totalDistributed,
      lastUpdated: stored.lastUpdated ?? defaults.lastUpdated,
    };
  }

  async updateHouseAccount(updates: Partial<HouseAccountConfig>): Promise<HouseAccountConfig> {
    const current = await this.getHouseAccount();
    
    const newConfig: HouseAccountConfig = {
      balance: updates.balance ?? current.balance,
      salesIncome: updates.salesIncome ?? current.salesIncome,
      totalDistributed: updates.totalDistributed ?? current.totalDistributed,
      lastUpdated: new Date().toISOString(),
    };
    
    await this.setGameConfig({
      key: 'house_account',
      value: newConfig,
      description: 'House account balance for Beads distribution',
    });
    
    return newConfig;
  }

  private getDefaultLivesConfig(): LivesConfig {
    return {
      livesPerGame: 3,
      extraLifeCost: 50,
      extraLifeSeconds: 30,
      maxExtraLives: 5,
    };
  }

  async getLivesConfig(): Promise<LivesConfig> {
    const config = await this.getGameConfig('lives_config');
    if (!config) {
      const defaultConfig = this.getDefaultLivesConfig();
      await this.setGameConfig({
        key: 'lives_config',
        value: defaultConfig,
        description: 'Lives system configuration',
      });
      return defaultConfig;
    }
    
    const stored = config.value as Partial<LivesConfig>;
    const defaults = this.getDefaultLivesConfig();
    
    return {
      livesPerGame: stored.livesPerGame ?? defaults.livesPerGame,
      extraLifeCost: stored.extraLifeCost ?? defaults.extraLifeCost,
      extraLifeSeconds: stored.extraLifeSeconds ?? defaults.extraLifeSeconds,
      maxExtraLives: stored.maxExtraLives ?? defaults.maxExtraLives,
    };
  }

  async updateLivesConfig(updates: Partial<LivesConfig>): Promise<LivesConfig> {
    const current = await this.getLivesConfig();
    
    const newConfig: LivesConfig = {
      livesPerGame: updates.livesPerGame ?? current.livesPerGame,
      extraLifeCost: updates.extraLifeCost ?? current.extraLifeCost,
      extraLifeSeconds: updates.extraLifeSeconds ?? current.extraLifeSeconds,
      maxExtraLives: updates.maxExtraLives ?? current.maxExtraLives,
    };
    
    await this.setGameConfig({
      key: 'lives_config',
      value: newConfig,
      description: 'Lives system configuration',
    });
    
    return newConfig;
  }

  async createBeadsTransaction(tx: InsertBeadsTransaction): Promise<BeadsTransaction> {
    const [created] = await db.insert(beadsTransactions).values(tx).returning();
    return created;
  }

  async getBeadsTransactions(limit: number = 100, offset: number = 0): Promise<BeadsTransaction[]> {
    return await db.select()
      .from(beadsTransactions)
      .orderBy(desc(beadsTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBeadsTransactionsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(beadsTransactions);
    return result[0]?.count || 0;
  }

  async getBeadsTransactionsWithUsers(options: {
    limit?: number;
    offset?: number;
    type?: string;
    search?: string;
  }): Promise<{ transactions: Array<BeadsTransaction & { username?: string }>; total: number }> {
    const { limit = 20, offset = 0, type, search } = options;
    
    const conditions: any[] = [];
    
    if (type && type !== 'all') {
      conditions.push(eq(beadsTransactions.type, type));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(beadsTransactions.description, `%${search}%`),
          sql`${beadsTransactions.userId}::text ILIKE ${'%' + search + '%'}`
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [transactionsResult, countResult] = await Promise.all([
      db.select({
        id: beadsTransactions.id,
        userId: beadsTransactions.userId,
        type: beadsTransactions.type,
        amount: beadsTransactions.amount,
        balanceBefore: beadsTransactions.balanceBefore,
        balanceAfter: beadsTransactions.balanceAfter,
        houseBalanceBefore: beadsTransactions.houseBalanceBefore,
        houseBalanceAfter: beadsTransactions.houseBalanceAfter,
        description: beadsTransactions.description,
        gameScoreId: beadsTransactions.gameScoreId,
        createdAt: beadsTransactions.createdAt,
        username: users.username,
      })
        .from(beadsTransactions)
        .leftJoin(users, eq(beadsTransactions.userId, users.id))
        .where(whereClause)
        .orderBy(desc(beadsTransactions.createdAt))
        .limit(limit)
        .offset(offset),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(beadsTransactions)
        .where(whereClause),
    ]);
    
    return {
      transactions: transactionsResult.map(tx => ({
        ...tx,
        username: tx.username ?? undefined,
      })),
      total: countResult[0]?.count || 0,
    };
  }

  async awardBeadsWithHouse(
    userId: string, 
    amount: number, 
    type: TransactionType, 
    description: string, 
    gameScoreId?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, newBalance: 0 };
    
    const house = await this.getHouseAccount();
    
    if (house.balance < amount) {
      console.log(`House account insufficient: ${house.balance} < ${amount}`);
      return { success: false, newBalance: user.totalPoints };
    }
    
    const userBalanceBefore = user.totalPoints;
    const userBalanceAfter = userBalanceBefore + amount;
    const houseBalanceBefore = house.balance;
    const houseBalanceAfter = houseBalanceBefore - amount;
    
    await db.update(users)
      .set({ totalPoints: userBalanceAfter })
      .where(eq(users.id, userId));
    
    await this.updateHouseAccount({
      balance: houseBalanceAfter,
      totalDistributed: house.totalDistributed + amount,
    });
    
    await this.createBeadsTransaction({
      userId,
      type,
      amount,
      balanceBefore: userBalanceBefore,
      balanceAfter: userBalanceAfter,
      houseBalanceBefore,
      houseBalanceAfter,
      description,
      gameScoreId,
    });
    
    return { success: true, newBalance: userBalanceAfter };
  }

  async chargeBeadsToHouse(
    userId: string, 
    amount: number, 
    type: TransactionType, 
    description: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, newBalance: 0 };
    
    if (user.totalPoints < amount) {
      return { success: false, newBalance: user.totalPoints };
    }
    
    const house = await this.getHouseAccount();
    
    const userBalanceBefore = user.totalPoints;
    const userBalanceAfter = userBalanceBefore - amount;
    const houseBalanceBefore = house.balance;
    const houseBalanceAfter = houseBalanceBefore + amount;
    
    await db.update(users)
      .set({ totalPoints: userBalanceAfter })
      .where(eq(users.id, userId));
    
    await this.updateHouseAccount({
      balance: houseBalanceAfter,
      salesIncome: house.salesIncome + amount,
    });
    
    await this.createBeadsTransaction({
      userId,
      type,
      amount: -amount,
      balanceBefore: userBalanceBefore,
      balanceAfter: userBalanceAfter,
      houseBalanceBefore,
      houseBalanceAfter,
      description,
    });
    
    return { success: true, newBalance: userBalanceAfter };
  }
}

export const storage = new DatabaseStorage();
