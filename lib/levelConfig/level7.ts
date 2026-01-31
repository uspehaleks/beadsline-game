import type { LevelConfig } from '../levelTypes';

export const level7: LevelConfig = {
  id: 7,
  name: "Infinity Loop",
  nameRu: "Бесконечность",
  description: "Figure-eight path",
  descriptionRu: "Путь в форме восьмёрки",
  path: {
    type: 'infinity',
    segments: 650,
  },
  difficulty: 'hard',
  initialBalls: 8,
  targetBalls: 65,
  maxBalls: 75,
  speed: { base: 0.015, max: 0.023 },
  colors: 7,
  unlockCondition: 6,
  cryptoSpawnChance: 0.08, // Шанс спавна крипто-шариков
};