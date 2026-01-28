// server/health-check.ts - отдельный модуль для проверки работоспособности
import { sql } from "drizzle-orm";
import { Request, Response } from "express";
import { createTempDbConnection } from "./db.js";

export async function healthCheckHandler(req: Request, res: Response) {
  console.log("Health check endpoint called from:", req.ip || 'unknown IP');
  
  try {
    // Используем временное соединение для проверки
    const { db: tempDb, pool: tempPool } = await createTempDbConnection();
    
    try {
      // Выполняем самый простой запрос, чтобы проверить соединение
      await tempDb.execute(sql`select 1`);
      console.log("Database connection successful");

      // Проверяем доступ к таблице пользователей
      const userCountResult = await tempDb.execute(sql`SELECT COUNT(*) as count FROM users LIMIT 1`);
      const tablesAccessible = true; // Если запрос прошел успешно, таблицы доступны
      console.log("Tables accessibility check successful");

      res.status(200).json({
        status: 'healthy',
        databaseConnected: true,
        tablesAccessible: tablesAccessible,
        timestamp: new Date().toISOString(),
        message: 'База данных подключена и доступна'
      });
    } finally {
      // Обязательно закрываем соединение
      await tempPool.end();
    }
  } catch (error: any) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: 'unhealthy',
      databaseConnected: false,
      tablesAccessible: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Ошибка подключения к базе данных'
    });
  }
}