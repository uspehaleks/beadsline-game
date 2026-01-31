import type { LevelConfig } from '../levelTypes';

export const level6: LevelConfig = {
  id: 6,
  name: "Heart Path",
  nameRu: "Сердце",
  description: "Love-shaped challenge",
  descriptionRu: "Путь в форме сердца",
  path: {
    type: 'heart',
    segments: 600,
  },
  difficulty: 'medium',
  initialBalls: 7,
  targetBalls: 55,
  maxBalls: 65,
  speed: { base: 0.013, max: 0.020 },
  colors: 6,
  unlockCondition: 5,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};