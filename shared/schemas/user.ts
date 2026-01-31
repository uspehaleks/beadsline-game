import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real, bigint, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { gameScores } from "./game";

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
  completedLevels: integer("completed_levels").array().default([]).notNull(),
  signupBonusReceived: boolean("signup_bonus_received").default(false).notNull(),
  ratingScore: integer("rating_score").default(0).notNull(),
  totalScore: integer("total_score").default(0).notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
  currentWinStreak: integer("current_win_streak").default(0).notNull(),
  bestWinStreak: integer("best_win_streak").default(0).notNull(),
  totalCombo5Plus: integer("total_combo_5_plus").default(0).notNull(),
  // Character system
  characterGender: varchar("character_gender", { length: 10 }), // 'male' or 'female'
  characterName: varchar("character_name", { length: 50 }),
  characterEnergy: integer("character_energy").default(100).notNull(), // 0-100
  characterHealthState: varchar("character_health_state", { length: 20 }).default("normal").notNull(), // 'normal', 'tired', 'sick'
  characterMood: varchar("character_mood", { length: 20 }).default("neutral").notNull(), // 'happy', 'neutral', 'sad'
  bonusLives: integer("bonus_lives").default(0).notNull(), // бонусные жизни из BEADS BOX
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  gameScores: many(gameScores),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPoints: true,
  gamesPlayed: true,
  bestScore: true,
  isAdmin: true,
  btcBalance: true,
  ethBalance: true,
  usdtBalance: true,
  btcBalanceSats: true,
  btcTodaySats: true,
  btcTodayDate: true,
  ethBalanceWei: true,
  ethTodayWei: true,
  ethTodayDate: true,
  usdtToday: true,
  usdtTodayDate: true,
  referralCode: true,
  referredBy: true,
  directReferralsCount: true,
  completedLevels: true,
  signupBonusReceived: true,
  ratingScore: true,
  totalScore: true,
  totalWins: true,
  currentWinStreak: true,
  bestWinStreak: true,
  totalCombo5Plus: true,
  characterEnergy: true,
  characterHealthState: true,
  characterMood: true,
  bonusLives: true,
  lastActivityAt: true,
  createdAt: true,
  deletedAt: true,
});

export const adminUserUpdateSchema = z.object({
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photoUrl: z.string().optional(),
  totalPoints: z.number().optional(),
  gamesPlayed: z.number().optional(),
  bestScore: z.number().optional(),
  isAdmin: z.boolean().optional(),
  btcBalance: z.number().optional(),
  ethBalance: z.number().optional(),
  usdtBalance: z.number().optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  directReferralsCount: z.number().optional(),
  completedLevels: z.array(z.number()).optional(),
  signupBonusReceived: z.boolean().optional(),
  ratingScore: z.number().optional(),
  totalScore: z.number().optional(),
  totalWins: z.number().optional(),
  currentWinStreak: z.number().optional(),
  bestWinStreak: z.number().optional(),
  totalCombo5Plus: z.number().optional(),
  characterGender: z.string().optional(),
  characterName: z.string().optional(),
  characterEnergy: z.number().optional(),
  characterHealthState: z.string().optional(),
  characterMood: z.string().optional(),
  bonusLives: z.number().optional(),
  lastActivityAt: z.string().optional(),
});

export const adminUserIsAdminUpdateSchema = z.object({
  isAdmin: z.boolean()
});