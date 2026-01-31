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
  cryptoSpawnChance?: number; // Шанс спавна крипто-шариков для этого уровня
}