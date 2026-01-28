import { Pool, Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleWithLogger } from 'drizzle-orm/node-postgres';
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

// Добавляем sslmode=require к строке подключения, если его нет
function ensureSslMode(connectionString: string): string {
  if (!connectionString.includes('sslmode=')) {
    return connectionString + (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return connectionString;
}

// Определяем, какой URL использовать для основного подключения
const connectionTarget = ensureSslMode(DATABASE_URL);
const { host, port } = parseConnectionString(connectionTarget);

console.log("Attempting to connect to database...");
console.log("Connecting to host:", host, "on port:", port);
console.log("DATABASE_URL exists:", !!DATABASE_URL);
console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
console.log("DATABASE_URL being used:", DATABASE_URL ? DATABASE_URL.substring(0, 50) + "..." : "UNDEFINED");

// Для совместимости с существующим кодом (например, для сессий)
// создаем пул с минимальными настройками для serverless
export const pool = new Pool({
  connectionString: connectionTarget,
  ssl: {
    rejectUnauthorized: false
  },
  // Минимальные настройки для serverless
  connectionTimeoutMillis: 1000,
  idleTimeoutMillis: 5000,
  max: 1 // Только одно соединение
});

// Для serverless среды Vercel используем Client вместо Pool для выполнения запросов
// Создаем функцию для получения соединения по требованию
export async function getDbClient() {
  const client = new Client({
    connectionString: connectionTarget,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();
  return client;
}

// Функция для выполнения запроса с временным соединением
export async function withDbTransaction<T>(
  callback: (db: ReturnType<typeof drizzleWithLogger>) => Promise<T>
): Promise<T> {
  const client = await getDbClient();

  try {
    // Создаем Drizzle DB с логированием для отладки
    const db = drizzleWithLogger(client, {
      schema,
      logger: true  // Включаем логирование для просмотра запросов
    });

    const result = await callback(db);
    return result;
  } finally {
    await client.end(); // Обязательно закрываем соединение
  }
}

// Создаем Drizzle DB с логированием для совместимости с существующим кодом
export const db = drizzle(pool, {
  schema,
  logger: true  // Включаем логирование для просмотра запросов
});

// Функция для создания временного соединения для миграций и инициализации
// Использует DIRECT_URL (порт 5432) для прямого подключения
export async function createDirectDbConnection() {
  let directUrl = process.env.DIRECT_URL || DATABASE_URL;

  if (!directUrl) {
    throw new Error("Either DIRECT_URL or DATABASE_URL must be set");
  }

  directUrl = ensureSslMode(directUrl); // Добавляем sslmode=require

  const { host: directHost, port: directPort } = parseConnectionString(directUrl);

  console.log("Creating direct connection to host:", directHost, "on port:", directPort);

  const client = new Client({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // Создаем Drizzle DB с логированием для совместимости
    const directDb = drizzleWithLogger(client, {
      schema,
      logger: true  // Включаем логирование
    });
    return { db: directDb, client };
  } catch (error) {
    await client.end(); // Обязательно закрываем клиент при ошибке
    throw error;
  }
}

// Функция для выполнения запроса с временным соединением
export async function withTempDbConnection<T>(
  callback: (db: ReturnType<typeof drizzleWithLogger>) => Promise<T>
): Promise<T> {
  const { db, client } = await createDirectDbConnection(); // Используем прямое соединение

  try {
    const result = await callback(db);
    return result;
  } finally {
    // Всегда закрываем клиент соединения после использования
    await client.end();
  }
}
