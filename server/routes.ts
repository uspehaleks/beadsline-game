import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes/index.js";
import { Router } from "express";

export async function registerAllRoutes(server: Server, app: Express) {
  // Создаем отдельный роутер для API с префиксом /api
  const apiRouter = Router();
  registerRoutes(apiRouter);

  // Регистрируем все маршруты с префиксом /api
  app.use('/api', apiRouter);

  console.log("Все маршруты успешно зарегистрированы");
}