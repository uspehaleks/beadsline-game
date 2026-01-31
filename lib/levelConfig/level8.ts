import type { LevelConfig } from '../levelTypes';

export const level8: LevelConfig = {
  id: 8,
  name: "Extreme Zigzag",
  nameRu: "Экстремальный зигзаг",
  description: "Fast and furious turns",
  descriptionRu: "Быстрые и яростные повороты",
  path: {
    type: 'zigzag',
    segments: 600,
    amplitude: 0.30,
    frequency: 8,
  },
  difficulty: 'hard',
  initialBalls: 8,
  targetBalls: 70,
  maxBalls: 80,
  speed: { base: 0.016, max: 0.024 },
  colors: 7,
  unlockCondition: 7,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};