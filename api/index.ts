import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/static';
import { pool } from '../server/db';

// Создаем приложение Express для Vercel
const app = express();

// Настройки сессии
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'crypto-zuma-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction ? true : false,
      httpOnly: true,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Регистрируем маршруты
registerRoutes(require('http').createServer(), app).catch(console.error);

// В продакшене обслуживаем статические файлы
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  serveStatic(app);
} else {
  // В development режиме Vercel может не нуждаться в Vite
  // или использовать другой подход
  serveStatic(app);
}

export default app;