import type { LevelConfig } from '../levelTypes';

export const level4: LevelConfig = {
  id: 4,
  name: "S-Curve",
  nameRu: "S-образный",
  description: "Double curve path",
  descriptionRu: "Путь в форме буквы S",
  path: {
    type: 'sShape',
    segments: 500,
    amplitude: 0.30,
  },
  difficulty: 'medium',
  initialBalls: 6,
  targetBalls: 55,
  maxBalls: 65,
  speed: { base: 0.014, max: 0.021 },
  colors: 6,
  unlockCondition: 3,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};