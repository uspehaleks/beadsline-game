import type { LevelConfig } from '../levelTypes';

export const level10: LevelConfig = {
  id: 10,
  name: "Ultimate Spiral",
  nameRu: "Ультимативная спираль",
  description: "The final challenge",
  descriptionRu: "Финальное испытание",
  path: {
    type: 'spiral',
    segments: 800,
    spiralTurns: 5.5,
    outerRadius: 0.44,
    innerRadius: 0.10,
  },
  difficulty: 'hard',
  initialBalls: 12,
  targetBalls: 80,
  maxBalls: 90,
  speed: { base: 0.015, max: 0.024 },
  colors: 8,
  unlockCondition: 9,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};