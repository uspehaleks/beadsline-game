// Main schema export file - re-exports all schemas from individual modules
export * from './schemas/user';
export * from './schemas/game';
export * from './schemas/economy';
export * from './schemas/levelConfig';
export * from './schemas/rewards';
export * from './schemas/character';
export * from './schemas/boosts';
export * from './schemas/transactions';

// Import other schemas that may not fit in the above categories
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real, bigint, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// System logs table (may not fit in other categories)
export const systemLogs = pgTable("system_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  data: jsonb("data"),
});

// Define types that are not automatically exported by drizzle-zod
export type User = typeof import('./schemas/user').users.$inferSelect;
export type InsertUser = typeof import('./schemas/user').insertUserSchema._output;

export type GameScore = typeof import('./schemas/game').gameScores.$inferSelect;
export type InsertGameScore = typeof import('./schemas/game').insertGameScoreSchema._output;

export type GameConfig = typeof import('./schemas/game').gameConfig.$inferSelect;
export type InsertGameConfig = typeof import('./schemas/game').insertGameConfigSchema._output;

export type PrizePool = typeof import('./schemas/economy').prizePool.$inferSelect;
export type InsertPrizePool = typeof import('./schemas/economy').insertPrizePoolSchema._output;

export type UsdtFundSettings = typeof import('./schemas/economy').usdtFundSettings.$inferSelect;
export type InsertUsdtFundSettings = typeof import('./schemas/economy').insertUsdtFundSettingsSchema._output;

export type RealReward = typeof import('./schemas/economy').realRewards.$inferSelect;
export type InsertRealReward = typeof import('./schemas/economy').insertRealRewardSchema._output;

export type ReferralReward = typeof import('./schemas/rewards').referralRewards.$inferSelect;
export type InsertReferralReward = typeof import('./schemas/rewards').insertReferralRewardSchema._output;

export type Season = typeof import('./schemas/rewards').seasons.$inferSelect;
export type InsertSeason = typeof import('./schemas/rewards').insertSeasonSchema._output;

export type SeasonResult = typeof import('./schemas/rewards').seasonResults.$inferSelect;
export type InsertSeasonResult = typeof import('./schemas/rewards').insertSeasonResultSchema._output;

// Level Config types
export type LevelConfigDB = typeof import('./schemas/levelConfig').levelConfigs.$inferSelect;
export type InsertLevelConfig = typeof import('./schemas/levelConfig').insertLevelConfigSchema._output;

// Additional types that may be needed
export type BeadsTransaction = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  gameScoreId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
  deleteReason: string | null;
};

export type InsertBeadsTransaction = Omit<BeadsTransaction, 'id' | 'createdAt' | 'deletedAt' | 'deletedBy' | 'deleteReason'>;

export type TransactionType = string;

export type GameplayConfig = z.infer<typeof import('./schemas/game').gameplayConfigSchema>;
export type GameEconomyConfig = z.infer<typeof import('./schemas/game').gameEconomyConfigSchema>;
export type LivesConfig = z.infer<typeof import('./schemas/game').livesConfigSchema>;
export type HouseAccountConfig = z.infer<typeof import('./schemas/economy').houseAccountConfigSchema>;
export type ReferralConfig = z.infer<typeof import('./schemas/rewards').referralConfigSchema>;

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  photoUrl: string | null;
  totalPoints: number;
  ratingScore: number;
  gamesPlayed: number;
  bestScore: number;
  characterName: string | null;
  characterImageUrl: string | null;
};

export type AdminCryptoBalances = {
  totalBtcSats: number;
  totalEthWei: number;
  totalUsdt: number;
  availableBtcSats: number;
  availableEthWei: number;
  availableUsdt: number;
};

export type UserUpdate = Partial<User>;

export type UsdtFundStats = {
  totalFund: number;
  available: number;
  dailyLimit: number;
  perDrop: number;
  maxPerUserPerDay: number;
  distributedToday: number;
  dailyTotalDistributed: number;
};

export type RewardResult = {
  success: boolean;
  amount: number;
  newBalance: number;
  error?: string;
};

export type ReferralInfo = {
  referralLink: string;
  referralCode: string;
  directReferralsCount: number;
  level2ReferralsCount: number;
  totalEarnedBeads: number;
  referralsTotalBeads: number;
  lastRewardId?: string;
};

export type ReferralUserStats = {
  directReferrals: number;
  level2Referrals: number;
  totalEarnedBeads: number;
  referralsTotalBeads: number;
};

export type BeadsBoxReward = {
  type: 'beads' | 'boost' | 'skin' | 'life';
  amount?: number;
  boostId?: string;
  boostType?: string;
  quantity?: number;
  skinId?: string;
};

export type BeadsBoxConfig = {
  enabled: boolean;
  costPerBox: number;
  boxesPerDay: number;
  rewards: Array<{
    type: 'beads' | 'boost' | 'skin' | 'life';
    min?: number;
    max?: number;
    boostType?: string;
    skinId?: string;
    quantity?: number;
    probability: number;
  }>;
};

