import type { LevelConfig } from '../levelTypes';

export const level3: LevelConfig = {
  id: 3,
  name: "Gentle Wave",
  nameRu: "Плавная волна",
  description: "Smooth wave pattern",
  descriptionRu: "Плавный волнообразный путь",
  path: {
    type: 'wave',
    segments: 550,
    amplitude: 0.18,
    frequency: 3,
  },
  difficulty: 'easy',
  initialBalls: 6,
  targetBalls: 50,
  maxBalls: 60,
  speed: { base: 0.013, max: 0.019 },
  colors: 5,
  unlockCondition: 2,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};