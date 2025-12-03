import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameConfig = z.infer<typeof insertGameConfigSchema>;
export type GameConfig = typeof gameConfig.$inferSelect;
export type InsertPrizePool = z.infer<typeof insertPrizePoolSchema>;
export type PrizePool = typeof prizePool.$inferSelect;

export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
export type CryptoType = 'btc' | 'eth' | 'usdt';

export interface Ball {
  id: string;
  x: number;
  y: number;
  color: BallColor;
  crypto?: CryptoType;
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
  isPlaying: boolean;
  isGameOver: boolean;
  won: boolean;
  shotsTotal: number;
  shotsHit: number;
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
