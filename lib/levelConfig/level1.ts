import type { LevelConfig } from '../levelTypes';

export const level1: LevelConfig = {
  id: 1,
  name: "Classic Spiral",
  nameRu: "Классическая спираль",
  description: "The original spiral path",
  descriptionRu: "Классический спиральный путь",
  path: {
    type: 'spiral',
    segments: 600,
    spiralTurns: 3.5, // 3.5 витков спирали
    outerRadius: 0.35, // Уменьшили внешний радиус, чтобы спираль не выходила за края
    innerRadius: 0.20, // Увеличили внутренний радиус для более широкой спирали
  },
  difficulty: 'easy',
  initialBalls: 4, // Уменьшили начальные шары для лучшей видимости
  targetBalls: 35, // Уменьшили целевые шары
  maxBalls: 45, // Уменьшили максимальные шары
  speed: { base: 0.012, max: 0.020 }, // Уменьшили скорость для лучшего контроля
  colors: 3, // Уменьшили количество цветов для простоты
  unlockCondition: null,
  cryptoSpawnChance: 0.03, // Уменьшили шанс крипто-шариков для простоты
  ballSpacing: 0.025, // Увеличили расстояние между шарами для лучшей видимости
  spawnPeriod: 2200, // Увеличили период появления для менее плотного потока
  // Дополнительные параметры для визуальной оптимизации на разных экранах:
  // viewportPadding: 0.1, // Отступы по краям для лучшей видимости спирали
  // aspectRatio: 0.75, // Соотношение сторон для оптимального отображения спирали
};