export type BeadsBoxSession = {
  id: string;
  userId: string;
  date: string;
  boxes: BeadsBoxReward[];
  openedBoxes: number[];
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBeadsBoxSession = Omit<BeadsBoxSession, 'id' | 'createdAt' | 'updatedAt'>;

export type CryptoGameTicket = {
  id: string;
  userId: string;
  sessionId: string;
  used: boolean;
  usedAt: Date | null;
  gameScoreId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCryptoGameTicket = Omit<CryptoGameTicket, 'id' | 'createdAt' | 'updatedAt'>;

export type WithdrawalConfig = {
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  feePercent: number;
  enabled: boolean;
};

export type WithdrawalRequest = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  status: string;
  adminNote?: string;
  txHash?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertWithdrawalRequest = Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>;

export type RevenueSummary = {
  totalRevenue: number;
  teamRevenue: Array<{
    id: string;
    name: string;
    sharePercent: number;
    revenue: number;
  }>;
  totalTeamShare: number;
};

// Define additional types that might be needed for game entities
export type Ball = {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  onPath: boolean;
  pathProgress: number;
  velocity: { x: number; y: number };
  isCrypto: boolean;
  crypto?: 'btc' | 'eth' | 'usdt';
  isUsdtFund: boolean;
  isSpecial?: boolean;
  speedMultiplier?: number;
  effects?: any[];
};

export type GameState = {
  id: string;
  balls: Ball[];
  score: number;
  combo: number;
  cryptoCollected: { btc: number; eth: number; usdt: number };
  usdtFundCollected: number;
  lives: number;
  gameOver: boolean;
  levelId: number;
  chainSpeed: number;
  aiming: boolean;
  shooter: { x: number; y: number; angle: number };
  aimAngle: number;
  lastUpdateTime: number;
  levelConfig: {
    path: Array<{ x: number; y: number; progress: number }>;
    targetScore: number;
    cryptoSpawnChance?: number;
  };
  username: string;
  totalPoints: number;
  lastShotTime: number;
  lastSpawnTime: number;
  chainProgress: number;
  chainLength: number;
  maxChainLength: number;
  nextBallColor: BallColor;
  queuedBalls: Ball[];
  activeEffects: any[];
  powerups: any[];
  achievements: any[];
  gameStartTime: number;
  paused: boolean;
  boostState: any;
  stats: {
    ballsShot: number;
    ballsMatched: number;
    highestCombo: number;
    accuracy: number;
    timePlayed: number;
    cryptoCollected: { btc: number; eth: number; usdt: number };
    totalDistance: number;
    shotsAccuracy: number;
  };
};

export type PathPoint = {
  x: number;
  y: number;
  progress: number;
};

export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan' | 'magenta' | 'amber' | 'lime' | 'violet';

export type CryptoType = 'btc' | 'eth' | 'usdt';

export type Boost = {
  id: string;
  type: string;
  nameEn: string;
  nameRu: string;
  descriptionEn: string;
  descriptionRu: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBoost = Omit<Boost, 'id' | 'createdAt' | 'updatedAt'>;

export type UserBoostInventory = {
  id: string;
  userId: string;
  boostId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUserBoostInventory = Omit<UserBoostInventory, 'id' | 'createdAt' | 'updatedAt'>;

export type Character = {
  id: string;
  userId: string;
  name: string;
  gender: 'male' | 'female';
  level: number;
  energy: number;
  health: number;
  mood: 'happy' | 'neutral' | 'sad';
  healthState: 'normal' | 'tired' | 'sick';
  hunger: number;
  thirst: number;
  fatigue: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalPoints: number;
  bestScore: number;
  completedTasks: number;
  bonusLives: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCharacter = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;

export type CharacterWithAccessories = Character & {
  equippedAccessories: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    isActive: boolean;
    sortOrder: number;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    isEquipped: boolean;
  }>;
};

export type AccessoryCategory = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertAccessoryCategory = Omit<AccessoryCategory, 'id' | 'createdAt' | 'updatedAt'>;

export type BaseBody = {
  id: string;
  gender: 'male' | 'female';
  imageUrl: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBaseBody = Omit<BaseBody, 'id' | 'createdAt' | 'updatedAt'>;

export type Accessory = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string;
  gender: 'male' | 'female' | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertAccessory = Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'>;

export type UserAccessory = {
  id: string;
  userId: string;
  accessoryId: string;
  isEquipped: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUserAccessory = Omit<UserAccessory, 'id' | 'createdAt' | 'updatedAt'>;

export type GameSkin = {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertGameSkin = Omit<GameSkin, 'id' | 'createdAt' | 'updatedAt'>;

export type UserSkin = {
  id: string;
  userId: string;
  skinId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUserSkin = Omit<UserSkin, 'id' | 'createdAt' | 'updatedAt'>;

export type BoostPackage = {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  priceStars: number;
  priceUsd?: string;
  boostsPerType: number;
  bonusLives: number;
  badge?: string;
  badgeText?: string;
  isActive: boolean;
  sortOrder: number;
  originalPriceStars?: number;
  bonusSkinId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBoostPackage = Omit<BoostPackage, 'id' | 'createdAt' | 'updatedAt'>;

export type BoostPackagePurchase = {
  id: string;
  userId: string;
  packageId: string;
  telegramPaymentId?: string;
  priceStars: number;
  boostsPerType: number;
  bonusLives: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBoostPackagePurchase = Omit<BoostPackagePurchase, 'id' | 'createdAt' | 'updatedAt'>;

export type CryptoPayment = {
  id: string;
  userId: string;
  packageId: string;
  network: string;
  priceUsd: number;
  status: string;
  adminNote?: string;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCryptoPayment = Omit<CryptoPayment, 'id' | 'createdAt' | 'updatedAt'>;

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  sharePercent: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTeamMember = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>;

export type RevenueShare = {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertRevenueShare = Omit<RevenueShare, 'id' | 'createdAt' | 'updatedAt'>;

export type League = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  minBeads: number;
  maxRank: number | null;
  themeColor: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertLeague = Omit<League, 'id' | 'createdAt' | 'updatedAt'>;