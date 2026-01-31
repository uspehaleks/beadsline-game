import type { LevelConfig } from '../levelTypes';

export const level2: LevelConfig = {
  id: 2,
  name: "Zigzag Path",
  nameRu: "Зигзаг",
  description: "Sharp turns challenge your aim",
  descriptionRu: "Резкие повороты бросают вызов вашей точности",
  path: {
    type: 'zigzag',
    segments: 500,
    amplitude: 0.35,
    frequency: 4,
  },
  difficulty: 'easy',
  initialBalls: 5,
  targetBalls: 45,
  maxBalls: 55,
  speed: { base: 0.012, max: 0.018 },
  colors: 5,
  unlockCondition: 1,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};