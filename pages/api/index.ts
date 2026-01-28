// Общий API маршрут для обработки запросов к API
// Этот файл будет обрабатывать все /api/ запросы, которые не имеют специфического маршрута

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Возвращаем информацию о доступных API маршрутах
  res.status(200).json({
    message: "BeadsLine API",
    availableRoutes: [
      "/api/health-check",
      "/api/env-info", 
      "/api/debug-env",
      "/api/tg-webhook",
      "/api/telegram/setup-webhook",
      "/api/scores",
      "/api/leaderboard",
      "/api/user/crypto-tickets",
      "/api/character",
      "/api/admin/*"
    ],
    method: req.method,
    timestamp: new Date().toISOString()
  });
}