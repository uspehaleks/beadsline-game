import type { LevelConfig } from '../levelTypes';

export const level5: LevelConfig = {
  id: 5,
  name: "Tight Spiral",
  nameRu: "Тугая спираль",
  description: "More turns, less space",
  descriptionRu: "Больше витков, меньше места",
  path: {
    type: 'spiral',
    segments: 700,
    spiralTurns: 4.5,
    outerRadius: 0.40,
    innerRadius: 0.12,
  },
  difficulty: 'medium',
  initialBalls: 7,
  targetBalls: 60,
  maxBalls: 70,
  speed: { base: 0.014, max: 0.022 },
  colors: 6,
  unlockCondition: 4,
  ballSpacing: 0.013,
  spawnPeriod: 1200,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};