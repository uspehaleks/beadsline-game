import '../server/env-loader.js';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import { pool } from "./db.js";

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.REPL_SLUG;

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
    proxy: isProduction ? true : undefined,
    cookie: {
      secure: isProduction ? true : false,
      httpOnly: true,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Инициализация хранилища с использованием прямого подключения (порт 5432)
  // для миграций и инициализации, если DIRECT_URL доступен
  console.log("Server starting, initializing storage if needed");

  try {
    // Импортируем функцию для создания прямого соединения
    const { createDirectDbConnection } = await import('./db.js');

    // Функция для инициализации с повторными попытками
    const initializeWithRetry = async (maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Создаем временное прямое соединение для инициализации
          const { pool: directPool } = await createDirectDbConnection();
          const storageModule = await import('./storage.js');

          // Инициализируем хранилище с прямым соединением
          await storageModule.storage.ensureDefaultBaseBodies();
          console.log("Default base bodies initialized successfully");

          // Закрываем прямое соединение после инициализации
          await directPool.end();
          return; // Успешно завершаем, если инициализация прошла
        } catch (error) {
          console.error(`Attempt ${attempt} to initialize storage failed:`, error);

          if (attempt === maxRetries) {
            console.error("All attempts to initialize storage failed");
            throw error; // Бросаем ошибку, если все попытки исчерпаны
          }

          // Ждем 2 секунды перед повторной попыткой
          console.log(`Waiting 2 seconds before retry... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    };

    // Запускаем инициализацию с повторными попытками
    await initializeWithRetry();
  } catch (error) {
    console.error("Failed to initialize storage after retries:", error);
    // Не прерываем запуск сервера, даже если инициализация не удалась
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // @ts-ignore - Игнорируем отсутствие файла в продакшене (он только для dev)
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3001 for local development if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
