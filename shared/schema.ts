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
  leagueSlug: varchar("league_slug", { length: 50 }).notNull(),
  finalRatingScore: integer("final_rating_score").notNull(),
  finalRank: integer("final_rank").notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
  totalGames: integer("total_games").default(0).notNull(),
  bestWinStreak: integer("best_win_streak").default(0).notNull(),
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

export const boosts = pgTable("boosts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  descriptionEn: text("description_en").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  effectValue: real("effect_value").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userBoostInventory = pgTable("user_boost_inventory", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  boostId: varchar("boost_id", { length: 255 }).notNull().references(() => boosts.id),
  quantity: integer("quantity").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const boostsRelations = relations(boosts, ({ many }) => ({
  inventory: many(userBoostInventory),
}));

export const userBoostInventoryRelations = relations(userBoostInventory, ({ one }) => ({
  user: one(users, {
    fields: [userBoostInventory.userId],
    references: [users.id],
  }),
  boost: one(boosts, {
    fields: [userBoostInventory.boostId],
    references: [boosts.id],
  }),
}));

// Game Skins - visual themes for the game (snake/balls appearance)
export const gameSkins = pgTable("game_skins", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  descriptionRu: text("description_ru"),
  previewImageUrl: text("preview_image_url"),
  skinType: varchar("skin_type", { length: 20 }).notNull().default("game"), // game, character
  colorPrimary: varchar("color_primary", { length: 20 }), // hex color for primary elements
  colorSecondary: varchar("color_secondary", { length: 20 }), // hex color for secondary elements
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User owned skins
export const userSkins = pgTable("user_skins", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  skinId: varchar("skin_id", { length: 255 }).notNull().references(() => gameSkins.id),
  isActive: boolean("is_active").default(false).notNull(), // currently active skin
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});

export const gameSkinsRelations = relations(gameSkins, ({ many }) => ({
  userSkins: many(userSkins),
}));

export const userSkinsRelations = relations(userSkins, ({ one }) => ({
  user: one(users, {
    fields: [userSkins.userId],
    references: [users.id],
  }),
  skin: one(gameSkins, {
    fields: [userSkins.skinId],
    references: [gameSkins.id],
  }),
}));

// Boost Packages - bundles of all 7 boost types for purchase with Telegram Stars or Crypto
export const boostPackages = pgTable("boost_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  nameRu: text("name_ru").notNull(),
  boostsPerType: integer("boosts_per_type").notNull(), // количество каждого типа буста
  priceStars: integer("price_stars").notNull(), // цена в Telegram Stars
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }), // цена в USD для криптоплатежей
  originalPriceStars: integer("original_price_stars"), // перечёркнутая цена (если есть скидка)
  badge: varchar("badge", { length: 50 }), // бейдж: "hot", "best_value", null
  badgeText: text("badge_text"), // текст бейджа: "ХИТ ПРОДАЖ!", "ЛУЧШАЯ ЦЕНА!"
  bonusLives: integer("bonus_lives").default(0).notNull(), // бонусные жизни
  bonusSkinId: varchar("bonus_skin_id", { length: 255 }).references(() => gameSkins.id), // ID бонусного скина
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase history for boost packages
export const boostPackagePurchases = pgTable("boost_package_purchases", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 255 }).notNull().references(() => boostPackages.id),
  telegramPaymentId: varchar("telegram_payment_id", { length: 255 }),
  priceStars: integer("price_stars").notNull(),
  boostsPerType: integer("boosts_per_type").notNull(),
  bonusLives: integer("bonus_lives").default(0).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Manual crypto payment requests (semi-automatic)
export const cryptoPayments = pgTable("crypto_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 255 }).notNull().references(() => boostPackages.id),
  network: varchar("network", { length: 30 }).notNull(), // usdt_trc20, usdt_bep20, usdt_erc20, usdt_ton
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(), // price in USD
  status: varchar("status", { length: 30 }).default("pending").notNull(), // pending, confirmed, rejected
  adminNote: text("admin_note"), // note from admin when confirming/rejecting
  confirmedBy: varchar("confirmed_by", { length: 255 }), // admin who confirmed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
  package: one(boostPackages, {
    fields: [cryptoPayments.packageId],
    references: [boostPackages.id],
  }),
}));

export const boostPackagesRelations = relations(boostPackages, ({ many }) => ({
  purchases: many(boostPackagePurchases),
}));

