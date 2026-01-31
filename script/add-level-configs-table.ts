#!/usr/bin/env node

// Скрипт для добавления недостающей таблицы level_configs
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function addLevelConfigsTable() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  console.log('Attempting to connect to database...');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Checking if level_configs table exists...');
    
    // Проверяем, существует ли таблица
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'level_configs'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('Table level_configs already exists');
    } else {
      console.log('Creating level_configs table...');
      
      // Создаем таблицу
      await pool.query(`
        CREATE TABLE "level_configs" (
          "id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
          "level_id" integer NOT NULL UNIQUE,
          "config" jsonb NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      // Создаем индекс
      await pool.query(`
        CREATE INDEX IF NOT EXISTS "idx_level_configs_level_id" ON "level_configs" ("level_id");
      `);
      
      console.log('Table level_configs created successfully!');
    }
  } catch (error) {
    console.error('Error managing level_configs table:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

addLevelConfigsTable();