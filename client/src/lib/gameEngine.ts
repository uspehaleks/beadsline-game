import type { Ball, BallColor, CryptoType, GameState, GameEconomyConfig } from "@shared/schema";
import { GAME_CONFIG, calculateDynamicSpeed } from "./gameConfig";

const BALL_RADIUS = GAME_CONFIG.balls.radius;
const SHOOTER_BALL_SPEED = GAME_CONFIG.balls.shooterSpeed;
const COLLISION_RADIUS_MULTIPLIER = GAME_CONFIG.balls.collisionRadius;

const BALL_COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
const CRYPTO_TYPES: CryptoType[] = ['btc', 'eth', 'usdt'];

const DEFAULT_ECONOMY: GameEconomyConfig = {
  points: { normal: 100, btc: 500, eth: 300, usdt: 200 },
  combo: { multiplier: 1.5, maxChain: 10 },
  crypto: { spawnChance: 0.08 },
};

let currentEconomy: GameEconomyConfig = DEFAULT_ECONOMY;

export function setEconomyConfig(config: GameEconomyConfig) {
  currentEconomy = config;
}

export function getEconomyConfig(): GameEconomyConfig {
  return currentEconomy;
}

export interface PathPoint {
  x: number;
  y: number;
}

export function generatePath(width: number, height: number): PathPoint[] {
  const points: PathPoint[] = [];
  const { segments, spiralTurns, outerRadius, innerRadius } = GAME_CONFIG.path;
  
  const centerX = width / 2;
  const centerY = height * 0.48;
  const maxRadius = Math.min(width, height) * outerRadius;
  const minRadius = Math.min(width, height) * innerRadius;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 * spiralTurns;
    const radius = maxRadius - (maxRadius - minRadius) * t;
    
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    points.push({ x, y });
  }
  
  return points;
}

export function getShooterPosition(width: number, height: number): { x: number; y: number } {
  return {
    x: width / 2,
    y: height * 0.48,
  };
}

