import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Таблица для хранения конфигурации уровней
export const levelConfigs = pgTable("level_configs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  levelId: integer("level_id").notNull().unique(),
  config: jsonb("config").notNull(), // Хранит всю конфигурацию уровня в формате JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Схема для валидации конфигурации уровня
export const levelConfigSchema = z.object({
  levelId: z.number().int().positive(),
  cryptoSpawnChance: z.number().min(0).max(1), // Шанс спавна крипто-шариков
  ballCount: z.number().min(1), // Количество шариков
  speed: z.number().min(0), // Скорость игры
  rewardMultiplier: z.number().min(0), // Множитель награды
  difficulty: z.string().optional(), // Сложность уровня
});

// Схема для вставки/обновления конфигурации уровня
export const insertLevelConfigSchema = createInsertSchema(levelConfigs)
  .extend({
    levelId: z.number().min(1),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Типы для TypeScript
export type LevelConfig = z.infer<typeof levelConfigSchema>;
export type InsertLevelConfig = z.infer<typeof insertLevelConfigSchema>;