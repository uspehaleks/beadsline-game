import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { gameScores } from "./game";

// Таблица для транзакций бусин
export const beadsTransactions = pgTable("beads_transactions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'earn', 'spend', 'refund', 'bonus', etc.
  amount: integer("amount").notNull(), // Количество бусин
  balanceBefore: integer("balance_before").notNull(), // Баланс до транзакции
  balanceAfter: integer("balance_after").notNull(), // Баланс после транзакции
  description: text("description").notNull(),
  gameScoreId: varchar("game_score_id", { length: 255 }), // ID игры, если транзакция связана с игрой
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Для soft delete
  deletedBy: varchar("deleted_by", { length: 255 }), // Кто удалил транзакцию
  deleteReason: text("delete_reason"), // Причина удаления
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

export const insertBeadsTransactionSchema = createInsertSchema(beadsTransactions).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
  deletedBy: true,
  deleteReason: true,
});

// Типы для TypeScript
export type BeadsTransaction = typeof beadsTransactions.$inferSelect;
export type InsertBeadsTransaction = typeof insertBeadsTransactionSchema._output;

// Тип транзакции
export type TransactionType = string;