export function getPositionOnPath(path: PathPoint[], progress: number): { x: number; y: number } {
  if (progress < 0) {
    return path[0] || { x: 0, y: 0 };
  }
  
  const clampedProgress = Math.min(1, progress);
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

export interface AvailableCrypto {
  btc: boolean;
  eth: boolean;
  usdt: boolean;
}

export interface FundSettings {
  cryptoAvailable: AvailableCrypto;
  usdtFundEnabled: boolean;
}

let availableCrypto: AvailableCrypto = { btc: true, eth: true, usdt: true };
let usdtFundEnabled: boolean = false;

export function setAvailableCrypto(crypto: AvailableCrypto) {
  availableCrypto = crypto;
}

export function getAvailableCrypto(): AvailableCrypto {
  return availableCrypto;
}

export function setUsdtFundEnabled(enabled: boolean) {
  usdtFundEnabled = enabled;
}

export function getUsdtFundEnabled(): boolean {
  return usdtFundEnabled;
}

export function createRandomBall(id: string, pathProgress: number = 0): Ball {
  const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  
  const spawnChance = currentEconomy.crypto.spawnChance;
  
  const isUsdtFundBall = usdtFundEnabled && Math.random() < spawnChance;
  
  if (isUsdtFundBall) {
    return {
      id,
      x: 0,
      y: 0,
      color,
      isUsdtFund: true,
      radius: BALL_RADIUS,
      pathProgress,
    };
  }
  
  const availableTypes = CRYPTO_TYPES.filter(type => availableCrypto[type] === true);
  const hasCryptoAvailable = availableTypes.length > 0;
  const isCrypto = hasCryptoAvailable && Math.random() < spawnChance;
  
  const crypto = isCrypto 
    ? availableTypes[Math.floor(Math.random() * availableTypes.length)] 
    : undefined;
  
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
  const startOffset = -GAME_CONFIG.spawn.buffer;
  
  for (let i = 0; i < count; i++) {
    const ball = createRandomBall(`ball-${i}`, startOffset + i * spacing);
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
    timeLeft: 0,
    cryptoCollected: { btc: 0, eth: 0, usdt: 0 },
    usdtFundCollected: 0,
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

export function processRollback(balls: Ball[], deltaTime: number): Ball[] {
  if (balls.length < 2) return balls;
  
  const spacing = GAME_CONFIG.balls.spacing;
  const rollbackSpeed = 0.03;
  const rollbackAmount = rollbackSpeed * deltaTime * 0.001;
  
  const newBalls = [...balls];
  
  for (let i = 1; i < newBalls.length; i++) {
    const currentBall = newBalls[i];
    const prevBall = newBalls[i - 1];
    
    const gap = currentBall.pathProgress - prevBall.pathProgress;
    const targetGap = spacing;
    
    if (gap > targetGap * 1.5) {
      const newProgress = Math.max(
        prevBall.pathProgress + targetGap,
        currentBall.pathProgress - rollbackAmount
      );
      
      newBalls[i] = {
        ...currentBall,
        pathProgress: newProgress,
      };
    }
  }
  
  return newBalls;
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
  usdtFundCollected: number;
} {
  let points = 0;
  const cryptoCollected = { btc: 0, eth: 0, usdt: 0 };
  let usdtFundCollected = 0;
  const economy = currentEconomy;
  
  for (const ball of matchedBalls) {
    if (ball.isUsdtFund) {
      points += economy.points.usdt;
      usdtFundCollected++;
    } else if (ball.crypto) {
      points += economy.points[ball.crypto];
      cryptoCollected[ball.crypto]++;
    } else {
      points += economy.points.normal;
    }
  }
  
  const comboMultiplier = Math.pow(economy.combo.multiplier, Math.min(combo, economy.combo.maxChain));
  points = Math.round(points * comboMultiplier);
  
  return { points, cryptoCollected, usdtFundCollected };
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
  balls: Ball[],
  path: PathPoint[]
): { index: number; insertBefore: boolean } | null {
  const collisionDistance = BALL_RADIUS * COLLISION_RADIUS_MULTIPLIER;
  
  let closestIndex = -1;
  let closestDistance = Infinity;
  
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.pathProgress < 0) continue;
    
    const dx = projectileX - ball.x;
    const dy = projectileY - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < collisionDistance && distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }
  
  if (closestIndex === -1) return null;
  
  const hitBall = balls[closestIndex];
  
  const projectileProgress = findClosestProgressOnPath(projectileX, projectileY, path);
  
  const insertBefore = projectileProgress < hitBall.pathProgress;
  
  return { index: closestIndex, insertBefore };
}

export function checkPathCollision(
  projectileX: number,
  projectileY: number,
  prevX: number,
  prevY: number,
  balls: Ball[],
  path: PathPoint[]
): { index: number; insertBefore: boolean } | null {
  const directHit = checkCollision(projectileX, projectileY, balls, path);
  if (directHit) return directHit;
  
  const dx = projectileX - prevX;
  const dy = projectileY - prevY;
  const stepDistance = Math.sqrt(dx * dx + dy * dy);
  
  if (stepDistance > BALL_RADIUS) {
    const steps = Math.ceil(stepDistance / (BALL_RADIUS * 0.5));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = prevX + dx * t;
      const checkY = prevY + dy * t;
      
      const hit = checkCollision(checkX, checkY, balls, path);
      if (hit) return hit;
    }
  }
  
  return null;
}

function findClosestProgressOnPath(x: number, y: number, path: PathPoint[]): number {
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  for (let i = 0; i < path.length; i++) {
    const dx = x - path[i].x;
    const dy = y - path[i].y;
    const dist = dx * dx + dy * dy;
    if (dist < closestDistance) {
      closestDistance = dist;
      closestIndex = i;
    }
  }
  
  return closestIndex / (path.length - 1);
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

export function spawnBallAtStart(balls: Ball[]): Ball[] {
  const spacing = GAME_CONFIG.balls.spacing;
  const newBall = createRandomBall(`spawn-${Date.now()}`, 0);
  
  const shiftedBalls = balls.map(ball => ({
    ...ball,
    pathProgress: ball.pathProgress + spacing,
  }));
  
  return [newBall, ...shiftedBalls];
}

export function checkGameOver(balls: Ball[]): boolean {
  return balls.some(ball => ball.pathProgress >= 1);
}

export function checkWin(balls: Ball[]): boolean {
  return balls.length === 0;
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
  btc: '₿',
  eth: 'Ξ',
  usdt: '₮',
};

export { BALL_RADIUS, SHOOTER_BALL_SPEED };
