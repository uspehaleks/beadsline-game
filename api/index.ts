import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/static.js';
import { pool } from '../server/db.js';
import { createServer } from 'http';

const app = express();
const isProduction = true;
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
const dummyServer = createServer(app);
registerRoutes(dummyServer, app);

if (isProduction) {
  serveStatic(app);
}

// ЭТО КРИТИЧЕСКИ ВАЖНО ДЛЯ VERCEL
export default app;