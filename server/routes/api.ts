import { Router } from 'express';
import { registerAuthRoutes } from './auth.js';
import { registerUserRoutes } from './user.js';
import { registerGameRoutes } from './game.js';
import { registerEconomyRoutes } from './economy.js';
import { registerAdminRoutes } from './admin.js';
import { registerCharacterRoutes } from './character.js';
import { registerReferralRoutes } from './referral.js';
import { registerWithdrawalRoutes } from './withdrawal.js';
import { registerUserAdditionalRoutes } from './users.js';
import { registerLivesConfigRoutes } from './livesConfig.js';
import { registerDebugRoutes } from './debug.routes.js';

const apiRouter = Router();

// Регистрация всех маршрутов API
registerAuthRoutes(apiRouter);
registerUserRoutes(apiRouter);
registerGameRoutes(apiRouter);
registerEconomyRoutes(apiRouter);
registerCharacterRoutes(apiRouter);
registerReferralRoutes(apiRouter);
registerWithdrawalRoutes(apiRouter);
registerAdminRoutes(apiRouter);
registerUserAdditionalRoutes(apiRouter);
registerLivesConfigRoutes(apiRouter);
registerDebugRoutes(apiRouter);

export default apiRouter;