export const boostPackagePurchasesRelations = relations(boostPackagePurchases, ({ one }) => ({
  user: one(users, {
    fields: [boostPackagePurchases.userId],
    references: [users.id],
  }),
  package: one(boostPackages, {
    fields: [boostPackagePurchases.packageId],
    references: [boostPackages.id],
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
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by", { length: 255 }),
  deleteReason: text("delete_reason"),
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

// Character System Tables
export const characters = pgTable("characters", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id).unique(),
  name: text("name").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  hunger: integer("hunger").default(100).notNull(),
  thirst: integer("thirst").default(100).notNull(),
  fatigue: integer("fatigue").default(0).notNull(),
  lastCareAt: timestamp("last_care_at").defaultNow(),
  careCooldowns: text("care_cooldowns").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accessoryCategories = pgTable("accessory_categories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  slot: varchar("slot", { length: 20 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const baseBodies = pgTable("base_bodies", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  gender: varchar("gender", { length: 10 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accessories = pgTable("accessories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id", { length: 255 }).notNull().references(() => accessoryCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
  nameRu: text("name_ru").notNull(),
  descriptionRu: text("description_ru"),
  imageUrl: text("image_url").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  positionX: integer("position_x").default(0).notNull(),
  positionY: integer("position_y").default(0).notNull(),
  zIndex: integer("z_index").default(1).notNull(),
  scale: numeric("scale", { precision: 5, scale: 2 }).default("1.0").notNull(),
  price: integer("price").default(100).notNull(),
  maxQuantity: integer("max_quantity"),
  soldCount: integer("sold_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAccessories = pgTable("user_accessories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  accessoryId: varchar("accessory_id", { length: 255 }).notNull().references(() => accessories.id),
  isEquipped: boolean("is_equipped").default(false).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
}));

export const accessoriesRelations = relations(accessories, ({ one, many }) => ({
  category: one(accessoryCategories, {
    fields: [accessories.categoryId],
    references: [accessoryCategories.id],
  }),
  userAccessories: many(userAccessories),
}));

export const userAccessoriesRelations = relations(userAccessories, ({ one }) => ({
  user: one(users, {
    fields: [userAccessories.userId],
    references: [users.id],
  }),
  accessory: one(accessories, {
    fields: [userAccessories.accessoryId],
    references: [accessories.id],
  }),
}));

export const leagues = pgTable("leagues", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon").notNull(),
  minBeads: integer("min_beads").default(0).notNull(),
  maxRank: integer("max_rank"),
  themeColor: varchar("theme_color", { length: 20 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeagueSchema = createInsertSchema(leagues).omit({
  id: true,
  createdAt: true,
});

export const updateLeagueSchema = z.object({
  nameRu: z.string().optional(),
  nameEn: z.string().optional(),
  icon: z.string().optional(),
  minBeads: z.number().int().optional(),
  maxRank: z.number().int().optional().nullable(),
  themeColor: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leagues.$inferSelect;

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
  completedLevels: true,
  createdAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores, {
  score: z.number().int().min(0, "Score cannot be negative").max(100000, "Score is unrealistically high"),
  cryptoBtc: z.number().int().min(0).max(100, "Too many BTC collected"),
  cryptoEth: z.number().int().min(0).max(100, "Too many ETH collected"),
  cryptoUsdt: z.number().int().min(0).max(100, "Too many USDT collected"),
  maxCombo: z.number().int().min(0).max(500, "Max combo is unrealistically high"),
  accuracy: z.number().int().min(0).max(100, "Accuracy must be between 0 and 100"),
  duration: z.number().int().min(0).max(300, "Game duration is out of bounds"), // Allows for up to 5 minutes for games with extra lives
}).omit({
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

export const insertSeasonSchema = createInsertSchema(seasons).omit({
  id: true,
  createdAt: true,
});

export const insertSeasonResultSchema = createInsertSchema(seasonResults).omit({
  id: true,
  createdAt: true,
});

export type InsertSeason = z.infer<typeof insertSeasonSchema>;
export type Season = typeof seasons.$inferSelect;
export type InsertSeasonResult = z.infer<typeof insertSeasonResultSchema>;
export type SeasonResult = typeof seasonResults.$inferSelect;

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
});

export const insertBoostSchema = createInsertSchema(boosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserBoostInventorySchema = createInsertSchema(userBoostInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Character System Insert Schemas
export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertAccessoryCategorySchema = createInsertSchema(accessoryCategories).omit({
  id: true,
});

export const insertBaseBodySchema = createInsertSchema(baseBodies).omit({
  id: true,
  createdAt: true,
});

export const insertAccessorySchema = createInsertSchema(accessories).omit({
  id: true,
  soldCount: true,
  createdAt: true,
});

export const insertUserAccessorySchema = createInsertSchema(userAccessories).omit({
  id: true,
  purchasedAt: true,
});

// Boost Packages Insert Schemas
export const insertGameSkinSchema = createInsertSchema(gameSkins).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkinSchema = createInsertSchema(userSkins).omit({
  id: true,
  acquiredAt: true,
});

export const insertBoostPackageSchema = createInsertSchema(boostPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBoostPackagePurchaseSchema = createInsertSchema(boostPackagePurchases).omit({
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
export type InsertBoost = z.infer<typeof insertBoostSchema>;
export type Boost = typeof boosts.$inferSelect;
export type InsertUserBoostInventory = z.infer<typeof insertUserBoostInventorySchema>;
export type UserBoostInventory = typeof userBoostInventory.$inferSelect;

// Character System Types
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertAccessoryCategory = z.infer<typeof insertAccessoryCategorySchema>;
export type AccessoryCategory = typeof accessoryCategories.$inferSelect;
export type InsertBaseBody = z.infer<typeof insertBaseBodySchema>;
export type BaseBody = typeof baseBodies.$inferSelect;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
export type Accessory = typeof accessories.$inferSelect;
export type InsertUserAccessory = z.infer<typeof insertUserAccessorySchema>;
export type UserAccessory = typeof userAccessories.$inferSelect;

// Boost Package Types
export type InsertGameSkin = z.infer<typeof insertGameSkinSchema>;
export type GameSkin = typeof gameSkins.$inferSelect;
export type InsertUserSkin = z.infer<typeof insertUserSkinSchema>;
export type UserSkin = typeof userSkins.$inferSelect;
export type InsertBoostPackage = z.infer<typeof insertBoostPackageSchema>;
export type BoostPackage = typeof boostPackages.$inferSelect;
export type InsertBoostPackagePurchase = z.infer<typeof insertBoostPackagePurchaseSchema>;
export type BoostPackagePurchase = typeof boostPackagePurchases.$inferSelect;

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCryptoPayment = z.infer<typeof insertCryptoPaymentSchema>;
export type CryptoPayment = typeof cryptoPayments.$inferSelect;

// Team members for revenue distribution
export const teamMembers = pgTable("team_members", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  sharePercent: real("share_percent").default(15).notNull(),
  totalEarnedStars: integer("total_earned_stars").default(0).notNull(),
  totalEarnedUsd: numeric("total_earned_usd", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Revenue distribution shares tracking
export const revenueShares = pgTable("revenue_shares", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id", { length: 255 }),
  cryptoPaymentId: varchar("crypto_payment_id", { length: 255 }),
  paymentType: varchar("payment_type", { length: 20 }).notNull(), // 'stars' or 'crypto'
  totalStars: integer("total_stars").default(0).notNull(),
  totalUsd: numeric("total_usd", { precision: 12, scale: 2 }).default("0").notNull(),
  developmentStars: integer("development_stars").default(0).notNull(),
  developmentUsd: numeric("development_usd", { precision: 12, scale: 2 }).default("0").notNull(),
  advertisingStars: integer("advertising_stars").default(0).notNull(),
  advertisingUsd: numeric("advertising_usd", { precision: 12, scale: 2 }).default("0").notNull(),
  teamSharesJson: jsonb("team_shares_json").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRevenueShareSchema = createInsertSchema(revenueShares).omit({
  id: true,
  createdAt: true,
});
export type InsertRevenueShare = z.infer<typeof insertRevenueShareSchema>;
export type RevenueShare = typeof revenueShares.$inferSelect;

// Crypto withdrawal requests (semi-automatic)
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  cryptoType: varchar("crypto_type", { length: 10 }).notNull(), // 'btc', 'eth', 'usdt'
  network: varchar("network", { length: 20 }), // 'bep20', 'trc20', 'erc20', 'btc', 'eth', 'ton'
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  networkFee: numeric("network_fee", { precision: 18, scale: 8 }).default("0").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'approved', 'rejected', 'completed'
  adminNote: text("admin_note"),
  txHash: text("tx_hash"), // Transaction hash after completion
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by", { length: 255 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id],
  }),
}));

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  status: true,
  adminNote: true,
  txHash: true,
  processedAt: true,
  processedBy: true,
  createdAt: true,
});
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

// Withdrawal config interface
export interface WithdrawalConfig {
  btc: {
    minAmount: number;
    networkFee: number;
    enabled: boolean;
  };
  eth: {
    minAmount: number;
    networkFee: number;
    enabled: boolean;
  };
  usdt: {
    bep20: { minAmount: number; networkFee: number; enabled: boolean };
    trc20: { minAmount: number; networkFee: number; enabled: boolean };
    erc20: { minAmount: number; networkFee: number; enabled: boolean };
    ton: { minAmount: number; networkFee: number; enabled: boolean };
  };
}

// Revenue summary config
export interface RevenueSummary {
  totalSalesStars: number;
  totalSalesUsd: number;
  developmentStars: number;
  developmentUsd: number;
  advertisingStars: number;
  advertisingUsd: number;
  teamShares: { memberId: string; name: string; stars: number; usd: number }[];
  salesCount: number;
  starsSalesCount: number;
  cryptoSalesCount: number;
}

export type GenderType = 'male' | 'female';
export type AccessoryGenderType = 'male' | 'female' | 'both';
export type SlotType = 'head' | 'eyes' | 'face' | 'body' | 'background';

export interface CharacterWithAccessories {
  character: Character;
  baseBody: BaseBody | null;
  equippedAccessories: (UserAccessory & { accessory: Accessory })[];
}

export type BoostType = 'slowdown' | 'bomb' | 'rainbow' | 'rewind';

export type TransactionType = 
  | 'game_win_reward'
  | 'buy_extra_life'
  | 'buy_boost'
  | 'referral_reward'
  | 'admin_adjustment'
  | 'house_deposit'
  | 'house_withdrawal'
  | 'signup_bonus'
  | 'beads_box_reward';

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
  isRainbow?: boolean;
  radius: number;
  pathProgress: number;
  spawnAnimStart?: number;
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
  totalBallsSpawned: number;
}

export interface LeaderboardEntry {
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
  btcBalanceSats?: number;
  ethBalanceWei?: number;
  referredBy?: string | null;
  directReferralsCount?: number;
  completedLevels?: number[];
  characterGender?: string;
  characterName?: string;
  characterEnergy?: number;
  characterHealthState?: string;
  characterMood?: string;
  bonusLives?: number;
  lastActivityAt?: Date;
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
    activeColors?: string[];
  };
}

// ===== BEADS BOX SYSTEM =====

// Stores each user's daily box session
export const beadsBoxSessions = pgTable("beads_box_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  sessionDate: date("session_date").notNull(),
  boxes: jsonb("boxes").notNull(), // Array of 6 box rewards generated for this session
  selectedBoxIndex: integer("selected_box_index"), // 0-5, null if not selected yet
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  rewardType: varchar("reward_type", { length: 50 }), // beads, boost, lives, crypto_ticket
  rewardValue: jsonb("reward_value"), // { amount: 100 } or { boostId: "...", quantity: 1 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  claimedAt: timestamp("claimed_at"),
});

export const insertBeadsBoxSessionSchema = createInsertSchema(beadsBoxSessions).omit({
  id: true,
  createdAt: true,
});

export type BeadsBoxSession = typeof beadsBoxSessions.$inferSelect;
export type InsertBeadsBoxSession = z.infer<typeof insertBeadsBoxSessionSchema>;

// Crypto game tickets earned from BEADS BOX special prize
export const cryptoGameTickets = pgTable("crypto_game_tickets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  sourceSessionId: varchar("source_session_id", { length: 255 }).references(() => beadsBoxSessions.id),
  status: varchar("status", { length: 20 }).default("available").notNull(), // available, used, expired
  usedAt: timestamp("used_at"),
  gameScoreId: varchar("game_score_id", { length: 255 }).references(() => gameScores.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration
});

export const insertCryptoGameTicketSchema = createInsertSchema(cryptoGameTickets).omit({
  id: true,
  createdAt: true,
});

export type CryptoGameTicket = typeof cryptoGameTickets.$inferSelect;
export type InsertCryptoGameTicket = z.infer<typeof insertCryptoGameTicketSchema>;

// Box reward types
export type BeadsBoxRewardType = 'beads' | 'boost' | 'lives' | 'crypto_ticket';

export interface BeadsBoxReward {
  type: BeadsBoxRewardType;
  value: number; // For beads/lives: amount. For boost: quantity.
  boostId?: string; // For boost type
  boostType?: string; // For display purposes
}

export interface BeadsBoxConfig {
  enabled: boolean;
  boxCount: number; // Default 6
  rewards: {
    beads: { min: number; max: number; weight: number };
    boost: { quantity: number; weight: number };
    lives: { min: number; max: number; weight: number };
    cryptoTicket: { weight: number }; // Only for level 10+ players
  };
  cryptoTicketMinLevel: number; // Minimum completed levels to get crypto ticket
}

export const adminUserUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  totalPoints: z.number().int().optional(),
  gamesPlayed: z.number().int().optional(),
  bestScore: z.number().int().optional(),
  isAdmin: z.boolean().optional(),
  btcBalanceSats: z.number().int().optional(),
  ethBalanceWei: z.number().int().optional(),
  usdtBalance: z.number().optional(),
  referredBy: z.string().nullable().optional(),
});

export const adminUserIsAdminUpdateSchema = z.object({
  isAdmin: z.boolean(),
});
