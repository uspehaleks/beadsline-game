export const GAME_CONFIG = {
  path: {
    type: 'spiral' as const,
    segments: 600,
    spiralTurns: 3.5, // 3.5 витков спирали
    outerRadius: 0.42,
    innerRadius: 0.15,
  },

  balls: {
    radius: 14,
    spacing: 0.024,
    initialCount: 5,
    targetCount: 50,
    shooterSpeed: 18,
    collisionRadius: 2.2,
  },

  spawn: {
    period: 1800,
    buffer: 0.012,
    resumeThreshold: 35,
  },

  speed: {
    base: 0.0005, // Жесткая константа SPEED = 0.0005
    max: 0.0005,  // Максимальная скорость также 0.0005 для постоянной скорости
    accelerationStart: 1.0, // Отключаем ускорение (начинается при 100% прогрессе)
  },

  gameplay: {
    maxTotalBalls: 60,
    addBallsInterval: 4000,
    addBallsCount: 3,
  },

  crypto: {
    dropRate: 0.08,
    points: {
      btc: 500,
      eth: 300,
      usdt: 200,
    },
  },

  scoring: {
    basePoints: 100,
    comboMultiplier: 1.5,
    maxComboStack: 10,
  },
};

export function calculateDynamicSpeed(pathProgress: number): number {
  const { base, max, accelerationStart } = GAME_CONFIG.speed;
  
  const clampedProgress = Math.max(0, Math.min(1, pathProgress));
  
  if (clampedProgress < accelerationStart) {
    return base;
  }
  
  const accelerationProgress = (clampedProgress - accelerationStart) / (1 - accelerationStart);
  const speed = base + (max - base) * accelerationProgress;
  
  return Math.min(speed, max);
}

export type GameConfig = typeof GAME_CONFIG;
