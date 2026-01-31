#!/usr/bin/env node

// Загружаем переменные окружения из всех возможных .env файлов
import { config } from 'dotenv';
config({ path: '.env.local' }); // Загружаем .env.local
config({ path: '.env' }); // Загружаем .env (на всякий случай)

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDirectDbConnection } from '../server/db.ts';

async function runMigrations() {
  try {
    console.log('Запуск миграций базы данных...');

    // Используем временное соединение для миграций
    const { db } = await createDirectDbConnection();
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Миграции успешно выполнены!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении миграций:', error);
    process.exit(1);
  }
}

runMigrations();