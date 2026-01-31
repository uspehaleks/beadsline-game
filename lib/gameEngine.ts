import type { Ball, BallColor, CryptoType, GameState, GameEconomyConfig, GameplayConfig } from "@shared/schema";
import { GAME_CONFIG, calculateDynamicSpeed } from "./gameConfig";
import type { LevelConfig, LevelPath } from "./levelTypes";
import { updateLevelPathMethods } from "./levelManager";
import { getLevelById, generatePathPoints } from "./levelManager";
import {
  calculatePoints as utilsCalculatePoints,
  checkCollision as utilsCheckCollision,
  checkPathCollision as utilsCheckPathCollision,
  findClosestProgressOnPath,
  calculateTrajectoryIntersection,
  toNumber,
  getRandomElement,
  clamp,
  lerp,
  isPointInCircle,
  euclideanDistance,
  normalizeAngle,
  areAnglesClose
} from "./gameUtils";
import { logService } from "./logService";

export const BALL_COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

export const CRYPTO_COLOR_MAP: Record<'btc' | 'eth' | 'usdt', string> = {
  btc: '#f7931a',
  eth: '#627eea',
  usdt: '#26a17b',
};

export const CRYPTO_SYMBOL_MAP: Record<'btc' | 'eth' | 'usdt', string> = {
  btc: '₿',
  eth: 'Ξ',
  usdt: '₮',
};

export const BALL_RADIUS = GAME_CONFIG.balls.radius;
export const SHOOTER_BALL_SPEED = GAME_CONFIG.balls.shooterSpeed;

const ALL_BALL_COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'amber', 'lime', 'violet'];
const CRYPTO_TYPES: CryptoType[] = ['btc', 'eth', 'usdt'];

const DEFAULT_GAMEPLAY: GameplayConfig = {
  balls: { initialCount: 5, targetCount: 50, maxTotalBalls: 60 },
  spawn: { period: 1800, resumeThreshold: 35 },
  speed: { base: 0.010, max: 0.016, accelerationStart: 0.8 },
  colors: { count: 5 },
};

let currentGameplay: GameplayConfig = DEFAULT_GAMEPLAY;

export function setGameplayConfig(config: Partial<GameplayConfig>) {
  const defaults = DEFAULT_GAMEPLAY;
  currentGameplay = {
    balls: {
      initialCount: config.balls?.initialCount ?? defaults.balls.initialCount,
      targetCount: config.balls?.targetCount ?? defaults.balls.targetCount,
      maxTotalBalls: config.balls?.maxTotalBalls ?? defaults.balls.maxTotalBalls,
    },
    spawn: {
      period: config.spawn?.period ?? defaults.spawn.period,
      resumeThreshold: config.spawn?.resumeThreshold ?? defaults.spawn.resumeThreshold,
    },
    speed: {
      base: config.speed?.base ?? defaults.speed.base,
      max: config.speed?.max ?? defaults.speed.max,
      accelerationStart: config.speed?.accelerationStart ?? defaults.speed.accelerationStart,
    },
    colors: {
      count: config.colors?.count ?? defaults.colors.count,
      activeColors: config.colors?.activeColors,
    },
  };
}

export function getGameplayConfig(): GameplayConfig {
  return currentGameplay;
}

function getActiveBallColors(): BallColor[] {
  if (currentGameplay.colors.activeColors && currentGameplay.colors.activeColors.length >= 2) {
    const filtered = currentGameplay.colors.activeColors.filter(c =>
      ALL_BALL_COLORS.includes(c as BallColor)
    ) as BallColor[];
    if (filtered.length >= 2) {
      return filtered;
    }
  }
  const count = Math.max(2, Math.min(10, currentGameplay.colors.count));
  return ALL_BALL_COLORS.slice(0, count);
}

const DEFAULT_ECONOMY: GameEconomyConfig = {
  points: { normal: 5, btc: 500, eth: 300, usdt: 200 },
  combo: { multiplier: 1.5, maxChain: 10 },
  crypto: { spawnChance: 0.08 },
  cryptoRewards: { btcPerBall: 0.00000005, ethPerBall: 0.0000001, usdtPerBall: 0.01 },
  dailyLimits: { btcMaxSatsPerDay: 300, ethMaxWeiPerDay: 3000000000000000, usdtMaxPerDay: 3.0 },
  pools: { btcBalanceSats: 100000, ethBalanceWei: 1000000000000000, usdtBalance: 100 },
  perGameLimits: { btcMaxBeadsPerGame: 15, ethMaxBeadsPerGame: 15, usdtMaxBeadsPerGame: 15 },
};

let currentEconomy: GameEconomyConfig = DEFAULT_ECONOMY;

