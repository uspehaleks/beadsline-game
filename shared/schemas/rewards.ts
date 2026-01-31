import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { gameScores } from "./game";

export const seasons = pgTable("seasons", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  seasonNumber: integer("season_number").notNull().unique(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasonResults = pgTable("season_results", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  seasonId: varchar("season_id", { length: 255 }).notNull().references(() => seasons.id),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  rewardAmount: integer("reward_amount").notNull(),
  rewardCurrency: varchar("reward_currency", { length: 10 }).notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasonResultsRelations = relations(seasonResults, ({ one }) => ({
  season: one(seasons, {
    fields: [seasonResults.seasonId],
    references: [seasons.id],
  }),
  user: one(users, {
    fields: [seasonResults.userId],
    references: [users.id],
  }),
}));

export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  referrerId: varchar("referrer_id", { length: 255 }).notNull().references(() => users.id),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // 'signup', 'first_game', 'milestone', etc.
  rewardAmount: integer("reward_amount").notNull(),
  rewardCurrency: varchar("reward_currency", { length: 10 }).notNull(), // 'BEADS', 'BTC', 'ETH', 'USDT'
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'awarded', 'cancelled'
  gameScoreId: varchar("game_score_id", { length: 255 }).references(() => gameScores.id), // if reward is tied to a game event
  claimedAt: timestamp("claimed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  user: one(users, {
    fields: [referralRewards.userId],
    references: [users.id],
  }),
  referrer: one(users, {
    fields: [referralRewards.referrerId],
    references: [users.id],
  }),
  gameScore: one(gameScores, {
    fields: [referralRewards.gameScoreId],
    references: [gameScores.id],
  }),
}));

export const insertSeasonSchema = createInsertSchema(seasons).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertSeasonResultSchema = createInsertSchema(seasonResults).omit({
  id: true,
  createdAt: true,
  claimed: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
  claimedAt: true,
  expiresAt: true,
  status: true,
});

export const referralConfigSchema = z.object({
  signupBonus: z.number().min(0),
  firstGameBonus: z.number().min(0),
  referralRewardPercent: z.number().min(0).max(100),
  maxReferralReward: z.number().min(0),
});