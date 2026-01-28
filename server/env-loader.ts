// env-loader.ts - Загрузчик переменных окружения
import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные из .env файла с переопределением существующих
const result = config({ override: true });

if (result.error) {
  console.warn('Could not load .env file:', result.error.message);
} else {
  console.log('Environment variables loaded from .env file with override');
}

// Экспортируем для использования в других модулях
export default result;