export function setEconomyConfig(config: Partial<GameEconomyConfig>) {
  const defaults = DEFAULT_ECONOMY;
  currentEconomy = {
    points: {
      normal: toNumber(config.points?.normal, defaults.points.normal),
      btc: toNumber(config.points?.btc, defaults.points.btc),
      eth: toNumber(config.points?.eth, defaults.points.eth),
      usdt: toNumber(config.points?.usdt, defaults.points.usdt),
    },
    combo: {
      multiplier: toNumber(config.combo?.multiplier, defaults.combo.multiplier),
      maxChain: toNumber(config.combo?.maxChain, defaults.combo.maxChain),
    },
    crypto: {
      spawnChance: toNumber(config.crypto?.spawnChance, defaults.crypto.spawnChance),
    },
    cryptoRewards: {
      btcPerBall: toNumber(config.cryptoRewards?.btcPerBall, defaults.cryptoRewards.btcPerBall),
      ethPerBall: toNumber(config.cryptoRewards?.ethPerBall, defaults.cryptoRewards.ethPerBall),
      usdtPerBall: toNumber(config.cryptoRewards?.usdtPerBall, defaults.cryptoRewards.usdtPerBall),
    },
    dailyLimits: {
      btcMaxSatsPerDay: toNumber(config.dailyLimits?.btcMaxSatsPerDay, defaults.dailyLimits.btcMaxSatsPerDay),
      ethMaxWeiPerDay: toNumber(config.dailyLimits?.ethMaxWeiPerDay, defaults.dailyLimits.ethMaxWeiPerDay),
      usdtMaxPerDay: toNumber(config.dailyLimits?.usdtMaxPerDay, defaults.dailyLimits.usdtMaxPerDay),
    },
    pools: {
      btcBalanceSats: toNumber(config.pools?.btcBalanceSats, defaults.pools.btcBalanceSats),
      ethBalanceWei: toNumber(config.pools?.ethBalanceWei, defaults.pools.ethBalanceWei),
      usdtBalance: toNumber(config.pools?.usdtBalance, defaults.pools.usdtBalance),
    },
    perGameLimits: {
      btcMaxBeadsPerGame: toNumber(config.perGameLimits?.btcMaxBeadsPerGame, defaults.perGameLimits.btcMaxBeadsPerGame),
      ethMaxBeadsPerGame: toNumber(config.perGameLimits?.ethMaxBeadsPerGame, defaults.perGameLimits.ethMaxBeadsPerGame),
      usdtMaxBeadsPerGame: toNumber(config.perGameLimits?.usdtMaxBeadsPerGame, defaults.perGameLimits.usdtMaxBeadsPerGame),
    },
  };
}

export function getEconomyConfig(): GameEconomyConfig {
  return currentEconomy;
}

// ========== DEBUG LOGGING ==========
export const DEBUG_GAME_LOGIC = true;
const MAX_DEBUG_LOGS = 200;

export const debugLogs: string[] = [];
let pendingLogs: string[] = [];
let operationCounter = 0;

export function getNextOperationId(): number {
  return ++operationCounter;
}
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function flushLogsToServer() {
  if (pendingLogs.length === 0) return;

  const logsToSend = [...pendingLogs];
  pendingLogs = [];

  fetch('/api/debug-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs: logsToSend }),
  }).catch(() => {});
}

