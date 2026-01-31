import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";

// Таблица для бустов
export const boosts = pgTable("boosts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(), // 'slowdown', 'bomb', 'rainbow', etc.
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameRu: varchar("name_ru", { length: 100 }).notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  price: integer("price").notNull(), // Цена в бусинах
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoostSchema = createInsertSchema(boosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для инвентаря бустов пользователя
export const userBoostInventory = pgTable("user_boost_inventory", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  boostId: varchar("boost_id", { length: 255 }).notNull().references(() => boosts.id),
  quantity: integer("quantity").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const insertUserBoostInventorySchema = createInsertSchema(userBoostInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для пакетов бустов
export const boostPackages = pgTable("boost_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  nameRu: varchar("name_ru", { length: 100 }).notNull(),
  description: text("description").notNull(),
  descriptionRu: text("description_ru").notNull(),
  priceStars: integer("price_stars").notNull(), // Цена в звездах Telegram
  priceUsd: varchar("price_usd", { length: 20 }), // Цена в USD (опционально)
  boostsPerType: integer("boosts_per_type").notNull(), // Количество каждого типа буста в пакете
  bonusLives: integer("bonus_lives").default(0).notNull(), // Бонусные жизни
  badge: varchar("badge", { length: 50 }), // Бейдж (опционально)
  badgeText: varchar("badge_text", { length: 100 }), // Текст бейджа (опционально)
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  originalPriceStars: integer("original_price_stars"), // Оригинальная цена (для скидок)
  bonusSkinId: varchar("bonus_skin_id", { length: 255 }), // ID бонусного скина (опционально)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoostPackageSchema = createInsertSchema(boostPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для покупок пакетов бустов
export const boostPackagePurchases = pgTable("boost_package_purchases", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 255 }).notNull().references(() => boostPackages.id),
  telegramPaymentId: varchar("telegram_payment_id", { length: 255 }), // ID платежа в Telegram
  priceStars: integer("price_stars").notNull(), // Цена в момент покупки
  boostsPerType: integer("boosts_per_type").notNull(), // Количество каждого типа буста
  bonusLives: integer("bonus_lives").default(0).notNull(), // Бонусные жизни
  status: varchar("status", { length: 20 }).default("completed").notNull(), // 'completed', 'refunded', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const insertBoostPackagePurchaseSchema = createInsertSchema(boostPackagePurchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

// Таблица для криптовалютных платежей (ручные подтверждения)
export const cryptoPayments = pgTable("crypto_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 255 }).notNull().references(() => boostPackages.id),
  network: varchar("network", { length: 20 }).notNull(), // 'ton', 'tron', 'ethereum', 'bitcoin'
  priceUsd: real("price_usd").notNull(), // Цена в USD
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'confirmed', 'rejected'
  adminNote: text("admin_note"),
  confirmedBy: varchar("confirmed_by", { length: 255 }), // ID администратора, подтвердившего
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
    references: [cryptoPayments.id],
  }),
}));

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  confirmedBy: true,
});

// Таблица для членов команды
export const teamMembers = pgTable("team_members", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  sharePercent: real("share_percent").notNull(), // Процент от дохода
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для распределения доходов
export const revenueShares = pgTable("revenue_shares", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id", { length: 255 }).notNull().references(() => teamMembers.id),
  amount: real("amount").notNull(), // Сумма дохода
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const revenueSharesRelations = relations(revenueShares, ({ one }) => ({
  member: one(teamMembers, {
    fields: [revenueShares.memberId],
    references: [teamMembers.id],
  }),
}));

export const insertRevenueShareSchema = createInsertSchema(revenueShares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для лиг
export const leagues = pgTable("leagues", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  nameRu: varchar("name_ru", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  minBeads: integer("min_beads").notNull(), // Минимальное количество бусин для участия
  maxRank: integer("max_rank"), // Максимальный ранг (если null, то не ограничено)
  themeColor: varchar("theme_color", { length: 20 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeagueSchema = createInsertSchema(leagues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для запросов на вывод средств
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(), // 'BTC', 'ETH', 'USDT', etc.
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'processing', 'completed', 'rejected'
  adminNote: text("admin_note"),
  txHash: varchar("tx_hash", { length: 255 }), // Хеш транзакции
  processedBy: varchar("processed_by", { length: 255 }), // ID администратора, обработавшего
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id],
  }),
}));

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  processedBy: true,
  processedAt: true,
});

// Таблица для сессий BEADS BOX
export const beadsBoxSessions = pgTable("beads_box_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  date: varchar("date", { length: 20 }).notNull(), // Формат YYYY-MM-DD
  boxes: jsonb("boxes").notNull(), // JSON массив с наградами
  openedBoxes: integer("opened_boxes").array().default([]).notNull(), // Индексы открытых коробок
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const beadsBoxSessionsRelations = relations(beadsBoxSessions, ({ one }) => ({
  user: one(users, {
    fields: [beadsBoxSessions.userId],
    references: [users.id],
  }),
}));

export const insertBeadsBoxSessionSchema = createInsertSchema(beadsBoxSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  openedBoxes: true,
});

// Таблица для криптотикетов
export const cryptoGameTickets = pgTable("crypto_game_tickets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(), // ID сессии игры
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  gameScoreId: varchar("game_score_id", { length: 255 }), // ID игры, в которой был использован
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cryptoGameTicketsRelations = relations(cryptoGameTickets, ({ one }) => ({
  user: one(users, {
    fields: [cryptoGameTickets.userId],
    references: [users.id],
  }),
}));

export const insertCryptoTicketSchema = createInsertSchema(cryptoGameTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  used: true,
  usedAt: true,
});

// Типы для TypeScript
export type Boost = typeof boosts.$inferSelect;
export type InsertBoost = typeof insertBoostSchema._output;

export type UserBoostInventory = typeof userBoostInventory.$inferSelect;
export type InsertUserBoostInventory = typeof insertUserBoostInventorySchema._output;

export type BoostPackage = typeof boostPackages.$inferSelect;
export type InsertBoostPackage = typeof insertBoostPackageSchema._output;

export type BoostPackagePurchase = typeof boostPackagePurchases.$inferSelect;
export type InsertBoostPackagePurchase = typeof insertBoostPackagePurchaseSchema._output;

export type CryptoPayment = typeof cryptoPayments.$inferSelect;
export type InsertCryptoPayment = typeof insertCryptoPaymentSchema._output;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof insertTeamMemberSchema._output;

export type RevenueShare = typeof revenueShares.$inferSelect;
export type InsertRevenueShare = typeof insertRevenueShareSchema._output;

export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof insertLeagueSchema._output;

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof insertWithdrawalRequestSchema._output;

export type BeadsBoxSession = typeof beadsBoxSessions.$inferSelect;
export type InsertBeadsBoxSession = typeof insertBeadsBoxSessionSchema._output;

export type CryptoGameTicket = typeof cryptoGameTickets.$inferSelect;
export type InsertCryptoGameTicket = typeof insertCryptoTicketSchema._output;