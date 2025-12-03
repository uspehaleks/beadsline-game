import type { Ball, BallColor, CryptoType, GameState } from "@shared/schema";
import { GAME_CONFIG, calculateDynamicSpeed } from "./gameConfig";

const BALL_RADIUS = GAME_CONFIG.balls.radius;
const SHOOTER_BALL_SPEED = GAME_CONFIG.balls.shooterSpeed;
const GAME_DURATION = GAME_CONFIG.gameplay.duration;
const WIN_CONDITION = GAME_CONFIG.gameplay.winCondition;

const BALL_COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
const CRYPTO_TYPES: CryptoType[] = ['btc', 'eth', 'usdt'];

const CRYPTO_DROP_RATE = GAME_CONFIG.crypto.dropRate;
const CRYPTO_POINTS = GAME_CONFIG.crypto.points;

const BASE_POINTS = GAME_CONFIG.scoring.basePoints;
const COMBO_MULTIPLIER = GAME_CONFIG.scoring.comboMultiplier;

export interface PathPoint {
  x: number;
  y: number;
}

export function generatePath(width: number, height: number): PathPoint[] {
  const points: PathPoint[] = [];
  const { segments, amplitude, frequency, startY, endY } = GAME_CONFIG.path;
  const amp = width * amplitude;
  const centerX = width / 2;
  const yStart = height * startY;
  const yEnd = height * endY;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = yStart + (yEnd - yStart) * t;
    const x = centerX + amp * Math.sin(t * Math.PI * frequency);
    points.push({ x, y });
  }
  
  return points;
}

