import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { registerRoutes } from '../../server/routes.js';
import { pool } from '../../server/db.js';

// Создаем отдельное Express-приложение для этого конкретного эндпоинта
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'crypto-zuma-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Инициализируем маршруты
const dummyServer: any = {};
registerRoutes(dummyServer, app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Передаем управление Express-приложению
  app(req, res);
}