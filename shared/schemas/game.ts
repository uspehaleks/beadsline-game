import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";

export const gameScores = pgTable("game_scores", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  odUserId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  levelId: integer("level_id").default(1).notNull(),
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

export const insertGameScoreSchema = createInsertSchema(gameScores).extend({
  score: z.number().min(0, "Score must be positive"),
  duration: z.number().min(0, "Duration must be positive"),
});

export const insertGameConfigSchema = createInsertSchema(gameConfig).omit({
  id: true,
  updatedAt: true,
});

export const gameplayConfigSchema = z.object({
  levelUpThreshold: z.number().min(0),
  comboMultiplier: z.number().min(0),
  baseScoreMultiplier: z.number().min(0),
  energyDrainRate: z.number().min(0),
  balls: z.object({
    initialCount: z.number().min(0),
    targetCount: z.number().min(0),
    maxTotalBalls: z.number().min(0),
  }),
  spawn: z.object({
    period: z.number().min(0),
    resumeThreshold: z.number().min(0),
  }),
  speed: z.object({
    base: z.number().min(0),
    max: z.number().min(0),
    accelerationStart: z.number().min(0),
  }),
  colors: z.object({
    count: z.number().min(0),
    activeColors: z.array(z.string()).optional(),
  }),
});

export const gameEconomyConfigSchema = z.object({
  baseBtcReward: z.number().min(0),
  baseEthReward: z.number().min(0),
  baseUsdtReward: z.number().min(0),
  levelMultiplier: z.number().min(0),
  comboRewardMultiplier: z.number().min(0),
  points: z.object({
    normal: z.number().min(0),
    btc: z.number().min(0),
    eth: z.number().min(0),
    usdt: z.number().min(0),
  }),
  combo: z.object({
    multiplier: z.number().min(0),
    maxChain: z.number().min(0),
  }),
  crypto: z.object({
    spawnChance: z.number().min(0).max(1),
  }),
  cryptoRewards: z.object({
    btcPerBall: z.number().min(0),
    ethPerBall: z.number().min(0),
    usdtPerBall: z.number().min(0),
  }),
  dailyLimits: z.object({
    btcMaxSatsPerDay: z.number().min(0),
    ethMaxWeiPerDay: z.number().min(0),
    usdtMaxPerDay: z.number().min(0),
  }),
  pools: z.object({
    btcBalanceSats: z.number().min(0),
    ethBalanceWei: z.number().min(0),
    usdtBalance: z.number().min(0),
  }),
  perGameLimits: z.object({
    btcMaxBeadsPerGame: z.number().min(0),
    ethMaxBeadsPerGame: z.number().min(0),
    usdtMaxBeadsPerGame: z.number().min(0),
  }),
});

export const livesConfigSchema = z.object({
  maxLives: z.number().min(1).max(10),
  refillTimeMinutes: z.number().min(1),
  canBuyLives: z.boolean(),
  costPerLife: z.number().min(0),
});