export function getPositionOnPath(path: PathPoint[], progress: number): { x: number; y: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const index = clampedProgress * (path.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  
  if (lowerIndex === upperIndex || upperIndex >= path.length) {
    return path[lowerIndex] || path[path.length - 1];
  }
  
  const fraction = index - lowerIndex;
  const lower = path[lowerIndex];
  const upper = path[upperIndex];
  
  return {
    x: lower.x + (upper.x - lower.x) * fraction,
    y: lower.y + (upper.y - lower.y) * fraction,
  };
}

export function createRandomBall(id: string, pathProgress: number = 0): Ball {
  const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  const isCrypto = Math.random() < CRYPTO_DROP_RATE;
  const crypto = isCrypto ? CRYPTO_TYPES[Math.floor(Math.random() * CRYPTO_TYPES.length)] : undefined;
  
  return {
    id,
    x: 0,
    y: 0,
    color,
    crypto,
    radius: BALL_RADIUS,
    pathProgress,
  };
}

export function createInitialBalls(count: number): Ball[] {
  const balls: Ball[] = [];
  const spacing = GAME_CONFIG.balls.spacing;
  
  for (let i = 0; i < count; i++) {
    const ball = createRandomBall(`ball-${i}`, i * spacing);
    balls.push(ball);
  }
  
  return balls;
}

export function createInitialGameState(): GameState {
  return {
    balls: createInitialBalls(GAME_CONFIG.balls.initialCount),
    shooterBall: createRandomBall('shooter'),
    nextBall: createRandomBall('next'),
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: GAME_DURATION,
    cryptoCollected: { btc: 0, eth: 0, usdt: 0 },
    isPlaying: false,
    isGameOver: false,
    won: false,
    shotsTotal: 0,
    shotsHit: 0,
  };
}

export function updateBallPositions(balls: Ball[], path: PathPoint[]): Ball[] {
  return balls.map(ball => {
    const position = getPositionOnPath(path, ball.pathProgress);
    return { ...ball, x: position.x, y: position.y };
  });
}

export function moveBallsForward(balls: Ball[], deltaTime: number): Ball[] {
  return balls.map(ball => {
    const dynamicSpeed = calculateDynamicSpeed(ball.pathProgress);
    const moveAmount = dynamicSpeed * deltaTime * 0.001;
    return {
      ...ball,
      pathProgress: ball.pathProgress + moveAmount,
    };
  });
}

export function findMatchingBalls(balls: Ball[], insertIndex: number, color: BallColor): number[] {
  const matches: number[] = [insertIndex];
  
  let left = insertIndex - 1;
  while (left >= 0 && balls[left].color === color) {
    matches.unshift(left);
    left--;
  }
  
  let right = insertIndex + 1;
  while (right < balls.length && balls[right].color === color) {
    matches.push(right);
    right++;
  }
  
  return matches.length >= 3 ? matches : [];
}

export function calculatePoints(matchedBalls: Ball[], combo: number): {
  points: number;
  cryptoCollected: { btc: number; eth: number; usdt: number };
} {
  let points = 0;
  const cryptoCollected = { btc: 0, eth: 0, usdt: 0 };
  
  for (const ball of matchedBalls) {
    if (ball.crypto) {
      points += CRYPTO_POINTS[ball.crypto];
      cryptoCollected[ball.crypto]++;
    } else {
      points += BASE_POINTS;
    }
  }
  
  const comboMultiplier = Math.pow(COMBO_MULTIPLIER, Math.min(combo, GAME_CONFIG.scoring.maxComboStack));
  points = Math.round(points * comboMultiplier);
  
  return { points, cryptoCollected };
}

export function insertBallInChain(
  balls: Ball[],
  shooterBall: Ball,
  insertIndex: number
): Ball[] {
  const newBalls = [...balls];
  const spacing = GAME_CONFIG.balls.spacing;
  
  const insertProgress = insertIndex < balls.length 
    ? balls[insertIndex].pathProgress 
    : (balls[balls.length - 1]?.pathProgress || 0) + spacing;
  
  const insertedBall: Ball = {
    ...shooterBall,
    id: `ball-${Date.now()}`,
    pathProgress: insertProgress,
  };
  
  for (let i = insertIndex; i < newBalls.length; i++) {
    newBalls[i] = {
      ...newBalls[i],
      pathProgress: newBalls[i].pathProgress + spacing,
    };
  }
  
  newBalls.splice(insertIndex, 0, insertedBall);
  
  return newBalls;
}

export function removeBalls(balls: Ball[], indices: number[]): Ball[] {
  const sortedIndices = [...indices].sort((a, b) => b - a);
  const newBalls = [...balls];
  
  for (const index of sortedIndices) {
    newBalls.splice(index, 1);
  }
  
  return newBalls;
}

export function checkCollision(
  projectileX: number,
  projectileY: number,
  balls: Ball[]
): { index: number; insertBefore: boolean } | null {
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const dx = projectileX - ball.x;
    const dy = projectileY - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < BALL_RADIUS * 2) {
      const nextBall = balls[i + 1];
      if (nextBall) {
        const dxNext = projectileX - nextBall.x;
        const dyNext = projectileY - nextBall.y;
        const distanceNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);
        
        if (distanceNext < distance) {
          return { index: i + 1, insertBefore: true };
        }
      }
      
      return { index: i, insertBefore: ball.y > projectileY };
    }
  }
  
  return null;
}

export function addNewBallsToChain(balls: Ball[], count: number): Ball[] {
  const newBalls = [...balls];
  const spacing = GAME_CONFIG.balls.spacing;
  
  for (let i = 0; i < count; i++) {
    const lastProgress = newBalls.length > 0 
      ? newBalls[newBalls.length - 1].pathProgress 
      : 0;
    const newBall = createRandomBall(`new-${Date.now()}-${i}`, lastProgress + spacing);
    newBalls.push(newBall);
  }
  
  return newBalls;
}

export function checkGameOver(balls: Ball[]): boolean {
  return balls.some(ball => ball.pathProgress >= 1);
}

export function checkWin(score: number): boolean {
  return score >= WIN_CONDITION;
}

export const BALL_COLOR_MAP: Record<BallColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
};

export const CRYPTO_COLOR_MAP: Record<CryptoType, string> = {
  btc: '#f7931a',
  eth: '#627eea',
  usdt: '#26a17b',
};

export const CRYPTO_SYMBOL_MAP: Record<CryptoType, string> = {
  btc: '\u20BF',
  eth: '\u039E',
  usdt: '\u20AE',
};

export { BALL_RADIUS, SHOOTER_BALL_SPEED, GAME_DURATION, WIN_CONDITION };
