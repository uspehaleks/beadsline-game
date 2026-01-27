#!/usr/bin/env node

import { seedDatabase } from './seed-data.js';

async function runSeed() {
  try {
    console.log('Запуск скрипта заполнения базы данных...');
    await seedDatabase();
    console.log('Скрипт заполнения базы данных успешно завершен!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении скрипта заполнения базы данных:', error);
    process.exit(1);
  }
}

runSeed();