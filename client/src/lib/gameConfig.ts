export const GAME_CONFIG = {
  path: {
    type: 'spiral' as const,
    segments: 600,
    spiralTurns: 3.5,
    outerRadius: 0.42,
    innerRadius: 0.08,
  },
  
  balls: {
    radius: 16,
    spacing: 0.016,
    initialCount: 50,
    shooterSpeed: 16,
    collisionRadius: 2.0,
  },
  
  speed: {
    base: 0.003,
    max: 0.006,
    accelerationStart: 0.85,
  },
  
  gameplay: {
    winCondition: 5000,
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
