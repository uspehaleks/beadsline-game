import type { Ball, GameState, CryptoType } from "@shared/schema";
import { GAME_CONFIG } from "./gameConfig";
import type { LevelPath } from "./levelTypes";

const BALL_RADIUS = GAME_CONFIG.balls.radius;
const COLLISION_RADIUS_MULTIPLIER = GAME_CONFIG.balls.collisionRadius;

/**
 * Calculates distance between two points
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates angle between two points in radians
 */
export function calculateAngle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Checks if two balls collide based on their positions
 */
export function checkCollision(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): boolean {
  const distance = calculateDistance(x1, y1, x2, y2);
  return distance < BALL_RADIUS * COLLISION_RADIUS_MULTIPLIER * 2;
}

/**
 * Finds the closest progress value on a path for a given position
 */
export function findClosestProgressOnPath(x: number, y: number, path: LevelPath): number {
  let closestDistance = Infinity;
  let closestProgress = 0;

  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    const distance = calculateDistance(x, y, point.x, point.y);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestProgress = point.progress;
    }
  }

  return closestProgress;
}

/**
 * Calculates trajectory intersection with path
 */
export function calculateTrajectoryIntersection(
  startX: number,
  startY: number,
  velocityX: number,
  velocityY: number,
  path: LevelPath
): { x: number; y: number; progress: number } | null {
  // Simplified calculation - in a real implementation, this would be more complex
  const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  if (speed === 0) return null;

  const directionX = velocityX / speed;
  const directionY = velocityY / speed;

  // Move along the trajectory until we intersect with the path
  for (let t = 0; t < 1000; t += 5) { // Limit iterations to prevent infinite loops
    const projX = startX + directionX * t;
    const projY = startY + directionY * t;

    const progress = findClosestProgressOnPath(projX, projY, path);
    
    // Find the closest point on the path
    let closestPoint = null;
    let minDist = Infinity;
    
    for (const point of path) {
      const dist = calculateDistance(projX, projY, point.x, point.y);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }

    if (closestPoint && minDist < BALL_RADIUS * COLLISION_RADIUS_MULTIPLIER) {
      return {
        x: closestPoint.x,
        y: closestPoint.y,
        progress: closestPoint.progress
      };
    }
  }

  return null;
}

/**
 * Calculates points earned from matched balls
 */
export function calculatePoints(matchedBalls: Ball[], combo: number, economy: any) {
  let points = 0;
  const cryptoCollected = { btc: 0, eth: 0, usdt: 0 };
  let usdtFundCollected = 0;

  for (const ball of matchedBalls) {
    if (ball.isUsdtFund) {
      // USDT fund balls: no points, only crypto reward
      usdtFundCollected++;
    } else if (ball.crypto) {
      // Crypto balls: no points, only crypto reward
      cryptoCollected[ball.crypto]++;
    } else {
      // Regular balls: give points (Beads)
      points += economy.points.normal;
    }
  }

  const comboMultiplier = Math.pow(economy.combo.multiplier, Math.min(combo, economy.combo.maxChain));
  points = Math.round(points * comboMultiplier);

  return { points, cryptoCollected, usdtFundCollected };
}

/**
 * Checks if a ball collides with any ball in the chain
 */
export function checkPathCollision(
  projectileX: number,
  projectileY: number,
  balls: Ball[],
  path: LevelPath
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

  // Determine if we should insert before or after the hit ball
  const insertBefore = Math.abs(hitBall.pathProgress - projectileProgress) < 0.01
    ? projectileProgress < hitBall.pathProgress
    : hitBall.pathProgress > projectileProgress;

  return { index: closestIndex, insertBefore };
}

/**
 * Converts a value to number with fallback
 */
export function toNumber(val: string | number | undefined, fallback: number): number {
  if (val === undefined || val === null) return fallback;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? fallback : num;
}

/**
 * Generates a random element from an array
 */
export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Checks if a point is inside a circle
 */
export function isPointInCircle(
  pointX: number, 
  pointY: number, 
  circleX: number, 
  circleY: number, 
  radius: number
): boolean {
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Calculates the Euclidean distance between two points
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Normalizes an angle to the range [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Checks if two angles are close to each other within a tolerance
 */
export function areAnglesClose(angle1: number, angle2: number, tolerance: number = 0.1): boolean {
  const normalized1 = normalizeAngle(angle1);
  const normalized2 = normalizeAngle(angle2);
  
  // Handle wraparound cases
  const diff1 = Math.abs(normalized1 - normalized2);
  const diff2 = 2 * Math.PI - diff1;
  
  return Math.min(diff1, diff2) < tolerance;
}