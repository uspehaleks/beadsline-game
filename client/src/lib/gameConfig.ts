export const GAME_CONFIG = {
  path: {
    segments: 350,
    amplitude: 0.35,
    frequency: 3.5,
    startY: 0.1,
    endY: 0.9,
  },
  
  balls: {
    radius: 18,
    spacing: 0.028,
    initialCount: 25,
    shooterSpeed: 12,
  },
  
  speed: {
    base: 0.008,
    max: 0.035,
    accelerationCurve: 2.0,
  },
  
  gameplay: {
    duration: 60,
    winCondition: 5000,
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
  const { base, max, accelerationCurve } = GAME_CONFIG.speed;
  
  const clampedProgress = Math.max(0, Math.min(1, pathProgress));
  
  const progressFactor = Math.pow(clampedProgress, accelerationCurve);
  
  const speed = base + (max - base) * progressFactor;
  
  return Math.min(speed, max);
}

export type GameConfig = typeof GAME_CONFIG;
