import { LEVELS, getLevelById, type LevelConfig } from './lib/levelConfig';

// Простая проверка, что импорты работают
console.log('Количество уровней:', LEVELS.length);
console.log('Уровень 1:', getLevelById(1)?.name);