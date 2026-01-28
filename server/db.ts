import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

// Определяем URL для подключения в зависимости от назначения
const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL || DATABASE_URL; // Используем DIRECT_URL для миграций, если доступен

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Функция для извлечения хоста и порта из URL
function parseConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port || '5432', // по умолчанию PostgreSQL использует 5432
      fullUrl: connectionString
    };
  } catch (error) {
    console.error("Error parsing connection string:", error);
    return {
      host: 'unknown',
      port: 'unknown',
      fullUrl: connectionString
    };
  }
}

// Определяем, какой URL использовать для основного подключения
const connectionTarget = DATABASE_URL;
const { host, port } = parseConnectionString(connectionTarget);

console.log("Attempting to connect to database...");
console.log("Connecting to host:", host, "on port:", port);
console.log("DATABASE_URL exists:", !!DATABASE_URL);
console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
console.log("DATABASE_URL being used:", DATABASE_URL ? DATABASE_URL.substring(0, 50) + "..." : "UNDEFINED");

// Оптимизированный пул соединений для serverless среды
// Используем DATABASE_URL для рабочих нагрузок (порт 6543 с pgbouncer)
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Настройки для pgbouncer (порт 6543)
  connectionTimeoutMillis: 1000,  // Минимальный таймаут подключения
  idleTimeoutMillis: 5000,        // Минимальный таймаут простоя
  max: 1,                         // Минимальное количество соединений
  // Дополнительные параметры для стабильности в serverless
  maxUses: 750,                   // Количество использований соединения до пересоздания
  statement_timeout: 3000,        // Таймаут выполнения SQL запроса
  query_timeout: 5000,            // Таймаут выполнения запроса
  keepAlive: true,                // Поддерживать соединение активным
  keepAliveInitialDelayMillis: 1000, // Уменьшенная задержка keep-alive
  // Отключаем подготовленные операторы для совместимости с pgbouncer
  noPrepare: true                 // Отключаем подготовленные операторы
});

// В serverless среде не производим тестовое подключение при запуске
// Соединение будет установлено при первом запросе
console.log("Database pool configured for serverless environment with pgbouncer");

export const db = drizzle(pool, { schema });

// Функция для создания временного соединения для миграций и инициализации
// Использует DIRECT_URL (порт 5432) для прямого подключения
export async function createDirectDbConnection() {
  const directUrl = process.env.DIRECT_URL || DATABASE_URL;
  const { host: directHost, port: directPort } = parseConnectionString(directUrl);

  console.log("Creating direct connection to host:", directHost, "on port:", directPort);

  const directPool = new Pool({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false
    },
    // Настройки для прямого подключения (порт 5432)
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
    max: 1,
    // Для прямого подключения можем использовать подготовленные операторы
    noPrepare: false
  });

  try {
    // Проверяем соединение
    const client = await directPool.connect();
    await client.query('SELECT 1'); // Простой запрос для проверки
    client.release();

    const directDb = drizzle(directPool, { schema });
    return { db: directDb, pool: directPool };
  } catch (error) {
    await directPool.end(); // Обязательно закрываем пул при ошибке
    throw error;
  }
}

// Функция для выполнения запроса с временным соединением
export async function withTempDbConnection<T>(
  callback: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const { db, pool } = await createDirectDbConnection(); // Используем прямое соединение

  try {
    const result = await callback(db);
    return result;
  } finally {
    // Всегда закрываем пул соединений после использования
    await pool.end();
  }
}
