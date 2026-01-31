import type { LevelConfig } from '../levelTypes';

export const level9: LevelConfig = {
  id: 9,
  name: "Chaos Wave",
  nameRu: "Хаос волна",
  description: "Complex wave pattern",
  descriptionRu: "Сложный волновой паттерн",
  path: {
    type: 'wave',
    segments: 700,
    amplitude: 0.25,
    frequency: 5,
  },
  difficulty: 'hard',
  initialBalls: 10,
  targetBalls: 75,
  maxBalls: 85,
  speed: { base: 0.017, max: 0.026 },
  colors: 8,
  unlockCondition: 8,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};