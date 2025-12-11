import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real, bigint, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  telegramId: varchar("telegram_id", { length: 255 }).unique(),
  username: text("username").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  photoUrl: text("photo_url"),
  totalPoints: integer("total_points").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  btcBalance: real("btc_balance").default(0).notNull(),
  ethBalance: real("eth_balance").default(0).notNull(),
  usdtBalance: real("usdt_balance").default(0).notNull(),
  btcBalanceSats: bigint("btc_balance_sats", { mode: "number" }).default(0).notNull(),
  btcTodaySats: bigint("btc_today_sats", { mode: "number" }).default(0).notNull(),
  btcTodayDate: date("btc_today_date"),
  ethBalanceWei: bigint("eth_balance_wei", { mode: "number" }).default(0).notNull(),
  ethTodayWei: bigint("eth_today_wei", { mode: "number" }).default(0).notNull(),
  ethTodayDate: date("eth_today_date"),
  usdtToday: numeric("usdt_today", { precision: 18, scale: 8 }).default("0").notNull(),
  usdtTodayDate: date("usdt_today_date"),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by", { length: 255 }),
  directReferralsCount: integer("direct_referrals_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  gameScores: many(gameScores),
}));

export const gameScores = pgTable("game_scores", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  odUserId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  score: integer("score").notNull(),
  cryptoBtc: integer("crypto_btc").default(0).notNull(),
  cryptoEth: integer("crypto_eth").default(0).notNull(),
  cryptoUsdt: integer("crypto_usdt").default(0).notNull(),
  maxCombo: integer("max_combo").default(0).notNull(),
  accuracy: integer("accuracy").default(0).notNull(),
  duration: integer("duration").notNull(),
  won: boolean("won").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  user: one(users, {
    fields: [gameScores.odUserId],
    references: [users.id],
  }),
}));

