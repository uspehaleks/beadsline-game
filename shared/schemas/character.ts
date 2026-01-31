import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";

// Таблица для хранения информации о персонажах игроков
export const characters = pgTable("characters", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().unique().references(() => users.id),
  name: varchar("name", { length: 50 }).notNull(),
  gender: varchar("gender", { length: 10 }).notNull(), // 'male' or 'female'
  level: integer("level").default(1).notNull(),
  energy: integer("energy").default(100).notNull(), // 0-100
  health: integer("health").default(100).notNull(), // 0-100
  mood: varchar("mood", { length: 20 }).default("neutral").notNull(), // 'happy', 'neutral', 'sad'
  healthState: varchar("health_state", { length: 20 }).default("normal").notNull(), // 'normal', 'tired', 'sick'
  hunger: integer("hunger").default(0).notNull(), // 0-100
  thirst: integer("thirst").default(0).notNull(), // 0-100
  fatigue: integer("fatigue").default(0).notNull(), // 0-100
  gamesPlayed: integer("games_played").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  bonusLives: integer("bonus_lives").default(0).notNull(), // бонусные жизни из BEADS BOX
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
}));

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  level: true,
  energy: true,
  health: true,
  mood: true,
  healthState: true,
  hunger: true,
  thirst: true,
  fatigue: true,
  gamesPlayed: true,
  wins: true,
  losses: true,
  totalPoints: true,
  bestScore: true,
  completedTasks: true,
  bonusLives: true,
});

// Таблица для категорий аксессуаров
export const accessoryCategories = pgTable("accessory_categories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAccessoryCategorySchema = createInsertSchema(accessoryCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для базовых тел персонажей
export const baseBodies = pgTable("base_bodies", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  gender: varchar("gender", { length: 10 }).notNull(), // 'male' or 'female'
  imageUrl: text("image_url").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBaseBodySchema = createInsertSchema(baseBodies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для аксессуаров
export const accessories = pgTable("accessories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id", { length: 255 }).notNull().references(() => accessoryCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'hat', 'shirt', 'pants', etc.
  price: integer("price").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  imageUrl: text("image_url").notNull(),
  gender: varchar("gender", { length: 10 }), // 'male', 'female', or null for both
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accessoriesRelations = relations(accessories, ({ one }) => ({
  category: one(accessoryCategories, {
    fields: [accessories.categoryId],
    references: [accessoryCategories.id],
  }),
}));

export const insertAccessorySchema = createInsertSchema(accessories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для аксессуаров пользователя
export const userAccessories = pgTable("user_accessories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  accessoryId: varchar("accessory_id", { length: 255 }).notNull().references(() => accessories.id),
  isEquipped: boolean("is_equipped").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const insertUserAccessorySchema = createInsertSchema(userAccessories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isEquipped: true,
});

// Таблица для скинов игры
export const gameSkins = pgTable("game_skins", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameSkinSchema = createInsertSchema(gameSkins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Таблица для скинов пользователя
export const userSkins = pgTable("user_skins", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  skinId: varchar("skin_id", { length: 255 }).notNull().references(() => gameSkins.id),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const insertUserSkinSchema = createInsertSchema(userSkins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

// Типы для TypeScript
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof insertCharacterSchema._output;

export type AccessoryCategory = typeof accessoryCategories.$inferSelect;
export type InsertAccessoryCategory = typeof insertAccessoryCategorySchema._output;

export type BaseBody = typeof baseBodies.$inferSelect;
export type InsertBaseBody = typeof insertBaseBodySchema._output;

export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = typeof insertAccessorySchema._output;

export type UserAccessory = typeof userAccessories.$inferSelect;
export type InsertUserAccessory = typeof insertUserAccessorySchema._output;

export type GameSkin = typeof gameSkins.$inferSelect;
export type InsertGameSkin = typeof insertGameSkinSchema._output;

export type UserSkin = typeof userSkins.$inferSelect;
export type InsertUserSkin = typeof insertUserSkinSchema._output;