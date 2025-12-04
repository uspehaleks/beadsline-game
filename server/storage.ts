import { 
  users, 
  gameScores, 
  gameConfig,
  prizePool,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, isNull, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
