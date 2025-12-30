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

// NOWPayments crypto payment records
export const cryptoPayments = pgTable("crypto_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 255 }).notNull().references(() => boostPackages.id),
  nowPaymentId: varchar("now_payment_id", { length: 255 }).unique(), // NOWPayments payment_id
  payAddress: text("pay_address"), // crypto address to pay to
  payCurrency: varchar("pay_currency", { length: 20 }), // btc, eth, usdt, etc.
  payAmount: numeric("pay_amount", { precision: 30, scale: 18 }), // amount in crypto
  priceAmount: numeric("price_amount", { precision: 10, scale: 2 }).notNull(), // price in USD
  priceCurrency: varchar("price_currency", { length: 10 }).default("usd").notNull(),
  actuallyPaid: numeric("actually_paid", { precision: 30, scale: 18 }), // amount actually paid
  status: varchar("status", { length: 30 }).default("waiting").notNull(), // waiting, confirming, confirmed, sending, finished, failed, expired
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
  | 'signup_bonus';

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
  btcBalanceSats?: number;
  ethBalanceWei?: number;
  referredBy?: string | null;
  directReferralsCount?: number;
  completedLevels?: number[];
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
