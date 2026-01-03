export type PathType = 'spiral' | 'zigzag' | 'wave' | 'sShape' | 'heart' | 'infinity';

export interface LevelPath {
  type: PathType;
  segments: number;
  spiralTurns?: number;
  outerRadius?: number;
  innerRadius?: number;
  amplitude?: number;
  frequency?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  path: LevelPath;
  difficulty: 'easy' | 'medium' | 'hard';
  initialBalls: number;
  targetBalls: number;
  maxBalls: number;
  speed: {
    base: number;
    max: number;
  };
  colors: number;
  unlockCondition: number | null;
  ballSpacing?: number;
  spawnPeriod?: number;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Classic Spiral",
    nameRu: "Классическая спираль",
    description: "The original spiral path",
    descriptionRu: "Классический спиральный путь",
    path: {
      type: 'spiral',
      segments: 600,
      spiralTurns: 3.0,
      outerRadius: 0.42,
      innerRadius: 0.15,
    },
    difficulty: 'easy',
    initialBalls: 5,
    targetBalls: 50,
    maxBalls: 60,
    speed: { base: 0.016, max: 0.024 },
    colors: 5,
    unlockCondition: null,
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export function getLevelById(id: number): LevelConfig | undefined {
  return LEVELS.find(level => level.id === id);
}

export function getUnlockedLevels(completedLevels: number[]): LevelConfig[] {
  return LEVELS.filter(level => {
    if (level.unlockCondition === null) return true;
    return completedLevels.includes(level.unlockCondition);
  });
}

export function isLevelUnlocked(levelId: number, completedLevels: number[]): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  if (level.unlockCondition === null) return true;
  return completedLevels.includes(level.unlockCondition);
}

export function getDifficultyColor(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getDifficultyBgColor(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/20';
    case 'medium': return 'bg-yellow-500/20';
    case 'hard': return 'bg-red-500/20';
    default: return 'bg-gray-500/20';
  }
}

export function getDifficultyLabel(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'Лёгкий';
    case 'medium': return 'Средний';
    case 'hard': return 'Сложный';
    default: return difficulty;
  }
}
