// server/routes/index.ts - главный файл маршрутов
import type { Express } from "express";
import { registerAuthRoutes } from "./auth.js";
import { registerUserRoutes } from "./user.js";
import { registerGameRoutes } from "./game.js";
import { registerEconomyRoutes } from "./economy.js";
import { registerAdminRoutes } from "./admin.js";
import { registerCharacterRoutes } from "./character.js";
import { registerReferralRoutes } from "./referral.js";
import { registerWithdrawalRoutes } from "./withdrawal.js";
import { registerHealthRoutes } from "./health.js";
import { registerUserAdditionalRoutes } from "./users.js";
import { registerLivesConfigRoutes } from "./livesConfig.js";
import { registerDebugRoutes } from "./debug.routes.js";

export function registerRoutes(app: Express) {
  // Регистрация всех маршрутов
  // Ставим debug-логи первыми для быстрого ответа
  registerDebugRoutes(app);
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerGameRoutes(app);
  registerEconomyRoutes(app);
  registerCharacterRoutes(app);
  registerReferralRoutes(app);
  registerWithdrawalRoutes(app);
  registerAdminRoutes(app);
  registerUserAdditionalRoutes(app);
  registerLivesConfigRoutes(app);

  console.log("Все маршруты зарегистрированы");
}