export const gameConfig = pgTable("game_config", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const prizePool = pgTable("prize_pool", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usdtFundSettings = pgTable("usdt_fund_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  usdtTotalFund: real("usdt_total_fund").default(50).notNull(),
  usdtAvailable: real("usdt_available").default(50).notNull(),
  usdtDailyLimit: real("usdt_daily_limit").default(1.0).notNull(),
  usdtPerDrop: real("usdt_per_drop").default(0.02).notNull(),
  usdtMaxPerUserPerDay: real("usdt_max_per_user_per_day").default(0.1).notNull(),
  usdtDistributedToday: real("usdt_distributed_today").default(0).notNull(),
  lastResetDate: timestamp("last_reset_date").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const realRewards = pgTable("real_rewards", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  cryptoType: varchar("crypto_type", { length: 10 }).notNull(),
  amount: real("amount").notNull(),
  gameScoreId: varchar("game_score_id", { length: 255 }).references(() => gameScores.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const realRewardsRelations = relations(realRewards, ({ one }) => ({
  user: one(users, {
    fields: [realRewards.userId],
    references: [users.id],
  }),
  gameScore: one(gameScores, {
    fields: [realRewards.gameScoreId],
    references: [gameScores.id],
  }),
}));

export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  refUserId: varchar("ref_user_id", { length: 255 }).notNull().references(() => users.id),
  level: integer("level").notNull(),
  beadsAmount: integer("beads_amount").notNull(),
  gameScoreId: varchar("game_score_id", { length: 255 }).references(() => gameScores.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  user: one(users, {
    fields: [referralRewards.userId],
    references: [users.id],
  }),
  refUser: one(users, {
    fields: [referralRewards.refUserId],
    references: [users.id],
  }),
  gameScore: one(gameScores, {
    fields: [referralRewards.gameScoreId],
    references: [gameScores.id],
  }),
}));

export const beadsTransactions = pgTable("beads_transactions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  houseBalanceBefore: integer("house_balance_before"),
  houseBalanceAfter: integer("house_balance_after"),
  description: text("description"),
  gameScoreId: varchar("game_score_id", { length: 255 }).references(() => gameScores.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const beadsTransactionsRelations = relations(beadsTransactions, ({ one }) => ({
  user: one(users, {
    fields: [beadsTransactions.userId],
    references: [users.id],
  }),
  gameScore: one(gameScores, {
    fields: [beadsTransactions.gameScoreId],
    references: [gameScores.id],
  }),
}));

export const insertBeadsTransactionSchema = createInsertSchema(beadsTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPoints: true,
  gamesPlayed: true,
  bestScore: true,
  isAdmin: true,
  createdAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  createdAt: true,
});

export const insertGameConfigSchema = createInsertSchema(gameConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertPrizePoolSchema = createInsertSchema(prizePool).omit({
  id: true,
  createdAt: true,
});

export const insertUsdtFundSettingsSchema = createInsertSchema(usdtFundSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertRealRewardSchema = createInsertSchema(realRewards).omit({
  id: true,
  createdAt: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameConfig = z.infer<typeof insertGameConfigSchema>;
export type GameConfig = typeof gameConfig.$inferSelect;
export type InsertPrizePool = z.infer<typeof insertPrizePoolSchema>;
export type PrizePool = typeof prizePool.$inferSelect;
export type InsertUsdtFundSettings = z.infer<typeof insertUsdtFundSettingsSchema>;
export type UsdtFundSettings = typeof usdtFundSettings.$inferSelect;
export type InsertRealReward = z.infer<typeof insertRealRewardSchema>;
export type RealReward = typeof realRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertBeadsTransaction = z.infer<typeof insertBeadsTransactionSchema>;
export type BeadsTransaction = typeof beadsTransactions.$inferSelect;

export type TransactionType = 
  | 'game_win_reward'
  | 'buy_extra_life'
  | 'referral_reward'
  | 'admin_adjustment'
  | 'house_deposit'
  | 'house_withdrawal';

export interface HouseAccountConfig {
  balance: number;
  salesIncome: number;
  totalDistributed: number;
  lastUpdated: string;
}

export interface LivesConfig {
  livesPerGame: number;
  extraLifeCost: number;
  extraLifeSeconds: number;
  maxExtraLives: number;
}

export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'magenta' | 'amber' | 'lime' | 'violet';
export type CryptoType = 'btc' | 'eth' | 'usdt';

export interface Ball {
  id: string;
  x: number;
  y: number;
  color: BallColor;
  crypto?: CryptoType;
  isUsdtFund?: boolean;
  radius: number;
  pathProgress: number;
}

export interface GameState {
  balls: Ball[];
  shooterBall: Ball | null;
  nextBall: Ball | null;
  score: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  cryptoCollected: {
    btc: number;
    eth: number;
    usdt: number;
  };
  usdtFundCollected: number;
  isPlaying: boolean;
  isGameOver: boolean;
  won: boolean;
  shotsTotal: number;
  shotsHit: number;
  lives: number;
  extraLivesBought: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  photoUrl: string | null;
  totalPoints: number;
  gamesPlayed: number;
  bestScore: number;
}

export interface AdminCryptoBalances {
  btc: number;
  eth: number;
  usdt: number;
}

export interface UserUpdate {
  username?: string;
  totalPoints?: number;
  gamesPlayed?: number;
  bestScore?: number;
  isAdmin?: boolean;
  btcBalance?: number;
  ethBalance?: number;
  usdtBalance?: number;
  referredBy?: string | null;
  directReferralsCount?: number;
}

export interface UsdtFundStats {
  settings: UsdtFundSettings;
  totalDistributed: number;
  distributedToday: number;
}

export interface RewardResult {
  usdtAwarded: number;
  rewardId?: string;
}

export interface GameEconomyConfig {
  points: {
    normal: number;
    btc: number;
    eth: number;
    usdt: number;
  };
  combo: {
    multiplier: number;
    maxChain: number;
  };
  crypto: {
    spawnChance: number;
  };
  cryptoRewards: {
    btcPerBall: number;
    ethPerBall: number;
    usdtPerBall: number;
  };
  dailyLimits: {
    btcMaxSatsPerDay: number;
    ethMaxWeiPerDay: number;
    usdtMaxPerDay: number;
  };
  pools: {
    btcBalanceSats: number;
    ethBalanceWei: number;
    usdtBalance: number;
  };
  perGameLimits: {
    btcMaxBeadsPerGame: number;
    ethMaxBeadsPerGame: number;
    usdtMaxBeadsPerGame: number;
  };
}

export interface CryptoAvailability {
  btcEnabled: boolean;
  ethEnabled: boolean;
  usdtEnabled: boolean;
  btcRemainingToday: number;
  ethRemainingToday: number;
  usdtRemainingToday: number;
  btcMaxBeadsPerGame: number;
  ethMaxBeadsPerGame: number;
  usdtMaxBeadsPerGame: number;
}

export interface ReferralConfig {
  maxDirectReferralsPerUser: number;
  level1RewardPercent: number;
  level2RewardPercent: number;
  maxReferralBeadsPerRefPerDay: number;
  maxReferralBeadsPerUserPerDay: number;
  title: string;
  description: string;
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  directReferralsCount: number;
  level2ReferralsCount: number;
  totalEarnedBeads: number;
  referralsTotalBeads: number;
  lastRewardId?: string;
}

export interface ReferralUserStats {
  userId: string;
  username: string;
  referralCode: string | null;
  referredBy: string | null;
  referredByUsername: string | null;
  level1ReferralsCount: number;
  level2ReferralsCount: number;
  totalReferralBeads: number;
}

export interface GameplayConfig {
  balls: {
    initialCount: number;
    targetCount: number;
    maxTotalBalls: number;
  };
  spawn: {
    period: number;
    resumeThreshold: number;
  };
  speed: {
    base: number;
    max: number;
    accelerationStart: number;
  };
  colors: {
    count: number;
  };
}
