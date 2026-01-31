import { Pool, Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleWithLogger } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Определяем URL для подключения в зависимости от назначения
const DATABASE_URL = process.env.DATABASE_URL?.trim();
const DIRECT_URL = process.env.DIRECT_URL?.trim(); // Используем DIRECT_URL для миграций, если доступен
// Если DIRECT_URL не установлен, используем DATABASE_URL как fallback, но с предупреждением
const DIRECT_URL_FOR_MIGRATIONS = process.env.DIRECT_URL?.trim() || DATABASE_URL;

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

    // Логируем первые 3 символа пароля для проверки (только для тестирования!)
    if (url.password && url.password.length >= 3) {
      console.log("First 3 chars of password:", url.password.substring(0, 3));
    } else if (url.password) {
      console.log("Password length:", url.password.length, "chars:", url.password);
    }

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

// Добавляем sslmode=prefer к строке подключения, если его нет (для самоподписанных сертификатов)
function ensureSslMode(connectionString: string): string {
  // Удаляем лишние пробелы в начале и конце строки
  const trimmedConnectionString = connectionString.trim();

  if (!trimmedConnectionString.includes('sslmode=')) {
    return trimmedConnectionString + (trimmedConnectionString.includes('?') ? '&' : '?') + 'sslmode=prefer';
  }
  return trimmedConnectionString;
}

// Определяем, какой URL использовать для основного подключения
const connectionTarget = ensureSslMode(DATABASE_URL);
const { host, port } = parseConnectionString(connectionTarget);

console.log("Attempting to connect to database...");
console.log("Connecting to host:", host, "on port:", port);
console.log("DATABASE_URL exists:", !!DATABASE_URL);
console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
console.log("DATABASE_URL being used:", DATABASE_URL ? DATABASE_URL.substring(0, 50) + "..." : "UNDEFINED");

// Для serverless среды Vercel используем Client вместо Pool для выполнения запросов
// Создаем функцию для получения соединения по требованию
export async function getDbClient() {
  const client = new Client({
    connectionString: connectionTarget,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // Увеличено до 10 секунд
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
      logger: process.env.NODE_ENV === 'development' // Логируем только в разработке
    });

    const result = await callback(db);
    return result;
  } finally {
    await client.end(); // Обязательно закрываем соединение
  }
}

// Для совместимости с существующим кодом (например, для сессий)
// создаем пул с минимальными настройками для serverless
export const pool = new Pool({
  connectionString: connectionTarget,
  ssl: {
    rejectUnauthorized: false
  },
  // Настройки для подключения к Supabase
  connectionTimeoutMillis: 20000, // 20 секунд на подключение
  idleTimeoutMillis: 30000,       // 30 секунд держать соединение
  max: 10                         // ограничь количество одновременных подключений для пулера
});

// Создаем Drizzle DB для использования в API маршрутах
// Используем пул, но с правильными SSL-настройками
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development' // Логируем только в разработке
});

// Экспортируем также функции для использования в API маршрутах
export { sql } from 'drizzle-orm';

// Функция для создания временного соединения для миграций и инициализации
// Использует DIRECT_URL (порт 5432) для прямого подключения
export async function createDirectDbConnection() {
  // Если DIRECT_URL не установлен, используем DATABASE_URL, но с предупреждением
  let directUrl = process.env.DIRECT_URL?.trim();

  if (!directUrl) {
    console.warn("DIRECT_URL is not set. Using DATABASE_URL for direct connection. This may cause issues in production.");
    directUrl = DATABASE_URL;
  }

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
    },
    connectionTimeoutMillis: 10000, // Увеличено до 10 секунд
  });

  try {
    await client.connect();

    // Создаем Drizzle DB с логированием для совместимости
    const directDb = drizzleWithLogger(client, {
      schema,
      logger: process.env.NODE_ENV === 'development' // Логируем только в разработке
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
  try {
    const { db, client } = await createDirectDbConnection(); // Используем прямое соединение

    try {
      const result = await callback(db);
      return result;
    } finally {
      // Всегда закрываем клиент соединения после использования
      await client.end();
    }
  } catch (error) {
    console.error("Error in withTempDbConnection:", error);
    throw error;
  }
}
