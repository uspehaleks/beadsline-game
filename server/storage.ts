import { 
  users, 
  gameScores, 
  gameConfig,
  prizePool,
  usdtFundSettings,
  realRewards,
  referralRewards,
  beadsTransactions,
  boosts,
  userBoostInventory,
  characters,
  accessoryCategories,
  baseBodies,
  accessories,
  userAccessories,
  gameSkins,
  userSkins,
  boostPackages,
  boostPackagePurchases,
  cryptoPayments,
  teamMembers,
  revenueShares,
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
  type GameplayConfig,
  type Boost,
  type InsertBoost,
  type UserBoostInventory,
  type InsertUserBoostInventory,
  type Character,
  type InsertCharacter,
  type AccessoryCategory,
  type InsertAccessoryCategory,
  type BaseBody,
  type InsertBaseBody,
  type Accessory,
  type InsertAccessory,
  type UserAccessory,
  type InsertUserAccessory,
  type CharacterWithAccessories,
  type GameSkin,
  type InsertGameSkin,
  type UserSkin,
  type InsertUserSkin,
  type BoostPackage,
  type InsertBoostPackage,
  type BoostPackagePurchase,
  type InsertBoostPackagePurchase,
  type CryptoPayment,
  type InsertCryptoPayment,
  type TeamMember,
  type InsertTeamMember,
  type RevenueShare,
  type InsertRevenueShare,
  type RevenueSummary,
  leagues,
  type League,
  type InsertLeague,
  withdrawalRequests,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type WithdrawalConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, isNull, and, or, gte, sum, ilike, count, inArray } from "drizzle-orm";

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
  
  getLeaderboard(limit?: number, period?: 'all' | 'week' | 'today'): Promise<LeaderboardEntry[]>;
  getFriendsLeaderboardGlobal(userId: string, limit?: number): Promise<LeaderboardEntry[]>;
  
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
  awardSignupBonus(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }>;
  recordGameAndCompleteLevel(userId: string, score: number, levelId: number, isVictory: boolean): Promise<void>;
  
  getBoosts(): Promise<Boost[]>;
  getBoost(id: string): Promise<Boost | undefined>;
  getBoostByType(type: string): Promise<Boost | undefined>;
  createBoost(boost: InsertBoost): Promise<Boost>;
  updateBoost(id: string, updates: Partial<InsertBoost>): Promise<Boost | undefined>;
  deleteBoost(id: string): Promise<void>;
  
  getUserBoostInventory(userId: string): Promise<Array<UserBoostInventory & { boost: Boost }>>;
  buyBoost(userId: string, boostId: string): Promise<{ success: boolean; error?: string; newBalance?: number }>;
  useBoost(userId: string, boostId: string): Promise<{ success: boolean; error?: string; boost?: Boost }>;
  setUserBoostQuantity(userId: string, boostId: string, quantity: number): Promise<{ success: boolean; error?: string }>;
  
  // Character System
  getCharacter(userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(userId: string, updates: Partial<InsertCharacter>): Promise<Character | undefined>;
  getCharacterWithAccessories(userId: string): Promise<CharacterWithAccessories | null>;
  
  // Base Bodies
  getBaseBodies(gender?: string): Promise<BaseBody[]>;
  getDefaultBaseBody(gender: string): Promise<BaseBody | undefined>;
  ensureDefaultBaseBodies(): Promise<void>;
  createBaseBody(body: InsertBaseBody): Promise<BaseBody>;
  updateBaseBody(id: string, updates: Partial<InsertBaseBody>): Promise<BaseBody | undefined>;
  deleteBaseBody(id: string): Promise<void>;
  
  // Accessory Categories
  getAccessoryCategories(): Promise<AccessoryCategory[]>;
  createAccessoryCategory(category: InsertAccessoryCategory): Promise<AccessoryCategory>;
  updateAccessoryCategory(id: string, updates: Partial<InsertAccessoryCategory>): Promise<AccessoryCategory | undefined>;
  deleteAccessoryCategory(id: string): Promise<void>;
  
  // Accessories
  getAccessories(categoryId?: string, gender?: string): Promise<Accessory[]>;
  getAccessory(id: string): Promise<Accessory | undefined>;
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  updateAccessory(id: string, updates: Partial<InsertAccessory>): Promise<Accessory | undefined>;
  deleteAccessory(id: string): Promise<void>;
  
  // User Accessories
  getUserAccessories(userId: string): Promise<Array<UserAccessory & { accessory: Accessory }>>;
  purchaseAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string; userAccessory?: UserAccessory }>;
  equipAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string }>;
  unequipAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string }>;
  
  // Boost Packages
  getBoostPackages(activeOnly?: boolean): Promise<BoostPackage[]>;
  getBoostPackage(id: string): Promise<BoostPackage | undefined>;
  createBoostPackage(pkg: InsertBoostPackage): Promise<BoostPackage>;
  updateBoostPackage(id: string, updates: Partial<InsertBoostPackage>): Promise<BoostPackage | undefined>;
  deleteBoostPackage(id: string): Promise<void>;
  purchaseBoostPackage(userId: string, packageId: string, telegramPaymentId?: string): Promise<{ success: boolean; error?: string; purchase?: BoostPackagePurchase }>;
  getUserBoostPackagePurchases(userId: string): Promise<BoostPackagePurchase[]>;
  
  // Game Skins
  getGameSkins(activeOnly?: boolean): Promise<GameSkin[]>;
  getGameSkin(id: string): Promise<GameSkin | undefined>;
  getGameSkinByName(name: string): Promise<GameSkin | undefined>;
  createGameSkin(skin: InsertGameSkin): Promise<GameSkin>;
  updateGameSkin(id: string, updates: Partial<InsertGameSkin>): Promise<GameSkin | undefined>;
  deleteGameSkin(id: string): Promise<void>;
  
  // User Skins
  getUserSkins(userId: string): Promise<Array<UserSkin & { skin: GameSkin }>>;
  grantUserSkin(userId: string, skinId: string): Promise<UserSkin>;
  setActiveSkin(userId: string, skinId: string): Promise<{ success: boolean; error?: string }>;
  
  // Crypto Payments (NOWPayments)
  createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment>;
  getCryptoPayment(id: string): Promise<CryptoPayment | undefined>;
  getCryptoPaymentByNowPaymentId(nowPaymentId: string): Promise<CryptoPayment | undefined>;
  updateCryptoPaymentStatus(nowPaymentId: string, status: string, actuallyPaid?: string): Promise<CryptoPayment | undefined>;
  processCryptoPaymentSuccess(nowPaymentId: string): Promise<{ success: boolean; error?: string }>;
  
  // Team Members & Revenue
  getTeamMembers(activeOnly?: boolean): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<void>;
  createRevenueShare(share: InsertRevenueShare): Promise<RevenueShare>;
  getRevenueSummary(): Promise<RevenueSummary>;
  recordRevenueFromPurchase(purchaseId: string, priceStars: number, priceUsd: number, paymentType: 'stars' | 'crypto'): Promise<void>;
  
  // Leagues
  getLeagues(): Promise<League[]>;
  getLeague(slug: string): Promise<League | undefined>;
  getUserLeague(userId: string): Promise<{ league: League; rank: number } | undefined>;
  getUserRank(userId: string): Promise<number>;
  getLeagueLeaderboard(leagueSlug: string, limit?: number, period?: 'all' | 'week' | 'today'): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    totalPoints: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>>;
  getLeaguePlayerCount(leagueSlug: string): Promise<number>;
  getFriendsLeaderboard(userId: string, leagueSlug: string, limit?: number): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    totalPoints: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>>;
  
  // User Notifications
  getUsersWithoutCharacters(): Promise<Array<{ id: string; telegramId: string; firstName: string | null; username: string }>>;
  
  // Transaction Management
  deleteTransaction(transactionId: string): Promise<boolean>;
  
  // User Level Management
  resetUserLevels(userId: string): Promise<{ success: boolean; error?: string }>;
  
  // Withdrawal Requests
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getWithdrawalRequests(status?: string): Promise<Array<WithdrawalRequest & { username?: string }>>;
  getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]>;
  updateWithdrawalRequest(id: string, updates: { status?: string; adminNote?: string; txHash?: string; processedBy?: string; processedAt?: Date }): Promise<WithdrawalRequest | undefined>;
  getWithdrawalConfig(): Promise<WithdrawalConfig>;
  updateWithdrawalConfig(config: Partial<WithdrawalConfig>): Promise<WithdrawalConfig>;
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
    // Try exact match first
    let [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) return user;
    
    // Try with leading hyphen if not found
    if (!username.startsWith('-')) {
      [user] = await db.select().from(users).where(eq(users.username, `-${username}`));
      if (user) return user;
    }
    
    // Try without leading hyphen if original had one
    if (username.startsWith('-')) {
      [user] = await db.select().from(users).where(eq(users.username, username.substring(1)));
      if (user) return user;
    }
    
    return undefined;
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

  async getLeaderboard(limit: number = 50, period: 'all' | 'week' | 'today' = 'all'): Promise<LeaderboardEntry[]> {
    if (period === 'all') {
      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          u.photo_url,
          u.total_points,
          u.games_played,
          u.best_score,
          c.name as character_name,
          (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
        FROM users u
        LEFT JOIN characters c ON c.user_id = u.id
        WHERE u.deleted_at IS NULL AND u.total_points > 0
        ORDER BY u.total_points DESC
        LIMIT ${limit}
      `);

      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        photoUrl: row.photo_url,
        totalPoints: Number(row.total_points),
        gamesPlayed: row.games_played,
        bestScore: row.best_score,
        characterName: row.character_name || null,
        characterImageUrl: row.character_image_url || null,
      }));
    } else {
      const dateCondition = period === 'today' 
        ? sql`gs.created_at >= CURRENT_DATE`
        : sql`gs.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      
      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          u.photo_url,
          COALESCE(SUM(gs.score), 0)::integer as total_points,
          u.games_played,
          u.best_score,
          c.name as character_name,
          (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
        FROM users u
        LEFT JOIN game_scores gs ON gs.user_id = u.id AND ${dateCondition}
        LEFT JOIN characters c ON c.user_id = u.id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.username, u.photo_url, u.games_played, u.best_score, c.name, c.gender
        HAVING COALESCE(SUM(gs.score), 0) > 0
        ORDER BY total_points DESC
        LIMIT ${limit}
      `);
      
      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        photoUrl: row.photo_url,
        totalPoints: Number(row.total_points),
        gamesPlayed: row.games_played,
        bestScore: row.best_score,
        characterName: row.character_name || null,
        characterImageUrl: row.character_image_url || null,
      }));
    }
  }
  
  async getFriendsLeaderboardGlobal(userId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    const result = await db.execute(sql`
      WITH user_info AS (
        SELECT referred_by, referral_code FROM users WHERE id = ${userId}
      ),
      friends AS (
        SELECT u.id
        FROM users u, user_info ui
        WHERE u.deleted_at IS NULL 
          AND u.id != ${userId}
          AND u.total_points > 0
          AND (
            (ui.referred_by IS NOT NULL AND u.referred_by = ui.referred_by)
            OR (ui.referral_code IS NOT NULL AND u.referred_by = ui.referral_code)
            OR (ui.referred_by IS NOT NULL AND u.referral_code = ui.referred_by)
          )
      )
      SELECT 
        u.id,
        u.username,
        u.photo_url,
        u.total_points,
        u.games_played,
        u.best_score,
        c.name as character_name,
        (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url,
        RANK() OVER (ORDER BY u.total_points DESC) as rank
      FROM users u
      INNER JOIN friends f ON f.id = u.id
      LEFT JOIN characters c ON c.user_id = u.id
      ORDER BY u.total_points DESC
      LIMIT ${limit}
    `);
    
    return result.rows.map((row: any) => ({
      rank: Number(row.rank),
      userId: row.id,
      username: row.username,
      photoUrl: row.photo_url,
      totalPoints: Number(row.total_points),
      gamesPlayed: row.games_played,
      bestScore: row.best_score,
      characterName: row.character_name || null,
      characterImageUrl: row.character_image_url || null,
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

  private getDefaultGameplayConfig(): GameplayConfig {
    return {
      balls: {
        initialCount: 5,
        targetCount: 50,
        maxTotalBalls: 60,
      },
      spawn: {
        period: 1800,
        resumeThreshold: 35,
      },
      speed: {
        base: 0.010,
        max: 0.016,
        accelerationStart: 0.8,
      },
      colors: {
        count: 5,
        activeColors: ['red', 'blue', 'green', 'yellow', 'purple'],
      },
    };
  }

  async getGameplayConfig(): Promise<GameplayConfig> {
    const config = await this.getGameConfig('gameplay_config');
    if (!config) {
      const defaultConfig = this.getDefaultGameplayConfig();
      await this.setGameConfig({
        key: 'gameplay_config',
        value: defaultConfig,
        description: 'Gameplay configuration (balls, spawn, speed, colors)',
      });
      return defaultConfig;
    }
    
    const stored = config.value as GameplayConfig;
    const defaults = this.getDefaultGameplayConfig();
    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'amber', 'lime', 'violet'];
    
    let activeColors = stored.colors?.activeColors;
    if (activeColors && Array.isArray(activeColors)) {
      activeColors = activeColors.filter((c: string) => validColors.includes(c));
    }
    if (!activeColors || activeColors.length < 2) {
      const count = Math.max(2, Math.min(10, stored.colors?.count ?? defaults.colors.count));
      activeColors = validColors.slice(0, count);
    }
    
    return {
      balls: {
        initialCount: stored.balls?.initialCount ?? defaults.balls.initialCount,
        targetCount: stored.balls?.targetCount ?? defaults.balls.targetCount,
        maxTotalBalls: stored.balls?.maxTotalBalls ?? defaults.balls.maxTotalBalls,
      },
      spawn: {
        period: stored.spawn?.period ?? defaults.spawn.period,
        resumeThreshold: stored.spawn?.resumeThreshold ?? defaults.spawn.resumeThreshold,
      },
      speed: {
        base: stored.speed?.base ?? defaults.speed.base,
        max: stored.speed?.max ?? defaults.speed.max,
        accelerationStart: stored.speed?.accelerationStart ?? defaults.speed.accelerationStart,
      },
      colors: {
        count: activeColors.length,
        activeColors: activeColors,
      },
    };
  }

  async updateGameplayConfig(updates: Partial<GameplayConfig>): Promise<GameplayConfig> {
    const current = await this.getGameplayConfig();
    
    const newConfig: GameplayConfig = {
      balls: {
        initialCount: updates.balls?.initialCount ?? current.balls.initialCount,
        targetCount: updates.balls?.targetCount ?? current.balls.targetCount,
        maxTotalBalls: updates.balls?.maxTotalBalls ?? current.balls.maxTotalBalls,
      },
      spawn: {
        period: updates.spawn?.period ?? current.spawn.period,
        resumeThreshold: updates.spawn?.resumeThreshold ?? current.spawn.resumeThreshold,
      },
      speed: {
        base: updates.speed?.base ?? current.speed.base,
        max: updates.speed?.max ?? current.speed.max,
        accelerationStart: updates.speed?.accelerationStart ?? current.speed.accelerationStart,
      },
      colors: (() => {
        const newActiveColors = updates.colors?.activeColors ?? current.colors.activeColors;
        return {
          count: newActiveColors ? newActiveColors.length : (updates.colors?.count ?? current.colors.count),
          activeColors: newActiveColors,
        };
      })(),
    };
    
    await this.setGameConfig({
      key: 'gameplay_config',
      value: newConfig,
      description: 'Gameplay configuration (balls, spawn, speed, colors)',
    });
    
    return newConfig;
  }

  async processCryptoRewards(
    userId: string, 
    cryptoBtc: number, 
    cryptoEth: number, 
    cryptoUsdt: number,
    gameScoreId?: string
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
    const WEI_PER_ETH = 1_000_000_000_000_000_000; // 10^18 Wei per ETH

    const btcSatsPerBall = Math.round(btcRate * SATS_PER_BTC);
    const ethWeiPerBall = Math.round(ethRate * WEI_PER_ETH);

    const today = new Date().toISOString().split('T')[0];

    const btcMaxSats = dailyLimits?.btcMaxSatsPerDay ?? 1000;
    const ethMaxWei = dailyLimits?.ethMaxWeiPerDay ?? 10000000;
    const usdtMax = dailyLimits?.usdtMaxPerDay ?? 1.0;

    const btcSatsRequested = safeBtc * btcSatsPerBall;
    const ethWeiRequested = safeEth * ethWeiPerBall;
    const usdtRequested = safeUsdt * usdtRate;

    const btcPoolAvailable = Math.floor(pools?.btcBalanceSats ?? 0);
    const ethPoolAvailable = Math.floor(pools?.ethBalanceWei ?? 0);
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

      // Save to real_rewards table for audit trail
      if (btcSatsAwarded > 0) {
        await db.insert(realRewards).values({
          userId,
          cryptoType: 'btc',
          amount: btcAwarded,
          gameScoreId: gameScoreId || null,
        });
      }
      if (ethWeiAwarded > 0) {
        await db.insert(realRewards).values({
          userId,
          cryptoType: 'eth',
          amount: ethAwarded,
          gameScoreId: gameScoreId || null,
        });
      }
      if (usdtAwarded > 0) {
        await db.insert(realRewards).values({
          userId,
          cryptoType: 'usdt',
          amount: usdtAwarded,
          gameScoreId: gameScoreId || null,
        });
      }
      console.log(`Crypto rewards saved to real_rewards table for user ${userId}`);
    }

    return { btcAwarded, ethAwarded, usdtAwarded, btcSatsAwarded, ethWeiAwarded };
  }

  async getCryptoAvailability(userId: string): Promise<import('@shared/schema').CryptoAvailability> {
    const user = await this.getUser(userId);
    const config = await this.getGameEconomyConfig();
    const { dailyLimits, pools, perGameLimits, cryptoRewards } = config;
    
    // Check if crypto fund is globally enabled
    const fundToggles = await this.getFundToggles();

    const today = new Date().toISOString().split('T')[0];

    const SATS_PER_BTC = 100_000_000;
    const WEI_PER_ETH = 1_000_000_000_000_000_000; // 10^18 Wei per ETH

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

    // Crypto is only enabled if global toggle is ON AND there are funds AND user has remaining limit
    const cryptoGloballyEnabled = fundToggles.cryptoFundEnabled;
    
    return {
      btcEnabled: cryptoGloballyEnabled && btcHasFund && btcHasLimit,
      ethEnabled: cryptoGloballyEnabled && ethHasFund && ethHasLimit,
      usdtEnabled: cryptoGloballyEnabled && usdtHasFund && usdtHasLimit,
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
    
    // Прямые рефералы (уровень 1)
    const level1Referrals = await db.select({ 
      totalPoints: users.totalPoints,
      referralCode: users.referralCode 
    })
      .from(users)
      .where(eq(users.referredBy, referralCode));
    
    const referralsTotalBeads = level1Referrals.reduce((sum, r) => sum + (r.totalPoints || 0), 0);
    
    // Рефералы 2-го уровня (рефералы рефералов)
    const level1Codes = level1Referrals
      .map(r => r.referralCode)
      .filter((code): code is string => code !== null);
    
    let level2ReferralsCount = 0;
    if (level1Codes.length > 0) {
      const level2Result = await db.select({ count: count() })
        .from(users)
        .where(inArray(users.referredBy, level1Codes));
      level2ReferralsCount = Number(level2Result[0]?.count) || 0;
    }
    
    // Последняя награда для уведомлений
    const lastReward = await db.select({ id: referralRewards.id })
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId))
      .orderBy(desc(referralRewards.createdAt))
      .limit(1);
    
    return {
      referralCode,
      referralLink: `https://t.me/${botUsername}?start=${referralCode}`,
      directReferralsCount: user?.directReferralsCount ?? 0,
      level2ReferralsCount,
      totalEarnedBeads,
      referralsTotalBeads,
      lastRewardId: lastReward[0]?.id,
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

  async deleteUserReferralRewards(userId: string): Promise<number> {
    // Get total beads to deduct from user
    const totalBeads = await this.getTotalReferralBeads(userId);
    
    // Delete all referral rewards for this user
    await db.delete(referralRewards).where(eq(referralRewards.userId, userId));
    
    // Deduct beads from user's total points
    if (totalBeads > 0) {
      const user = await this.getUser(userId);
      if (user) {
        await db.update(users)
          .set({ totalPoints: Math.max(0, user.totalPoints - totalBeads) })
          .where(eq(users.id, userId));
      }
    }
    
    return totalBeads;
  }

  async getAllReferralRewards(): Promise<(ReferralReward & { username?: string; refUsername?: string })[]> {
    const rewards = await db.select()
      .from(referralRewards)
      .orderBy(desc(referralRewards.createdAt))
      .limit(500);
    
    // Add usernames
    const result = [];
    for (const reward of rewards) {
      const user = await this.getUser(reward.userId);
      const refUser = await this.getUser(reward.refUserId);
      result.push({
        ...reward,
        username: user?.username,
        refUsername: refUser?.username,
      });
    }
    
    return result;
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
  }): Promise<{ transactions: Array<BeadsTransaction & { username?: string; cryptoBtc?: number; cryptoEth?: number; cryptoUsdt?: number }>; total: number }> {
    const { limit = 20, offset = 0, type, search } = options;
    
    const conditions: any[] = [];
    
    if (type && type !== 'all') {
      conditions.push(eq(beadsTransactions.type, type));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(beadsTransactions.description, `%${search}%`),
          sql`${beadsTransactions.userId}::text ILIKE ${'%' + search + '%'}`,
          ilike(users.username, `%${search}%`)
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
        deletedAt: beadsTransactions.deletedAt,
        deletedBy: beadsTransactions.deletedBy,
        deleteReason: beadsTransactions.deleteReason,
        username: users.username,
        cryptoBtc: gameScores.cryptoBtc,
        cryptoEth: gameScores.cryptoEth,
        cryptoUsdt: gameScores.cryptoUsdt,
      })
        .from(beadsTransactions)
        .leftJoin(users, eq(beadsTransactions.userId, users.id))
        .leftJoin(gameScores, eq(beadsTransactions.gameScoreId, gameScores.id))
        .where(whereClause)
        .orderBy(desc(beadsTransactions.createdAt))
        .limit(limit)
        .offset(offset),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(beadsTransactions)
        .leftJoin(users, eq(beadsTransactions.userId, users.id))
        .where(whereClause),
    ]);
    
    return {
      transactions: transactionsResult.map(tx => ({
        ...tx,
        username: tx.username ?? undefined,
        cryptoBtc: tx.cryptoBtc ?? undefined,
        cryptoEth: tx.cryptoEth ?? undefined,
        cryptoUsdt: tx.cryptoUsdt ?? undefined,
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

  async awardSignupBonus(
    userId: string,
    amount: number
  ): Promise<{ success: boolean; newBalance: number }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, newBalance: 0 };
    
    // Check if user already received signup bonus
    if (user.signupBonusReceived) {
      return { success: false, newBalance: user.totalPoints };
    }
    
    // Atomic update: only update if signupBonusReceived is still false
    // This prevents race conditions with parallel requests
    const userBalanceBefore = user.totalPoints;
    const userBalanceAfter = userBalanceBefore + amount;
    
    const updateResult = await db.update(users)
      .set({ 
        totalPoints: userBalanceAfter,
        signupBonusReceived: true,
      })
      .where(and(eq(users.id, userId), eq(users.signupBonusReceived, false)))
      .returning({ id: users.id });
    
    // If no rows updated, bonus was already given (race condition prevented)
    if (updateResult.length === 0) {
      const updatedUser = await this.getUser(userId);
      return { success: false, newBalance: updatedUser?.totalPoints ?? user.totalPoints };
    }
    
    const house = await this.getHouseAccount();
    const houseBalanceBefore = house.balance;
    const houseBalanceAfter = houseBalanceBefore - amount;
    
    await this.updateHouseAccount({
      balance: houseBalanceAfter,
      totalDistributed: house.totalDistributed + amount,
    });
    
    await this.createBeadsTransaction({
      userId,
      type: 'signup_bonus',
      amount,
      balanceBefore: userBalanceBefore,
      balanceAfter: userBalanceAfter,
      houseBalanceBefore,
      houseBalanceAfter,
      description: `Приветственный бонус: ${amount} Beads`,
    });
    
    return { success: true, newBalance: userBalanceAfter };
  }

  async getCryptoRewards(options: {
    limit?: number;
    offset?: number;
    cryptoType?: string;
    search?: string;
  } = {}): Promise<{ rewards: any[]; total: number }> {
    const { limit = 20, offset = 0, cryptoType, search } = options;
    
    const conditions = [];
    if (cryptoType) {
      conditions.push(eq(realRewards.cryptoType, cryptoType));
    }
    
    let baseQuery = db
      .select({
        id: realRewards.id,
        userId: realRewards.userId,
        cryptoType: realRewards.cryptoType,
        amount: realRewards.amount,
        gameScoreId: realRewards.gameScoreId,
        createdAt: realRewards.createdAt,
        username: users.username,
        cryptoBtc: gameScores.cryptoBtc,
        cryptoEth: gameScores.cryptoEth,
        cryptoUsdt: gameScores.cryptoUsdt,
      })
      .from(realRewards)
      .leftJoin(users, eq(realRewards.userId, users.id))
      .leftJoin(gameScores, eq(realRewards.gameScoreId, gameScores.id));
    
    if (cryptoType) {
      baseQuery = baseQuery.where(eq(realRewards.cryptoType, cryptoType)) as typeof baseQuery;
    }
    
    if (search) {
      baseQuery = baseQuery.where(ilike(users.username, `%${search}%`)) as typeof baseQuery;
    }
    
    const rewards = await baseQuery
      .orderBy(desc(realRewards.createdAt))
      .limit(limit)
      .offset(offset);
    
    let countQuery = db.select({ count: count() }).from(realRewards).leftJoin(users, eq(realRewards.userId, users.id));
    if (cryptoType) {
      countQuery = countQuery.where(eq(realRewards.cryptoType, cryptoType)) as typeof countQuery;
    }
    if (search) {
      countQuery = countQuery.where(ilike(users.username, `%${search}%`)) as typeof countQuery;
    }
    const totalResult = await countQuery;
    
    return {
      rewards,
      total: totalResult[0]?.count || 0,
    };
  }

  async recordGameAndCompleteLevel(userId: string, score: number, levelId: number, isVictory: boolean): Promise<void> {
    await db
      .update(users)
      .set({
        gamesPlayed: sql`COALESCE(${users.gamesPlayed}, 0) + 1`,
        bestScore: sql`GREATEST(COALESCE(${users.bestScore}, 0), ${score})`,
        completedLevels: isVictory 
          ? sql`CASE 
              WHEN ${levelId} = ANY(COALESCE(${users.completedLevels}, ARRAY[]::integer[])) 
              THEN COALESCE(${users.completedLevels}, ARRAY[]::integer[])
              ELSE array_append(COALESCE(${users.completedLevels}, ARRAY[]::integer[]), ${levelId})
            END`
          : sql`COALESCE(${users.completedLevels}, ARRAY[]::integer[])`,
      })
      .where(eq(users.id, userId));
  }

  async getBoosts(): Promise<Boost[]> {
    return db
      .select()
      .from(boosts)
      .where(eq(boosts.isActive, true))
      .orderBy(boosts.sortOrder);
  }

  async getBoost(id: string): Promise<Boost | undefined> {
    const [boost] = await db.select().from(boosts).where(eq(boosts.id, id));
    return boost || undefined;
  }

  async getBoostByType(type: string): Promise<Boost | undefined> {
    const [boost] = await db.select().from(boosts).where(eq(boosts.type, type));
    return boost || undefined;
  }

  async createBoost(insertBoost: InsertBoost): Promise<Boost> {
    const [boost] = await db
      .insert(boosts)
      .values(insertBoost)
      .returning();
    return boost;
  }

  async updateBoost(id: string, updates: Partial<InsertBoost>): Promise<Boost | undefined> {
    const [boost] = await db
      .update(boosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(boosts.id, id))
      .returning();
    return boost || undefined;
  }

  async deleteBoost(id: string): Promise<void> {
    await db.delete(boosts).where(eq(boosts.id, id));
  }

  async getUserBoostInventory(userId: string): Promise<Array<UserBoostInventory & { boost: Boost }>> {
    const inventory = await db
      .select({
        id: userBoostInventory.id,
        userId: userBoostInventory.userId,
        boostId: userBoostInventory.boostId,
        quantity: userBoostInventory.quantity,
        createdAt: userBoostInventory.createdAt,
        updatedAt: userBoostInventory.updatedAt,
        boost: boosts,
      })
      .from(userBoostInventory)
      .innerJoin(boosts, eq(userBoostInventory.boostId, boosts.id))
      .where(and(
        eq(userBoostInventory.userId, userId),
        sql`${userBoostInventory.quantity} > 0`
      ));
    
    return inventory;
  }

  async buyBoost(userId: string, boostId: string): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, error: 'Пользователь не найден' };
    }

    const boost = await this.getBoost(boostId);
    if (!boost) {
      return { success: false, error: 'Буст не найден' };
    }

    if (!boost.isActive) {
      return { success: false, error: 'Буст недоступен' };
    }

    if (user.totalPoints < boost.price) {
      return { success: false, error: 'Недостаточно Beads' };
    }

    const result = await this.chargeBeadsToHouse(
      userId,
      boost.price,
      'buy_boost',
      `Покупка буста: ${boost.nameRu}`
    );

    if (!result.success) {
      return { success: false, error: 'Ошибка списания Beads' };
    }

    const [existingInventory] = await db
      .select()
      .from(userBoostInventory)
      .where(and(
        eq(userBoostInventory.userId, userId),
        eq(userBoostInventory.boostId, boostId)
      ));

    if (existingInventory) {
      await db
        .update(userBoostInventory)
        .set({ 
          quantity: existingInventory.quantity + 1,
          updatedAt: new Date()
        })
        .where(eq(userBoostInventory.id, existingInventory.id));
    } else {
      await db
        .insert(userBoostInventory)
        .values({
          userId,
          boostId,
          quantity: 1,
        });
    }

    return { success: true, newBalance: result.newBalance };
  }

  async useBoost(userId: string, boostId: string): Promise<{ success: boolean; error?: string; boost?: Boost }> {
    const [inventoryItem] = await db
      .select()
      .from(userBoostInventory)
      .where(and(
        eq(userBoostInventory.userId, userId),
        eq(userBoostInventory.boostId, boostId)
      ));

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, error: 'У вас нет этого буста' };
    }

    const boost = await this.getBoost(boostId);
    if (!boost) {
      return { success: false, error: 'Буст не найден' };
    }

    await db
      .update(userBoostInventory)
      .set({ 
        quantity: inventoryItem.quantity - 1,
        updatedAt: new Date()
      })
      .where(eq(userBoostInventory.id, inventoryItem.id));

    return { success: true, boost };
  }

  async setUserBoostQuantity(userId: string, boostId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    const [existing] = await db
      .select()
      .from(userBoostInventory)
      .where(and(
        eq(userBoostInventory.userId, userId),
        eq(userBoostInventory.boostId, boostId)
      ));

    if (existing) {
      await db
        .update(userBoostInventory)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(userBoostInventory.id, existing.id));
    } else {
      await db.insert(userBoostInventory).values({
        userId,
        boostId,
        quantity,
      });
    }
    return { success: true };
  }

  // Character System Methods
  async getCharacter(userId: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.userId, userId));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }

  async updateCharacter(userId: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [character] = await db
      .update(characters)
      .set(updates)
      .where(eq(characters.userId, userId))
      .returning();
    return character || undefined;
  }

  async getCharacterWithAccessories(userId: string): Promise<CharacterWithAccessories | null> {
    const character = await this.getCharacter(userId);
    if (!character) return null;

    const baseBody = await this.getDefaultBaseBody(character.gender);
    const equippedAccessories = await db
      .select()
      .from(userAccessories)
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .where(and(
        eq(userAccessories.userId, userId),
        eq(userAccessories.isEquipped, true)
      ));

    return {
      character,
      baseBody: baseBody || null,
      equippedAccessories: equippedAccessories.map(row => ({
        ...row.user_accessories,
        accessory: row.accessories,
      })),
    };
  }

  // Base Bodies
  async getBaseBodies(gender?: string): Promise<BaseBody[]> {
    if (gender) {
      return db.select().from(baseBodies).where(eq(baseBodies.gender, gender)).orderBy(baseBodies.createdAt);
    }
    return db.select().from(baseBodies).orderBy(baseBodies.createdAt);
  }

  async getDefaultBaseBody(gender: string): Promise<BaseBody | undefined> {
    // First try to find the default body for this gender
    const [body] = await db
      .select()
      .from(baseBodies)
      .where(and(eq(baseBodies.gender, gender), eq(baseBodies.isDefault, true)));
    if (body) return body;
    
    // Fallback to any body of this gender if no default set
    const [fallbackBody] = await db
      .select()
      .from(baseBodies)
      .where(eq(baseBodies.gender, gender))
      .limit(1);
    return fallbackBody || undefined;
  }

  async ensureDefaultBaseBodies(): Promise<void> {
    const femaleDefault = await this.getDefaultBaseBody('female');
    if (!femaleDefault) {
      await db.insert(baseBodies).values({
        gender: 'female',
        imageUrl: '/uploads/characters/female_default.png',
        isDefault: true,
      });
      console.log('Created default female base body');
    }
  }

  async createBaseBody(body: InsertBaseBody): Promise<BaseBody> {
    const [newBody] = await db.insert(baseBodies).values(body).returning();
    return newBody;
  }

  async updateBaseBody(id: string, updates: Partial<InsertBaseBody>): Promise<BaseBody | undefined> {
    const [body] = await db.update(baseBodies).set(updates).where(eq(baseBodies.id, id)).returning();
    return body || undefined;
  }

  async deleteBaseBody(id: string): Promise<void> {
    await db.delete(baseBodies).where(eq(baseBodies.id, id));
  }

  // Accessory Categories
  async getAccessoryCategories(): Promise<AccessoryCategory[]> {
    return db.select().from(accessoryCategories).orderBy(accessoryCategories.sortOrder);
  }

  async createAccessoryCategory(category: InsertAccessoryCategory): Promise<AccessoryCategory> {
    const [newCategory] = await db.insert(accessoryCategories).values(category).returning();
    return newCategory;
  }

  async updateAccessoryCategory(id: string, updates: Partial<InsertAccessoryCategory>): Promise<AccessoryCategory | undefined> {
    const [category] = await db.update(accessoryCategories).set(updates).where(eq(accessoryCategories.id, id)).returning();
    return category || undefined;
  }

  async deleteAccessoryCategory(id: string): Promise<void> {
    await db.delete(accessoryCategories).where(eq(accessoryCategories.id, id));
  }

  // Accessories
  async getAccessories(categoryId?: string, gender?: string): Promise<Accessory[]> {
    let conditions = [];
    if (categoryId) conditions.push(eq(accessories.categoryId, categoryId));
    if (gender) conditions.push(or(eq(accessories.gender, gender), eq(accessories.gender, 'both')));
    conditions.push(eq(accessories.isActive, true));

    if (conditions.length > 0) {
      return db.select().from(accessories).where(and(...conditions)).orderBy(accessories.createdAt);
    }
    return db.select().from(accessories).where(eq(accessories.isActive, true)).orderBy(accessories.createdAt);
  }

  async getAccessory(id: string): Promise<Accessory | undefined> {
    const [accessory] = await db.select().from(accessories).where(eq(accessories.id, id));
    return accessory || undefined;
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const [newAccessory] = await db.insert(accessories).values(accessory).returning();
    return newAccessory;
  }

  async updateAccessory(id: string, updates: Partial<InsertAccessory>): Promise<Accessory | undefined> {
    const [accessory] = await db.update(accessories).set(updates).where(eq(accessories.id, id)).returning();
    return accessory || undefined;
  }

  async deleteAccessory(id: string): Promise<void> {
    await db.delete(accessories).where(eq(accessories.id, id));
  }

  // User Accessories
  async getUserAccessories(userId: string): Promise<Array<UserAccessory & { accessory: Accessory }>> {
    const result = await db
      .select()
      .from(userAccessories)
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .where(eq(userAccessories.userId, userId));

    return result.map(row => ({
      ...row.user_accessories,
      accessory: row.accessories,
    }));
  }

  async purchaseAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string; userAccessory?: UserAccessory }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, error: 'Пользователь не найден' };

    const accessory = await this.getAccessory(accessoryId);
    if (!accessory) return { success: false, error: 'Аксессуар не найден' };
    if (!accessory.isActive) return { success: false, error: 'Аксессуар недоступен' };

    // Check if already owned
    const [existing] = await db
      .select()
      .from(userAccessories)
      .where(and(
        eq(userAccessories.userId, userId),
        eq(userAccessories.accessoryId, accessoryId)
      ));
    if (existing) return { success: false, error: 'Вы уже владеете этим аксессуаром' };

    // Check quantity limit
    if (accessory.maxQuantity !== null && accessory.soldCount >= accessory.maxQuantity) {
      return { success: false, error: 'Аксессуар распродан' };
    }

    // Check balance
    if (user.totalPoints < accessory.price) {
      return { success: false, error: 'Недостаточно Beads' };
    }

    // Charge beads
    const result = await this.chargeBeadsToHouse(
      userId,
      accessory.price,
      'buy_boost',
      `Покупка аксессуара: ${accessory.nameRu}`
    );
    if (!result.success) return { success: false, error: 'Ошибка списания Beads' };

    // Update sold count
    await db.update(accessories).set({ soldCount: accessory.soldCount + 1 }).where(eq(accessories.id, accessoryId));

    // Create user accessory
    const [userAccessory] = await db.insert(userAccessories).values({
      userId,
      accessoryId,
      isEquipped: false,
    }).returning();

    return { success: true, userAccessory };
  }

  async equipAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string }> {
    // Find the user accessory
    const [userAccessory] = await db
      .select()
      .from(userAccessories)
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .where(and(
        eq(userAccessories.userId, userId),
        eq(userAccessories.accessoryId, accessoryId)
      ));

    if (!userAccessory) return { success: false, error: 'Аксессуар не найден в инвентаре' };

    // Get accessory's category to unequip other items in same slot
    const category = await db
      .select()
      .from(accessoryCategories)
      .where(eq(accessoryCategories.id, userAccessory.accessories.categoryId));
    
    if (category.length > 0) {
      // Unequip all accessories in the same slot
      const accessoriesInSameSlot = await db
        .select()
        .from(accessories)
        .innerJoin(accessoryCategories, eq(accessories.categoryId, accessoryCategories.id))
        .where(eq(accessoryCategories.slot, category[0].slot));

      const accessoryIdsInSlot = accessoriesInSameSlot.map(a => a.accessories.id);
      if (accessoryIdsInSlot.length > 0) {
        await db
          .update(userAccessories)
          .set({ isEquipped: false })
          .where(and(
            eq(userAccessories.userId, userId),
            inArray(userAccessories.accessoryId, accessoryIdsInSlot)
          ));
      }
    }

    // Equip the new accessory
    await db
      .update(userAccessories)
      .set({ isEquipped: true })
      .where(and(
        eq(userAccessories.userId, userId),
        eq(userAccessories.accessoryId, accessoryId)
      ));

    return { success: true };
  }

  async unequipAccessory(userId: string, accessoryId: string): Promise<{ success: boolean; error?: string }> {
    const [userAccessory] = await db
      .select()
      .from(userAccessories)
      .where(and(
        eq(userAccessories.userId, userId),
        eq(userAccessories.accessoryId, accessoryId)
      ));

    if (!userAccessory) return { success: false, error: 'Аксессуар не найден в инвентаре' };

    await db
      .update(userAccessories)
      .set({ isEquipped: false })
      .where(eq(userAccessories.id, userAccessory.id));

    return { success: true };
  }

  // Boost Packages
  async getBoostPackages(activeOnly: boolean = true): Promise<BoostPackage[]> {
    if (activeOnly) {
      return db
        .select()
        .from(boostPackages)
        .where(eq(boostPackages.isActive, true))
        .orderBy(boostPackages.sortOrder);
    }
    return db.select().from(boostPackages).orderBy(boostPackages.sortOrder);
  }

  async getBoostPackage(id: string): Promise<BoostPackage | undefined> {
    const [pkg] = await db.select().from(boostPackages).where(eq(boostPackages.id, id));
    return pkg || undefined;
  }

  async createBoostPackage(pkg: InsertBoostPackage): Promise<BoostPackage> {
    const [newPkg] = await db.insert(boostPackages).values(pkg).returning();
    return newPkg;
  }

  async updateBoostPackage(id: string, updates: Partial<InsertBoostPackage>): Promise<BoostPackage | undefined> {
    const [pkg] = await db
      .update(boostPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(boostPackages.id, id))
      .returning();
    return pkg || undefined;
  }

  async deleteBoostPackage(id: string): Promise<void> {
    await db.delete(boostPackages).where(eq(boostPackages.id, id));
  }

  async purchaseBoostPackage(
    userId: string,
    packageId: string,
    telegramPaymentId?: string
  ): Promise<{ success: boolean; error?: string; purchase?: BoostPackagePurchase }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, error: 'Пользователь не найден' };

    const pkg = await this.getBoostPackage(packageId);
    if (!pkg) return { success: false, error: 'Пакет не найден' };
    if (!pkg.isActive) return { success: false, error: 'Пакет недоступен' };

    // Create purchase record
    const [purchase] = await db.insert(boostPackagePurchases).values({
      userId,
      packageId,
      telegramPaymentId,
      priceStars: pkg.priceStars,
      boostsPerType: pkg.boostsPerType,
      bonusLives: pkg.bonusLives,
      status: 'completed',
    }).returning();

    // Add boosts to user inventory (all 7 types)
    const allBoosts = await this.getBoosts();
    for (const boost of allBoosts) {
      const [existing] = await db
        .select()
        .from(userBoostInventory)
        .where(and(
          eq(userBoostInventory.userId, userId),
          eq(userBoostInventory.boostId, boost.id)
        ));

      if (existing) {
        await db
          .update(userBoostInventory)
          .set({ 
            quantity: existing.quantity + pkg.boostsPerType,
            updatedAt: new Date()
          })
          .where(eq(userBoostInventory.id, existing.id));
      } else {
        await db.insert(userBoostInventory).values({
          userId,
          boostId: boost.id,
          quantity: pkg.boostsPerType,
        });
      }
    }

    // Add bonus lives if any (as extra lives inventory or config)
    // TODO: implement bonus lives tracking if needed

    return { success: true, purchase };
  }

  async getUserBoostPackagePurchases(userId: string): Promise<BoostPackagePurchase[]> {
    return db
      .select()
      .from(boostPackagePurchases)
      .where(eq(boostPackagePurchases.userId, userId))
      .orderBy(desc(boostPackagePurchases.createdAt));
  }

  // Game Skins Methods
  async getGameSkins(activeOnly: boolean = true): Promise<GameSkin[]> {
    if (activeOnly) {
      return db.select().from(gameSkins).where(eq(gameSkins.isActive, true));
    }
    return db.select().from(gameSkins);
  }

  async getGameSkin(id: string): Promise<GameSkin | undefined> {
    const [skin] = await db.select().from(gameSkins).where(eq(gameSkins.id, id));
    return skin || undefined;
  }

  async getGameSkinByName(name: string): Promise<GameSkin | undefined> {
    const [skin] = await db.select().from(gameSkins).where(eq(gameSkins.name, name));
    return skin || undefined;
  }

  async createGameSkin(skin: InsertGameSkin): Promise<GameSkin> {
    const [newSkin] = await db.insert(gameSkins).values(skin).returning();
    return newSkin;
  }

  async updateGameSkin(id: string, updates: Partial<InsertGameSkin>): Promise<GameSkin | undefined> {
    const [skin] = await db
      .update(gameSkins)
      .set(updates)
      .where(eq(gameSkins.id, id))
      .returning();
    return skin || undefined;
  }

  async deleteGameSkin(id: string): Promise<void> {
    await db.delete(gameSkins).where(eq(gameSkins.id, id));
  }

  // User Skins Methods
  async getUserSkins(userId: string): Promise<Array<UserSkin & { skin: GameSkin }>> {
    const results = await db
      .select()
      .from(userSkins)
      .innerJoin(gameSkins, eq(userSkins.skinId, gameSkins.id))
      .where(eq(userSkins.userId, userId));
    
    return results.map(r => ({
      ...r.user_skins,
      skin: r.game_skins,
    }));
  }

  async grantUserSkin(userId: string, skinId: string): Promise<UserSkin> {
    // Check if user already has this skin
    const [existing] = await db
      .select()
      .from(userSkins)
      .where(and(
        eq(userSkins.userId, userId),
        eq(userSkins.skinId, skinId)
      ));
    
    if (existing) {
      return existing;
    }

    const [userSkin] = await db.insert(userSkins).values({
      userId,
      skinId,
      isActive: false,
    }).returning();
    return userSkin;
  }

  async setActiveSkin(userId: string, skinId: string): Promise<{ success: boolean; error?: string }> {
    // Check if user owns this skin
    const [owned] = await db
      .select()
      .from(userSkins)
      .where(and(
        eq(userSkins.userId, userId),
        eq(userSkins.skinId, skinId)
      ));
    
    if (!owned) {
      return { success: false, error: 'У вас нет этого скина' };
    }

    // Deactivate all user skins first
    await db
      .update(userSkins)
      .set({ isActive: false })
      .where(eq(userSkins.userId, userId));
    
    // Activate the selected skin
    await db
      .update(userSkins)
      .set({ isActive: true })
      .where(eq(userSkins.id, owned.id));
    
    return { success: true };
  }

  // Crypto Payments (NOWPayments)
  async createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment> {
    const [created] = await db.insert(cryptoPayments).values(payment).returning();
    return created;
  }

  async getCryptoPayment(id: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, id));
    return payment || undefined;
  }

  async getCryptoPaymentByNowPaymentId(nowPaymentId: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.nowPaymentId, nowPaymentId));
    return payment || undefined;
  }

  async updateCryptoPaymentStatus(nowPaymentId: string, status: string, actuallyPaid?: string): Promise<CryptoPayment | undefined> {
    const updates: { status: string; actuallyPaid?: string; updatedAt: Date } = { 
      status, 
      updatedAt: new Date() 
    };
    if (actuallyPaid !== undefined) {
      updates.actuallyPaid = actuallyPaid;
    }
    
    const [updated] = await db
      .update(cryptoPayments)
      .set(updates)
      .where(eq(cryptoPayments.nowPaymentId, nowPaymentId))
      .returning();
    return updated || undefined;
  }

  async processCryptoPaymentSuccess(nowPaymentId: string): Promise<{ success: boolean; error?: string }> {
    const payment = await this.getCryptoPaymentByNowPaymentId(nowPaymentId);
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status === 'finished') {
      return { success: false, error: 'Payment already processed' };
    }

    // Get package details
    const pkg = await this.getBoostPackage(payment.packageId);
    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    // Use the existing purchaseBoostPackage method to add boosts
    const result = await this.purchaseBoostPackage(payment.userId, payment.packageId, `crypto_${nowPaymentId}`);
    
    if (result.success) {
      // Update payment status to finished
      await this.updateCryptoPaymentStatus(nowPaymentId, 'finished');
      
      // Record revenue for accounting
      const priceUsd = Number(payment.priceAmount) || 0;
      await this.recordRevenueFromPurchase(payment.id, 0, priceUsd, 'crypto');
    }

    return result;
  }

  // Team Members & Revenue
  async getTeamMembers(activeOnly = false): Promise<TeamMember[]> {
    if (activeOnly) {
      return await db.select().from(teamMembers).where(eq(teamMembers.isActive, true));
    }
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [created] = await db.insert(teamMembers).values(member).returning();
    return created;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  async createRevenueShare(share: InsertRevenueShare): Promise<RevenueShare> {
    const [created] = await db.insert(revenueShares).values(share).returning();
    return created;
  }

  async getRevenueSummary(): Promise<RevenueSummary> {
    // Get all revenue shares
    const shares = await db.select().from(revenueShares);
    
    // Get team members
    const members = await this.getTeamMembers(true);
    
    // Calculate totals
    let totalSalesStars = 0;
    let totalSalesUsd = 0;
    let developmentStars = 0;
    let developmentUsd = 0;
    let advertisingStars = 0;
    let advertisingUsd = 0;
    let starsSalesCount = 0;
    let cryptoSalesCount = 0;
    
    const memberTotals: Record<string, { stars: number; usd: number }> = {};
    
    for (const share of shares) {
      totalSalesStars += share.totalStars;
      totalSalesUsd += Number(share.totalUsd);
      developmentStars += share.developmentStars;
      developmentUsd += Number(share.developmentUsd);
      advertisingStars += share.advertisingStars;
      advertisingUsd += Number(share.advertisingUsd);
      
      if (share.paymentType === 'stars') {
        starsSalesCount++;
      } else {
        cryptoSalesCount++;
      }
      
      // Parse team shares JSON
      const teamSharesJson = share.teamSharesJson as Record<string, { stars: number; usd: number }>;
      for (const [memberId, amounts] of Object.entries(teamSharesJson)) {
        if (!memberTotals[memberId]) {
          memberTotals[memberId] = { stars: 0, usd: 0 };
        }
        memberTotals[memberId].stars += amounts.stars || 0;
        memberTotals[memberId].usd += amounts.usd || 0;
      }
    }
    
    // Build team shares array
    const teamShares = members.map(m => ({
      memberId: m.id,
      name: m.name,
      stars: memberTotals[m.id]?.stars || 0,
      usd: memberTotals[m.id]?.usd || 0,
    }));
    
    return {
      totalSalesStars,
      totalSalesUsd,
      developmentStars,
      developmentUsd,
      advertisingStars,
      advertisingUsd,
      teamShares,
      salesCount: shares.length,
      starsSalesCount,
      cryptoSalesCount,
    };
  }

  async recordRevenueFromPurchase(
    purchaseId: string, 
    priceStars: number, 
    priceUsd: number, 
    paymentType: 'stars' | 'crypto'
  ): Promise<void> {
    // Fixed revenue distribution: 10% development, 15% advertising
    // Remaining 75% split among active team members based on their sharePercent
    const devPercent = 0.10;
    const adPercent = 0.15;
    const teamPoolPercent = 0.75; // Total pool for team members
    
    const developmentStars = Math.floor(priceStars * devPercent);
    const developmentUsd = (priceUsd * devPercent).toFixed(2);
    const advertisingStars = Math.floor(priceStars * adPercent);
    const advertisingUsd = (priceUsd * adPercent).toFixed(2);
    
    // Get active team members and calculate their share of the team pool
    const members = await this.getTeamMembers(true);
    const teamSharesJson: Record<string, { stars: number; usd: number }> = {};
    
    // Edge case: if no active members, skip team distribution (revenue goes unallocated)
    // This should not happen due to API validation preventing deactivation of all members
    if (members.length === 0) {
      console.warn("No active team members for revenue distribution - 75% team pool unallocated");
    }
    
    // Calculate total share percent of active members to normalize distribution
    const totalMemberSharePercent = members.reduce((sum, m) => sum + m.sharePercent, 0);
    
    for (const member of members) {
      // Each member gets their proportional share of the 75% team pool
      // If total member shares = 75% (5 members at 15% each), they each get their full share
      // If fewer/more members, proportionally adjust
      const memberPoolShare = totalMemberSharePercent > 0 
        ? (member.sharePercent / totalMemberSharePercent) * teamPoolPercent
        : 0;
      
      const memberStars = Math.floor(priceStars * memberPoolShare);
      const memberUsd = priceUsd * memberPoolShare;
      teamSharesJson[member.id] = { stars: memberStars, usd: memberUsd };
      
      // Update team member totals
      await db
        .update(teamMembers)
        .set({
          totalEarnedStars: sql`${teamMembers.totalEarnedStars} + ${memberStars}`,
          totalEarnedUsd: sql`CAST(${teamMembers.totalEarnedUsd} AS NUMERIC) + ${memberUsd}`,
        })
        .where(eq(teamMembers.id, member.id));
    }
    
    // Create revenue share record
    await this.createRevenueShare({
      purchaseId: paymentType === 'stars' ? purchaseId : null,
      cryptoPaymentId: paymentType === 'crypto' ? purchaseId : null,
      paymentType,
      totalStars: priceStars,
      totalUsd: priceUsd.toFixed(2),
      developmentStars,
      developmentUsd,
      advertisingStars,
      advertisingUsd,
      teamSharesJson,
    });
  }

  // Leagues
  async getLeagues(): Promise<League[]> {
    return await db
      .select()
      .from(leagues)
      .where(eq(leagues.isActive, true))
      .orderBy(leagues.sortOrder);
  }

  async getAllLeagues(): Promise<League[]> {
    return await db
      .select()
      .from(leagues)
      .orderBy(leagues.sortOrder);
  }

  async getLeague(slug: string): Promise<League | undefined> {
    const [league] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.slug, slug));
    return league || undefined;
  }

  async getLeagueById(id: string): Promise<League | undefined> {
    const [league] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, id));
    return league || undefined;
  }

  async updateLeague(id: string, data: Partial<InsertLeague>): Promise<League | undefined> {
    const [updated] = await db
      .update(leagues)
      .set(data)
      .where(eq(leagues.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserRank(userId: string): Promise<number> {
    // Only count registered users (with telegramId) and points > 0 for ranking
    const result = await db.execute(sql`
      SELECT rank FROM (
        SELECT id, RANK() OVER (ORDER BY total_points DESC) as rank
        FROM users
        WHERE deleted_at IS NULL AND telegram_id IS NOT NULL AND total_points > 0
      ) ranked
      WHERE id = ${userId}
    `);
    
    if (result.rows.length === 0) return 0;
    return Number(result.rows[0].rank) || 0;
  }

  async getUserLeague(userId: string): Promise<{ league: League; rank: number } | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Guests don't participate in leagues
    if (!user.telegramId) {
      return undefined;
    }

    const rank = await this.getUserRank(userId);
    const allLeagues = await this.getLeagues();
    
    // Find the highest league the user qualifies for
    // Sort by sortOrder descending to check highest leagues first
    const sortedLeagues = [...allLeagues].sort((a, b) => b.sortOrder - a.sortOrder);
    
    for (const league of sortedLeagues) {
      // User must have minimum beads
      if (user.totalPoints < league.minBeads) continue;
      
      // If league has max rank requirement, user must be within that rank
      if (league.maxRank !== null && rank > league.maxRank) continue;
      
      return { league, rank };
    }
    
    // Default to bronze (first league by sort order)
    const bronzeLeague = allLeagues.find(l => l.slug === 'bronze') || allLeagues[0];
    if (bronzeLeague) {
      return { league: bronzeLeague, rank };
    }
    
    return undefined;
  }

  async getLeagueLeaderboard(leagueSlug: string, limit: number = 100, period: 'all' | 'week' | 'today' = 'all'): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    totalPoints: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>> {
    const league = await this.getLeague(leagueSlug);
    if (!league) return [];
    
    if (period === 'all') {
      // Use total_points from users table for all-time
      const result = await db.execute(sql`
        WITH ranked_users AS (
          SELECT 
            u.id,
            u.total_points,
            u.photo_url,
            RANK() OVER (ORDER BY u.total_points DESC) as rank,
            c.name as character_name,
            c.gender as character_gender,
            (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
          FROM users u
          LEFT JOIN characters c ON c.user_id = u.id
          WHERE u.deleted_at IS NULL AND u.telegram_id IS NOT NULL AND u.total_points > 0
        )
        SELECT * FROM ranked_users
        WHERE total_points >= ${league.minBeads}
        ${league.maxRank ? sql`AND rank <= ${league.maxRank}` : sql``}
        ORDER BY rank ASC
        LIMIT ${limit}
      `);
      
      return result.rows.map((row: any) => ({
        rank: Number(row.rank),
        odoserId: row.id,
        name: row.character_name || 'Игрок',
        totalPoints: Number(row.total_points),
        photoUrl: row.photo_url,
        characterType: row.character_gender || null,
        characterImageUrl: row.character_image_url || null,
      }));
    } else {
      // Sum scores from game_scores table for week/today
      // Note: game_scores uses "user_id" column for od_user_id field
      const dateCondition = period === 'today' 
        ? sql`gs.created_at >= CURRENT_DATE`
        : sql`gs.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        
      const result = await db.execute(sql`
        WITH period_scores AS (
          SELECT 
            u.id,
            COALESCE(SUM(gs.score), 0) as period_points,
            u.total_points,
            u.photo_url,
            c.name as character_name,
            c.gender as character_gender,
            (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
          FROM users u
          LEFT JOIN game_scores gs ON gs.user_id = u.id AND ${dateCondition}
          LEFT JOIN characters c ON c.user_id = u.id
          WHERE u.deleted_at IS NULL AND u.telegram_id IS NOT NULL
          GROUP BY u.id, u.total_points, u.photo_url, c.name, c.gender
        ),
        ranked_users AS (
          SELECT 
            *,
            RANK() OVER (ORDER BY total_points DESC) as global_rank,
            RANK() OVER (ORDER BY period_points DESC) as period_rank
          FROM period_scores
        )
        SELECT * FROM ranked_users
        WHERE total_points >= ${league.minBeads}
        ${league.maxRank ? sql`AND global_rank <= ${league.maxRank}` : sql``}
        AND period_points > 0
        ORDER BY period_rank ASC
        LIMIT ${limit}
      `);
      
      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        odoserId: row.id,
        name: row.character_name || 'Игрок',
        totalPoints: Number(row.period_points),
        photoUrl: row.photo_url,
        characterType: row.character_gender || null,
        characterImageUrl: row.character_image_url || null,
      }));
    }
  }
  
  async getFriendsLeaderboard(userId: string, leagueSlug: string, limit: number = 100): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    totalPoints: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>> {
    // Get user and league info
    const user = await this.getUser(userId);
    if (!user) return [];
    
    const league = await this.getLeague(leagueSlug);
    if (!league) return [];
    
    // Find friends: users who share the same referrer (referred_by) OR users referred by this user
    // Filter by league eligibility (minBeads and optionally maxRank)
    const result = await db.execute(sql`
      WITH user_info AS (
        SELECT referred_by, referral_code FROM users WHERE id = ${userId}
      ),
      all_ranked AS (
        SELECT 
          u.id,
          u.total_points,
          RANK() OVER (ORDER BY u.total_points DESC) as global_rank
        FROM users u
        WHERE u.deleted_at IS NULL AND u.telegram_id IS NOT NULL AND u.total_points > 0
      ),
      friends AS (
        SELECT u.id
        FROM users u, user_info ui
        WHERE u.deleted_at IS NULL 
          AND u.telegram_id IS NOT NULL
          AND u.id != ${userId}
          AND (
            -- Same referrer (siblings) - they share the same referred_by code
            (ui.referred_by IS NOT NULL AND u.referred_by = ui.referred_by)
            -- Or referred by current user (their referred_by equals my referral_code)
            OR (ui.referral_code IS NOT NULL AND u.referred_by = ui.referral_code)
            -- Or current user's referrer (my referred_by equals their referral_code)
            OR (ui.referred_by IS NOT NULL AND u.referral_code = ui.referred_by)
          )
      ),
      ranked_friends AS (
        SELECT 
          u.id,
          u.total_points,
          u.photo_url,
          c.name as character_name,
          c.gender as character_gender,
          (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url,
          ar.global_rank,
          RANK() OVER (ORDER BY u.total_points DESC) as rank
        FROM users u
        INNER JOIN friends f ON f.id = u.id
        INNER JOIN all_ranked ar ON ar.id = u.id
        LEFT JOIN characters c ON c.user_id = u.id
        WHERE u.total_points >= ${league.minBeads}
        ${league.maxRank ? sql`AND ar.global_rank <= ${league.maxRank}` : sql``}
      )
      SELECT * FROM ranked_friends
      ORDER BY rank ASC
      LIMIT ${limit}
    `);
    
    return result.rows.map((row: any) => ({
      rank: Number(row.rank),
      odoserId: row.id,
      name: row.character_name || 'Игрок',
      totalPoints: Number(row.total_points),
      photoUrl: row.photo_url,
      characterType: row.character_gender || null,
      characterImageUrl: row.character_image_url || null,
    }));
  }

  async getLeaguePlayerCount(leagueSlug: string): Promise<number> {
    const league = await this.getLeague(leagueSlug);
    if (!league) return 0;
    
    const result = await db.execute(sql`
      WITH ranked_users AS (
        SELECT 
          u.id,
          u.total_points,
          RANK() OVER (ORDER BY u.total_points DESC) as rank
        FROM users u
        WHERE u.deleted_at IS NULL AND u.telegram_id IS NOT NULL AND u.total_points > 0
      )
      SELECT COUNT(*) as count FROM ranked_users
      WHERE total_points >= ${league.minBeads}
      ${league.maxRank ? sql`AND rank <= ${league.maxRank}` : sql``}
    `);
    
    return Number(result.rows[0]?.count) || 0;
  }

  async getUsersWithoutCharacters(): Promise<Array<{ id: string; telegramId: string; firstName: string | null; username: string }>> {
    const result = await db.execute(sql`
      SELECT u.id, u.telegram_id, u.first_name, u.username
      FROM users u
      LEFT JOIN characters c ON c.user_id = u.id
      WHERE u.telegram_id IS NOT NULL 
        AND u.deleted_at IS NULL
        AND (
          c.id IS NULL 
          OR c.name IS NULL 
          OR c.name = '' 
          OR c.gender IS NULL
        )
    `);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      telegramId: row.telegram_id,
      firstName: row.first_name,
      username: row.username,
    }));
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    const result = await db.delete(beadsTransactions)
      .where(eq(beadsTransactions.id, transactionId))
      .returning({ id: beadsTransactions.id });
    
    return result.length > 0;
  }

  async resetUserLevels(userId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, error: 'Пользователь не найден' };
    }

    await db.update(users)
      .set({ completedLevels: [] })
      .where(eq(users.id, userId));

    return { success: true };
  }

  // Withdrawal Request methods
  async createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .insert(withdrawalRequests)
      .values(request)
      .returning();
    return withdrawal;
  }

  async getWithdrawalRequests(status?: string): Promise<Array<WithdrawalRequest & { username?: string }>> {
    const result = await db.execute(sql`
      SELECT w.*, u.username
      FROM withdrawal_requests w
      LEFT JOIN users u ON u.id = w.user_id
      ${status ? sql`WHERE w.status = ${status}` : sql``}
      ORDER BY w.created_at DESC
    `);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      cryptoType: row.crypto_type,
      network: row.network,
      amount: row.amount,
      walletAddress: row.wallet_address,
      networkFee: row.network_fee,
      status: row.status,
      adminNote: row.admin_note,
      txHash: row.tx_hash,
      processedAt: row.processed_at,
      processedBy: row.processed_by,
      createdAt: row.created_at,
      username: row.username,
    }));
  }

  async getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt));
  }

  async updateWithdrawalRequest(id: string, updates: { status?: string; adminNote?: string; txHash?: string; processedBy?: string; processedAt?: Date }): Promise<WithdrawalRequest | undefined> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.adminNote !== undefined) updateData.adminNote = updates.adminNote;
    if (updates.txHash !== undefined) updateData.txHash = updates.txHash;
    if (updates.processedBy !== undefined) updateData.processedBy = updates.processedBy;
    if (updates.processedAt !== undefined) updateData.processedAt = updates.processedAt;
    
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set(updateData)
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return withdrawal;
  }

  async getWithdrawalConfig(): Promise<WithdrawalConfig> {
    const config = await this.getGameConfig('withdrawal_config');
    if (config?.value) {
      return config.value as WithdrawalConfig;
    }
    
    // Default config
    return {
      btc: { minAmount: 0.0001, networkFee: 0.00005, enabled: true },
      eth: { minAmount: 0.005, networkFee: 0.001, enabled: true },
      usdt: {
        bep20: { minAmount: 2, networkFee: 0.15, enabled: true },
        trc20: { minAmount: 2, networkFee: 1, enabled: true },
        erc20: { minAmount: 10, networkFee: 5, enabled: false },
        ton: { minAmount: 2, networkFee: 0.1, enabled: true },
      },
    };
  }

  async updateWithdrawalConfig(config: Partial<WithdrawalConfig>): Promise<WithdrawalConfig> {
    const current = await this.getWithdrawalConfig();
    
    // Deep merge for nested objects
    const newConfig: WithdrawalConfig = {
      btc: config.btc ? { ...current.btc, ...config.btc } : current.btc,
      eth: config.eth ? { ...current.eth, ...config.eth } : current.eth,
      usdt: config.usdt ? {
        bep20: config.usdt.bep20 ? { ...current.usdt.bep20, ...config.usdt.bep20 } : current.usdt.bep20,
        trc20: config.usdt.trc20 ? { ...current.usdt.trc20, ...config.usdt.trc20 } : current.usdt.trc20,
        erc20: config.usdt.erc20 ? { ...current.usdt.erc20, ...config.usdt.erc20 } : current.usdt.erc20,
        ton: config.usdt.ton ? { ...current.usdt.ton, ...config.usdt.ton } : current.usdt.ton,
      } : current.usdt,
    };
    
    await this.setGameConfig({
      key: 'withdrawal_config',
      value: newConfig,
      description: 'Crypto withdrawal configuration',
    });
    
    return newConfig;
  }
}

export const storage = new DatabaseStorage();
