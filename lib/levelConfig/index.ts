import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';
import { level10 } from './level10';
import type { LevelConfig } from '../levelTypes';

export const LEVELS = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
];

export { 
  level1, 
  level2, 
  level3, 
  level4, 
  level5, 
  level6, 
  level7, 
  level8, 
  level9, 
  level10 
};

export { getLevelById, getUnlockedLevels, isLevelUnlocked, getDifficultyColor, getDifficultyBgColor, getDifficultyLabel } from '../levelManager';
export type { LevelConfig };