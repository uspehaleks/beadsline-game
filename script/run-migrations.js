#!/usr/bin/env node

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../server/db.js';

async function runMigrations() {
  try {
    console.log('Запуск миграций базы данных...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Миграции успешно выполнены!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении миграций:', error);
    process.exit(1);
  }
}

runMigrations();