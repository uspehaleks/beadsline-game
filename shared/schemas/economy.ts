import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real, bigint, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { gameScores } from "./game";

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
  balanceBefore: real("balance_before").default(0),
  balanceAfter: real("balance_after").default(0),
  description: varchar("description", { length: 100 }),
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

export const insertPrizePoolSchema = createInsertSchema(prizePool).omit({
  id: true,
  createdAt: true,
});

export const insertUsdtFundSettingsSchema = createInsertSchema(usdtFundSettings).omit({
  id: true,
  lastResetDate: true,
  updatedAt: true,
});

export const insertRealRewardSchema = createInsertSchema(realRewards).omit({
  id: true,
  createdAt: true,
  balanceBefore: true,
  balanceAfter: true,
});

export const houseAccountConfigSchema = z.object({
  btc_address: z.string().optional(),
  eth_address: z.string().optional(),
  usdt_trc20_address: z.string().optional(),
  usdt_ton_address: z.string().optional(),
});

export const fundTogglesSchema = z.object({
  enableBtc: z.boolean().optional(),
  enableEth: z.boolean().optional(),
  enableUsdt: z.boolean().optional(),
  enableBtcWithdrawals: z.boolean().optional(),
  enableEthWithdrawals: z.boolean().optional(),
  enableUsdtWithdrawals: z.boolean().optional(),
});

export const updateFundTogglesSchema = z.object({
  enableBtc: z.boolean(),
  enableEth: z.boolean(),
  enableUsdt: z.boolean(),
  enableBtcWithdrawals: z.boolean(),
  enableEthWithdrawals: z.boolean(),
  enableUsdtWithdrawals: z.boolean(),
});

// Schemas for boost purchases
export const buyBoostSchema = z.object({
  boostId: z.string().min(1, "Boost ID is required"),
  quantity: z.number().int().positive().default(1),
});

export const purchaseBoostPackageSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
  telegramPaymentId: z.string().optional(),
});

export const createCryptoPaymentRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  packageId: z.string().min(1, "Package ID is required"),
  network: z.enum(['ton', 'tron', 'ethereum', 'bitcoin']),
  priceUsd: z.number().positive("Price must be positive"),
});