export function debugLog(...args: unknown[]) {
  if (DEBUG_GAME_LOGIC) {
    const msg = `[${new Date().toLocaleTimeString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    debugLogs.push(msg);
    if (debugLogs.length > MAX_DEBUG_LOGS) {
      debugLogs.shift();
    }

    pendingLogs.push(msg);

    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushLogsToServer, 100);

    console.log('[GAME]', ...args);
  }
}

export function clearDebugLogs() {
  debugLogs.length = 0;
}

export function getDebugLogs(): string[] {
  return [...debugLogs];
}

// ========== BOOST SYSTEM ==========
export type BoostType = 'slowdown' | 'bomb' | 'rainbow' | 'rewind' | 'shield' | 'magnet' | 'laser';

interface ActiveBoostState {
  slowdownActive: boolean;
  slowdownEndTime: number;
  slowdownMultiplier: number;
  rainbowActive: boolean;
  pendingBomb: boolean;
  pendingRewind: boolean;
  shieldActive: boolean;
  magnetActive: boolean;
  magnetRadius: number;
  pendingLaser: boolean;
  laserPierceCount: number;
}

let boostState: ActiveBoostState = {
  slowdownActive: false,
  slowdownEndTime: 0,
  slowdownMultiplier: 1.0,
  rainbowActive: false,
  pendingBomb: false,
  pendingRewind: false,
  shieldActive: false,
  magnetActive: false,
  magnetRadius: 0,
  pendingLaser: false,
  laserPierceCount: 0,
};

export function resetBoostState() {
  boostState = {
    slowdownActive: false,
    slowdownEndTime: 0,
    slowdownMultiplier: 1.0,
    rainbowActive: false,
    pendingBomb: false,
    pendingRewind: false,
    shieldActive: false,
    magnetActive: false,
    magnetRadius: 0,
    pendingLaser: false,
    laserPierceCount: 0,
  };
  debugLog('[BOOST] State reset');
}

export function getBoostState(): ActiveBoostState {
  return { ...boostState };
}

export function activateSlowdown(durationMs: number, multiplier: number = 0.5) {
  boostState.slowdownActive = true;
  boostState.slowdownEndTime = Date.now() + durationMs;
  boostState.slowdownMultiplier = multiplier;
  debugLog(`[BOOST] Slowdown activated: ${durationMs}ms, multiplier=${multiplier}`);
}

export function activateRainbow() {
  boostState.rainbowActive = true;
  debugLog('[BOOST] Rainbow activated - next ball is wild');
}

export function consumeRainbow(): boolean {
  if (boostState.rainbowActive) {
    boostState.rainbowActive = false;
    debugLog('[BOOST] Rainbow consumed');
    return true;
  }
  return false;
}

export function activateBomb() {
  boostState.pendingBomb = true;
  debugLog('[BOOST] Bomb activated - next hit will explode');
}

export function consumeBomb(): boolean {
  if (boostState.pendingBomb) {
    boostState.pendingBomb = false;
    debugLog('[BOOST] Bomb consumed');
    return true;
  }
  return false;
}

export function activateRewind() {
  boostState.pendingRewind = true;
  debugLog('[BOOST] Rewind activated - chain will move back');
}

export function consumeRewind(): boolean {
  if (boostState.pendingRewind) {
    boostState.pendingRewind = false;
    debugLog('[BOOST] Rewind consumed');
    return true;
  }
  return false;
}

export function activateShield() {
  boostState.shieldActive = true;
  debugLog('[BOOST] Shield activated - protects from one life loss');
}

export function consumeShield(): boolean {
  if (boostState.shieldActive) {
    boostState.shieldActive = false;
    debugLog('[BOOST] Shield consumed - blocked life loss');
    return true;
  }
  return false;
}

export function activateMagnet(radius: number = 3) {
  boostState.magnetActive = true;
  boostState.magnetRadius = radius;
  debugLog(`[BOOST] Magnet activated - attracts same color balls within ${radius} positions`);
}

export function consumeMagnet(): { active: boolean; radius: number } {
  if (boostState.magnetActive) {
    const radius = boostState.magnetRadius;
    boostState.magnetActive = false;
    boostState.magnetRadius = 0;
    debugLog('[BOOST] Magnet consumed');
    return { active: true, radius };
  }
  return { active: false, radius: 0 };
}

export function activateLaser(pierceCount: number = 3) {
  boostState.pendingLaser = true;
  boostState.laserPierceCount = pierceCount;
  debugLog(`[BOOST] Laser activated - will pierce up to ${pierceCount} targets`);
}

export function consumeLaser(): { active: boolean; pierceCount: number } {
  if (boostState.pendingLaser) {
    const pierceCount = boostState.laserPierceCount;
    boostState.pendingLaser = false;
    boostState.laserPierceCount = 0;
    debugLog('[BOOST] Laser consumed');
    return { active: true, pierceCount };
  }
  return { active: false, pierceCount: 0 };
}

// Rollback system
let rollbackActive = false;
let rollbackStartTime: number | null = null;
const ROLLBACK_DURATION = 3000; // 3 seconds

export function activateRollback(): void {
  rollbackActive = true;
  rollbackStartTime = Date.now();
  debugLog('[ROLLBACK] Activated');
}

export function isRollbackActive(): boolean {
  // Check if rollback has expired
  if (rollbackActive && rollbackStartTime) {
    if (Date.now() - rollbackStartTime > ROLLBACK_DURATION) {
      rollbackActive = false;
      rollbackStartTime = null;
      debugLog('[ROLLBACK] Expired');
    }
  }
  return rollbackActive;
}

// ========== PLACEHOLDER FUNCTIONS ==========
export function createInitialGameState(levelId: number = 1, username?: string, canvasWidth: number = 800, canvasHeight: number = 600): any {
  // Get the level configuration
  const levelConfig = getLevelById(levelId);
  if (!levelConfig) {
    console.error(`Level with id ${levelId} not found`);
    // Return default state if level not found
    return {
      id: `game_${Date.now()}`,
      balls: [],
      score: 0,
      combo: 0,
      cryptoCollected: { btc: 0, eth: 0, usdt: 0 },
      lives: 3, // Установить 3 жизни как фиксированное значение
      levelId: levelId,
      chainSpeed: 0.0005, // Установить постоянную скорость
      aiming: true,
      shooter: { x: canvasWidth/2, y: canvasHeight - 50, angle: 0 }, // Устанавливаем стрелок в центр по X и внизу по Y
      aimAngle: 0,
      lastUpdateTime: Date.now(),
      levelConfig: {
        path: [],
        targetScore: 1000
      },
      username: username || "Player",
      totalPoints: 0
    };
  }

  // Use the initializeGameState function with canvas dimensions
  return initializeGameState(levelConfig, canvasWidth, canvasHeight);
}

export function createRandomBall(): Ball {
  // Create a random ball with required properties
  return {
    id: crypto.randomUUID(), // Generate a unique ID for the ball
    x: Math.random() * 100, // Random x position
    y: Math.random() * 100, // Random y position
    color: `hsl(${Math.random() * 360}, 70%, 60%)`, // Random color
    radius: 10 + Math.random() * 10, // Random radius between 10-20
    onPath: false, // Initially not on path
    pathProgress: 0, // Initial path progress
    velocity: {
      x: (Math.random() - 0.5) * 4, // Random velocity in x direction
      y: (Math.random() - 0.5) * 4  // Random velocity in y direction
    },
    isCrypto: false, // Not a crypto ball initially
    isUsdtFund: false // Not from USDT fund initially
  };
}

export function createBallFromChain(): any {
  // Placeholder implementation
  return {};
}

export function generatePathForLevel(levelPath: LevelPath, canvasWidth: number = 800, canvasHeight: number = 600): any {
  // Используем реальную реализацию из levelManager
  return generatePathPoints(levelPath, canvasWidth, canvasHeight);
}

export function getShooterPosition(canvasWidth: number = 800, canvasHeight: number = 600): any {
  // Возвращаем позицию стрелка в центре экрана (в центре спирали)
  return { x: canvasWidth/2, y: canvasHeight/2 };
}

export function updateBallPositions(balls: any[] = [], levelConfig?: any): any {
  // Обновляем позиции шаров на основе их pathProgress
  return balls.map((ball, index) => {
    if (levelConfig && levelConfig.getPathPoint && ball.pathProgress !== undefined && ball.pathProgress >= 0) {
      // Проверяем, является ли pathProgress числом и не NaN
      if (isNaN(ball.pathProgress)) {
        logService.error(`Ball ${index} has NaN pathProgress!`);
        return { ...ball };
      }

      // Обновляем координаты шара на основе его pathProgress
      const pathPoint = levelConfig.getPathPoint(ball.pathProgress);
      if (pathPoint) {
        // Добавляем лог для отладки первых нескольких шаров
        if (index < 3) {
          logService.debug(`Ball ${index} progress: ${ball.pathProgress}, old pos: (${ball.x}, ${ball.y}), new pos: (${pathPoint.x}, ${pathPoint.y})`);
        }
        return {
          ...ball,
          x: pathPoint.x,
          y: pathPoint.y
        };
      } else {
        logService.warn(`Ball ${index} pathPoint is null for progress: ${ball.pathProgress}`);
      }
    } else {
      logService.warn(`Ball ${index} has invalid progress: ${ball.pathProgress}, pathProgress >= 0: ${ball.pathProgress >= 0}`);
    }
    return { ...ball };
  });
}

export function moveBallsForward(balls: Ball[], deltaTime: number, chainSpeed: number): Ball[] {
  // Convert deltaTime from milliseconds to seconds for consistent calculations
  const deltaTimeSec = deltaTime / 1000;

  // Ensure chainSpeed is a valid number, fallback to base speed if undefined
  const speed = chainSpeed || GAME_CONFIG.speed.base;

  // СКОРОСТЬ: Убери тестовый тормоз 0.0001, верни нормальную скорость (например, 0.1), 
  // иначе мы будем ждать появления шарика 10 минут.
  const normalSpeed = 0.0005; // Установлена постоянная скорость

  // СКОРОСТЬ В ЦИКЛЕ: В функции moveBallsForward проверь,
  // чтобы итогальное смещение не было нулевым.
  // Добавь лог в монитор: "Speed: " + levelConfig.speed.
  
  // ТЕСТ: Если прогресс в мониторе не начнет расти через 5 секунд, 
  // выведи в оверлей сообщение: "MOVER_STATUS: CRASHED".
  const currentTime = Date.now();
  const firstBallProgress = balls[0]?.pathProgress;
  
  // Проверяем, изменился ли прогресс с предыдущего кадра
  if (typeof (window as any).lastBallProgress !== 'undefined') {
    const progressDiff = firstBallProgress - (window as any).lastBallProgress;
    if (progressDiff === 0) {
      // Если прогресс не изменился, увеличиваем счетчик
      (window as any).noProgressTime = (window as any).noProgressTime || 0;
      (window as any).noProgressTime += deltaTime;
      
      if ((window as any).noProgressTime > 5000) { // 5 секунд
        // ТЕСТ: Если прогресс в мониторе не начнет расти через 5 секунд, 
        // выведи в оверлей сообщение: "MOVER_STATUS: CRASHED".
        if (typeof window !== 'undefined' && window.debugLog) {
          try {
            window.debugLog(`
               MOVER_STATUS: CRASHED <br/>
               Speed: ${speed} <br/>
               DeltaTime: ${deltaTime} <br/>
               Balls: ${balls.length} <br/>
               First Ball Progress: ${firstBallProgress?.toFixed(4) || 'N/A'}
            `);
          } catch (e) {
            console.error('Error calling debugLog in moveBallsForward:', e);
          }
        }
      }
    } else {
      // Если прогресс изменился, сбрасываем таймер
      (window as any).noProgressTime = 0;
    }
  }
  
  (window as any).lastBallProgress = firstBallProgress;
  
  if (typeof window !== 'undefined' && window.debugLog) {
    try {
      window.debugLog(`
         Speed: ${speed} <br/>
         DeltaTime: ${deltaTime} <br/>
         Balls: ${balls.length} <br/>
         First Ball Progress: ${firstBallProgress?.toFixed(4) || 'N/A'}
      `);
    } catch (e) {
      console.error('Error calling debugLog in moveBallsForward:', e);
    }
  }

  // Перемещаем шары вперед по спирали
  const updatedBalls = balls.map((ball, index) => {
    if (ball.pathProgress !== undefined && ball.pathProgress >= 0) {
      // Увеличиваем pathProgress на основе скорости и времени
      const newProgress = ball.pathProgress + normalSpeed * deltaTimeSec * (ball.speedMultiplier || 1);
      
      // Добавляем лог для отладки первых нескольких шаров
      if (index < 3) {
        logService.debug(`Moving Ball ${index}: progress from ${ball.pathProgress} to ${newProgress}, deltaTimeSec: ${deltaTimeSec}, speed: ${speed}`);
      }
      return {
        ...ball,
        pathProgress: newProgress
      };
    }
    return { ...ball };
  });

  // Добавляем лог для проверки pathProgress
  if (updatedBalls.length > 0) {
    logService.debug(`Ball 0 progress: ${updatedBalls[0].pathProgress}, deltaTime: ${deltaTime}, deltaTimeSec: ${deltaTimeSec}, chainSpeed: ${speed}`);
  }

  // ЛОГ ДОБАВЛЕНИЯ: В функцию spawnBall добавь:
  console.log("!!! SPANWING BALL !!! New total:", updatedBalls.length);

  return updatedBalls;
}

export function processRollback(): any {
  // Placeholder implementation
  return [];
}

export function findMatchingBalls(balls: Ball[]): number[] {
  if (balls.length < 3) return [];

  let currentColor = balls[0].color;
  let currentCrypto = balls[0].crypto;
  let currentCount = 1;
  let startIndex = 0;

  for (let i = 1; i < balls.length; i++) {
    const ball = balls[i];
    const isSameColor = (currentCrypto && ball.crypto) ? currentCrypto === ball.crypto : (!currentCrypto && !ball.crypto && currentColor === ball.color);

    if (isSameColor) {
      currentCount++;
    } else {
      if (currentCount >= 3) {
        return Array.from({ length: currentCount }, (_, j) => startIndex + j);
      }
      currentColor = ball.color;
      currentCrypto = ball.crypto;
      currentCount = 1;
      startIndex = i;
    }
  }

  // Check the last sequence
  if (currentCount >= 3) {
    return Array.from({ length: currentCount }, (_, j) => startIndex + j);
  }

  return [];
}

export function findAllMatches(): any {
  // Placeholder implementation
  return [];
}

export function insertBallInChain(balls: Ball[], index: number, ballToInsert: Ball, insertBefore: boolean): Ball[] {
  const insertIndex = insertBefore ? index : index + 1;
  return [
    ...balls.slice(0, insertIndex),
    ballToInsert,
    ...balls.slice(insertIndex)
  ];
}

export function removeBalls(balls: Ball[], indicesToRemove: number[]): Ball[] {
  // Remove balls at specified indices in reverse order to maintain correct indices
  const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
  const updatedBalls = [...balls];

  for (const index of sortedIndices) {
    updatedBalls.splice(index, 1);
  }

  return updatedBalls;
}

/**
 * Checks collision between a projectile and balls in the chain
 * @param projectileX X coordinate of the projectile
 * @param projectileY Y coordinate of the projectile
 * @param balls Array of balls in the chain
 * @param path Level path for progress calculation
 * @returns Collision info with index and insert position, or null if no collision
 */
export function checkProjectileCollision(
  projectileX: number,
  projectileY: number,
  balls: Ball[],
  path: any // Using any since we don't have the exact type here
): { index: number; insertBefore: boolean } | null {
  const collisionDistance = BALL_RADIUS * 2; // Using radius * 2 as specified

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

  // Find the closest progress on the path for the projectile
  let closestProgress = 0;
  let minDist = Infinity;

  if (Array.isArray(path) && path.length > 0) {
    for (const point of path) {
      const dist = Math.sqrt(Math.pow(projectileX - point.x, 2) + Math.pow(projectileY - point.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closestProgress = point.progress;
      }
    }
  }

  // Determine if we should insert before or after the hit ball
  const insertBefore = Math.abs(hitBall.pathProgress - closestProgress) < 0.01
    ? closestProgress < hitBall.pathProgress
    : hitBall.pathProgress > closestProgress;

  return { index: closestIndex, insertBefore };
}

/**
 * Inserts a new ball into the chain at the specified position
 * @param balls Array of balls in the chain
 * @param index Index where to insert
 * @param ballToInsert The ball to insert
 * @param insertBefore Whether to insert before or after the index
 * @returns Updated array of balls
 */

/**
 * Shifts balls in the chain to make space for a new ball
 * @param balls Array of balls in the chain
 * @param insertIndex Index where the new ball will be inserted
 * @returns Updated array of balls with shifted positions
 */
export function shiftBallsForInsertion(balls: Ball[], insertIndex: number): Ball[] {
  // Move all balls before the insertion point forward to make space
  const updatedBalls = balls.map((ball, index) => {
    if (index < insertIndex) {
      // Shift this ball forward (increase path progress slightly)
      return {
        ...ball,
        pathProgress: ball.pathProgress + 0.001 // Small increment to make space
      };
    }
    return ball;
  });

  return updatedBalls;
}

/**
 * Finds sequences of 3 or more consecutive balls of the same color
 * @param balls Array of balls in the chain
 * @returns Array of indices of balls that form sequences of 3 or more of the same color
 */
export function findConsecutiveColorMatches(balls: Ball[]): number[] {
  if (balls.length < 3) return [];

  const indicesToRemove: number[] = [];
  let i = 0;

  while (i < balls.length) {
    const currentColor = balls[i].color;
    const currentCrypto = balls[i].crypto;
    const startIndex = i;

    // Count consecutive balls with the same color/crypto
    while (
      i < balls.length &&
      ((currentCrypto && balls[i].crypto) ? currentCrypto === balls[i].crypto :
       (!currentCrypto && !balls[i].crypto && currentColor === balls[i].color))
    ) {
      i++;
    }

    // If we found 3 or more consecutive balls, add their indices
    if (i - startIndex >= 3) {
      for (let j = startIndex; j < i; j++) {
        indicesToRemove.push(j);
      }
    }
  }

  return indicesToRemove;
}

/**
 * Processes a shot from the shooter
 * @param gameState Current game state
 * @param projectileX X coordinate of the projectile
 * @param projectileY Y coordinate of the projectile
 * @param projectileColor Color of the projectile
 * @returns Updated game state after processing the shot
 */
export function processShot(gameState: GameState, projectileX: number, projectileY: number, projectileColor: string): GameState {
  // Check for collision with balls in the chain
  const collision = checkProjectileCollision(
    projectileX,
    projectileY,
    gameState.balls,
    gameState.levelConfig.getPathPoint ? [] : gameState.levelConfig.path // Fallback to empty array if no path
  );

  if (!collision) {
    // No collision occurred, return original state
    return gameState;
  }

  // Create the new ball to insert
  const newBall: Ball = {
    id: `ball-${Date.now()}-${Math.random()}`,
    x: projectileX,
    y: projectileY,
    color: projectileColor,
    radius: BALL_RADIUS,
    onPath: true,
    pathProgress: gameState.balls[collision.index].pathProgress, // Set to same progress as the hit ball
    velocity: { x: 0, y: 0 }, // Projectiles stop moving once they hit
    isCrypto: false,
    isUsdtFund: false
  };

  // Insert the new ball into the chain
  let updatedBalls = insertBallInChain(
    gameState.balls,
    collision.index,
    newBall,
    collision.insertBefore
  );

  // Shift balls to make space for the new ball
  const insertIndex = collision.insertBefore ? collision.index : collision.index + 1;
  updatedBalls = shiftBallsForInsertion(updatedBalls, insertIndex);

  // Check for consecutive color matches and remove them
  let matchIndices = findConsecutiveColorMatches(updatedBalls);

  // Keep removing matches until no more matches exist
  while (matchIndices.length >= 3) {
    // Remove the matched balls
    updatedBalls = removeBalls(updatedBalls, matchIndices);

    // Check for new matches that might have formed after removal
    matchIndices = findConsecutiveColorMatches(updatedBalls);
  }

  // Update the game state with the new balls
  const newState = {
    ...gameState,
    balls: updatedBalls
  };

  return newState;
}

export function checkGameOver(balls: Ball[] = [], levelConfig?: any): boolean {
  // Проверяем, есть ли шары в игре
  if (!balls || balls.length === 0) {
    return false;
  }

  // Находим шар с НАИМЕНЬШИМ значением pathProgress (головной шар - ближайший к центру)
  // В Zuma-стиле шары движутся от начала пути (0) к концу (1), т.е. от центра к внешнему краю
  // Но в нашей игре они движутся от внешнего края к центру, т.е. от 1.0 к 0.0
  // Поэтому головной шар - с наименьшим pathProgress
  const headBall = balls.reduce((min: Ball, ball: Ball) => {
    return ball.pathProgress < min.pathProgress ? ball : min;
  }, balls[0]);

  // Если головной шар достиг центра спирали (pathProgress <= 0.001),
  // то происходит потеря жизни
  return headBall.pathProgress <= 0.001;
}

export function checkWin(): any {
  // Placeholder implementation
  return false;
}

export function setAvailableCrypto(): any {
  // Placeholder implementation
  return {};
}

export function setUsdtFundEnabled(): any {
  // Placeholder implementation
  return {};
}

export function getBallSpacing(): any {
  // Placeholder implementation
  return 0;
}

export function resetCryptoSpawnedCount(): any {
  // Placeholder implementation
  return {};
}

export function setCurrentLevel(completed: boolean = false): any {
  // Placeholder implementation
  console.log('Level completed:', completed);
}

export function updateBoostTimers(): any {
  // Placeholder implementation
  return {};
}

export function applyBombEffect(): any {
  // Placeholder implementation
  return {};
}

export function applyRewindEffect(): any {
  // Placeholder implementation
  return {};
}

export function applyMagnetEffect(): any {
  // Placeholder implementation
  return {};
}

export function applyLaserEffect(): any {
  // Placeholder implementation
  return {};
}

export async function setLevelCompleted(completed: boolean, userId?: string, score?: number, levelId?: number, beadsEarned?: number, duration?: number, maxCombo?: number, cryptoBtc?: number, cryptoEth?: number, cryptoUsdt?: number, won?: boolean, accuracy?: number) {
  if (completed) {
    console.log('Level completed:', completed);

    // If we have user data and game results, save them to the database
    if (userId && score !== undefined && levelId !== undefined) {
      try {
        // Prepare the payload for the API call
        const payload = {
          userId,
          score,
          beadsEarned: beadsEarned || 0,
          levelId,
          duration: duration || 0,
          maxCombo: maxCombo || 0,
          cryptoBtc: cryptoBtc || 0,
          cryptoEth: cryptoEth || 0,
          cryptoUsdt: cryptoUsdt || 0,
          won: won || false,
          accuracy: accuracy || 0,
        };

        // Send the game result to the API endpoint
        const response = await fetch('/api/game/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to save game result:', errorData);
        } else {
          const result = await response.json();
          console.log('Game result saved successfully:', result);
        }
      } catch (error) {
        console.error('Error saving game result:', error);
      }
    }
  }
}

// ========== GAME STATE MANAGEMENT ==========
export function initializeGameState(levelConfig: LevelConfig, canvasWidth: number = 800, canvasHeight: number = 600): GameState {
  // Генерируем спиральный путь с помощью новой функции
  const spiralPath = generateSpiralPath(3.5, 2000, canvasWidth / 2, canvasHeight / 2, 350);

  // Создаем функцию getPathPoint, которая использует сгенерированный путь
  const getPathPoint = (progress: number): { x: number; y: number; progress: number } => {
    // Ограничиваем прогресс в пределах [0, 1]
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Находим индекс в массиве
    const index = clampedProgress * (spiralPath.length - 1);
    const floorIndex = Math.floor(index);
    const ceilIndex = Math.ceil(index);

    // Если индекс выходит за границы, возвращаем крайние точки
    if (floorIndex < 0) return spiralPath[0];
    if (ceilIndex >= spiralPath.length) return spiralPath[spiralPath.length - 1];

    // Если индекс целый, возвращаем точку
    if (floorIndex === ceilIndex) return spiralPath[floorIndex];

    // Интерполируем между двумя точками
    const weight = index - floorIndex;
    const point1 = spiralPath[floorIndex];
    const point2 = spiralPath[ceilIndex];

    return {
      x: point1.x + (point2.x - point1.x) * weight,
      y: point1.y + (point2.y - point1.y) * weight,
      progress: clampedProgress
    };
  };

  // Создаем новый levelConfig с новым путем
  const newLevelConfig = {
    ...levelConfig,
    getPathPoint
  };

  const gameState: GameState = {
    balls: [],
    shooter: { x: canvasWidth/2, y: canvasHeight - 50, angle: 0 },
    combo: 0,
    score: 0,
    cryptoCollected: { btc: 0, eth: 0, usdt: 0 },
    usdtFundCollected: 0,
    lives: 3, // Устанавливаем 3 жизни
    gameOver: false,
    levelId: newLevelConfig.id,
    levelConfig: newLevelConfig,
    lastShotTime: 0,
    lastSpawnTime: 0,
    chainSpeed: 1.0 / (30 * 1000), // Фиксированная скорость для 30-секундного прохода от начала до центра
    chainProgress: 0,
    chainLength: 0,
    maxChainLength: newLevelConfig.maxChainLength || 50,
    nextBallColor: getRandomElement(getActiveBallColors()),
    queuedBalls: [],
    activeEffects: [],
    powerups: [],
    achievements: [],
    gameStartTime: Date.now(),
    lastUpdateTime: Date.now(),
    paused: false,
    boostState: getBoostState(),
    stats: {
      ballsShot: 0,
      ballsMatched: 0,
      highestCombo: 0,
      accuracy: 0,
      timePlayed: 0,
    },
  };

  // НЕ создаем начальные шары - они будут спавниться по таймеру
  // Только пустой массив, как требуется для новой логики

  debugLog(`[INIT] Game state initialized with spiral path, 0 initial balls, 3 lives, speed: ${1.0 / (30 * 1000)}`);

  return gameState;
}

export function updateGameState(gameState: GameState, deltaTime: number): GameState {
  if (gameState.paused || gameState.gameOver) {
    return gameState;
  }

  const now = Date.now();

  // Update boost states
  if (boostState.slowdownActive && now > boostState.slowdownEndTime) {
    boostState.slowdownActive = false;
    boostState.slowdownMultiplier = 1.0;
    debugLog('[BOOST] Slowdown expired');
  }

  // ПРОВЕРКА ЦИКЛА: Убедись, что функция moveBallsForward(gameState, deltaTime) 
  // реально вызывается внутри updateGameState. Добавь лог:
  console.log("Moving balls... Delta:", deltaTime);
  
  // ОГРАНИЧЕНИЕ ШАГА: В gameEngine.ts добавь лимит для deltaTime.
  // Пусть он никогда не будет больше 0.016 (эквивалент 60 FPS).
  const fixedDelta = Math.min(deltaTime, 0.016);

  // LOG DELTA: Выведи в консоль значение deltaTime:
  console.log("Current DeltaTime:", deltaTime);

  // СКОРОСТЬ: Жестко пропиши константу SPEED = 0.0005 в цикле обновления.
  const speed = 0.0005;

  // ЖЕСТКАЯ ПЕРЕЗАПИСЬ: Внутри moveBallsForward сделай так:
  // newBalls = gameState.balls.map(ball => ({
  //   ...ball,
  //   pathProgress: ball.pathProgress + (speed * deltaTime)
  // }));
  // Убедись, что результат этого map попадает обратно в State!
  const updatedBalls = gameState.balls.map(ball => {
    if (ball.pathProgress >= 0) {
      const newPathProgress = ball.pathProgress + speed * (fixedDelta / 1000); // Преобразуем deltaTime в секунды

      // Update ball position based on path
      const pathPoint = gameState.levelConfig.getPathPoint(newPathProgress);
      if (pathPoint) {
        return {
          ...ball,
          pathProgress: newPathProgress,
          x: pathPoint.x,
          y: pathPoint.y
        };
      } else {
        return {
          ...ball,
          pathProgress: newPathProgress
        };
      }
    }
    return ball;
  });

  // Check if any balls reached the end of the path
  // НОВАЯ ЛОГИКА УРОВНЯ (Checkpoint):
  // При потере жизни (шар в центре) жизни минус 1,
  // но оставшаяся змейка продолжает путь с тех же позиций.
  // Это означает, что мы не удаляем шары, а просто уменьшаем жизни.
  let updatedLives = gameState.lives;
  let gameOver = gameState.gameOver;

  for (const ball of updatedBalls) {
    if (ball.pathProgress >= 1.0) {
      // Шар достиг конца пути
      if (!consumeShield()) {
        updatedLives--;
        debugLog(`[LIVES] Lost a life, remaining: ${updatedLives}`);
      } else {
        debugLog(`[SHIELD] Shield blocked life loss`);
      }

      // Check for game over
      if (updatedLives <= 0) {
        gameOver = true;
        debugLog(`[GAME OVER] Player ran out of lives`);
        break; // Выходим из цикла, если игра окончена
      }

      // СБРОС ПРОГРЕССА: Для шара, который достиг конца, мы можем сбросить его progress
      // на начало пути, чтобы он продолжил движение, но это противоречит "оставшаяся змейка продолжает путь".
      // Вместо этого, мы оставим его с progress >= 1.0, и он будет "за пределами пути".
      // Но для визуализации, нам нужно решить, что делать с шарами с progress >= 1.0.
      // В идеале, они должны исчезнуть или быть удалены, но по условию "оставшаяся змейка продолжает путь",
      // мы не удаляем их из массива, а просто уменьшаем жизни.
      // Таким образом, шары с progress >= 1.0 остаются в массиве, но не влияют на игру,
      // кроме как триггер для уменьшения жизней.
    }
  }

  // We don't filter balls that reached the end anymore, as per "Checkpoint" logic
  // const filteredBalls = updatedBalls.filter(ball => ball.pathProgress < 1.0);

  // Return updated state
  return {
    ...gameState,
    balls: updatedBalls, // Don't filter balls
    lives: updatedLives,
    gameOver,
    lastUpdateTime: now,
    chainProgress: gameState.chainProgress + gameState.chainSpeed * fixedDelta
  };
}

function spawnRandomBall(gameState: GameState) {
  // Используем шанс спавна из конфигурации уровня, если доступен, иначе используем глобальный
  const levelCryptoSpawnChance = gameState.levelConfig.cryptoSpawnChance !== undefined
    ? gameState.levelConfig.cryptoSpawnChance
    : currentEconomy.crypto.spawnChance;

  const color = getRandomElement(getActiveBallColors());
  const isCrypto = Math.random() < levelCryptoSpawnChance;
  const cryptoType = isCrypto ? getRandomElement(CRYPTO_TYPES) : undefined;

  // Add ball at the beginning of the path
  const pathPoint = gameState.levelConfig.getPathPoint(0);
  console.log(`Spawning new ball at pathPoint: (${pathPoint.x}, ${pathPoint.y})`);
  const newBall: Ball = {
    id: `ball-${Date.now()}-${gameState.balls.length}`,
    x: pathPoint.x,
    y: pathPoint.y,
    color,
    pathProgress: 0,
    isCrypto,
    crypto: cryptoType,
    isUsdtFund: false,
    isSpecial: false,
    speedMultiplier: 1,
    effects: [],
  };

  gameState.balls.unshift(newBall);
  logService.info(`[SPAWN] New ball spawned: ${color}${isCrypto ? ` (${cryptoType})` : ''}`);
}

/**
 * Generates a spiral path using Archimedean spiral formula.
 * @param turns Number of turns in the spiral (default 3.5)
 * @param points Number of points to generate (default 2000)
 * @param centerX X coordinate of the center of the spiral (default canvas.width / 2)
 * @param centerY Y coordinate of the center of the spiral (default canvas.height / 2)
 * @param outerRadius Maximum radius of the spiral (default 350)
 * @returns Array of PathPoint objects representing the spiral path
 */
export function generateSpiralPath(
  turns: number = 3.5,
  points: number = 2000,
  centerX: number,
  centerY: number,
  outerRadius: number = 350
): { x: number; y: number; progress: number }[] {
  const path: { x: number; y: number; progress: number }[] = [];

  // Archimedean spiral formula: r = a + bθ
  // For our purposes, we'll use: r = (outerRadius / (turns * 2 * π)) * θ
  // This ensures that at θ = turns * 2 * π, r = outerRadius
  const maxTheta = turns * 2 * Math.PI;
  const radiusFactor = outerRadius / maxTheta;

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1); // Normalized progress from 0 to 1
    const theta = progress * maxTheta; // Current angle
    const radius = radiusFactor * theta; // Current radius based on angle

    // Calculate x, y coordinates relative to center
    const x = centerX + radius * Math.cos(theta);
    const y = centerY + radius * Math.sin(theta);

    path.push({ x, y, progress });
  }

  return path;
}

// Export the utility functions that were moved
export const calculatePoints = utilsCalculatePoints;
export const checkCollision = utilsCheckCollision;
export const checkPathCollision = utilsCheckPathCollision;