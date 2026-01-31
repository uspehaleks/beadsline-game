// server/routes/health.ts
import type { Express } from "express";
import { storage } from "../storage.js";
import { sql } from "drizzle-orm";

export function registerHealthRoutes(app: Express) {
  // Health check endpoint (preserved for compatibility)
  app.get("/api/health-check", async (req, res) => {
    console.log("Health check endpoint called from:", req.ip || 'unknown IP');

    // Проверяем подключение к базе данных
    try {
      // Выполняем простой запрос для проверки подключения
      const result = await storage.db.execute(sql`SELECT 1 as health_check`);

      // Если мы получили результат, значит подключение работает
      const isDatabaseAccessible = result && Array.isArray(result) && result.length > 0;

      // Проверяем доступ к таблице users
      let isTablesAccessible = false;
      try {
        const tableResult = await storage.db.execute(sql`SELECT COUNT(*) as count FROM users LIMIT 1`);
        isTablesAccessible = tableResult && Array.isArray(tableResult) && tableResult.length > 0;
      } catch (tableError) {
        console.error("Error checking table accessibility:", tableError);
        isTablesAccessible = false;
      }

      console.log("Database connection is healthy");

      res.status(200).json({
        test: "hello",
        databaseConnected: isDatabaseAccessible,
        databaseUrlStatus: process.env.DATABASE_URL ? "Found" : "Not Found",
        tablesAccessible: isTablesAccessible,
        timestamp: new Date().toISOString(),
        message: 'Health check endpoint is working'
      });
    } catch (error) {
      console.error('Database connection error:', error);

      res.status(500).json({
        test: "hello",
        databaseConnected: false,
        databaseUrlStatus: process.env.DATABASE_URL ? "Found" : "Not Found",
        tablesAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        message: 'Health check endpoint is working but database connection failed'
      });
    }
  });
}