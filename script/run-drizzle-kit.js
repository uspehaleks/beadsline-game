#!/usr/bin/env node

// script/run-drizzle-kit.js
import 'dotenv/config';
import { spawn } from 'child_process';

// Запускаем drizzle-kit с теми же аргументами
const args = process.argv.slice(2);
const drizzleKit = spawn('npx', ['drizzle-kit', ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Убедимся, что переменные из .env переопределяют системные
    DATABASE_URL: process.env.DATABASE_URL,
  },
});

drizzleKit.on('error', (error) => {
  console.error('Drizzle-kit error:', error);
  process.exit(1);
});

drizzleKit.on('close', (code) => {
  process.exit(code);
});