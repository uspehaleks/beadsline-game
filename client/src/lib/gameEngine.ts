import type { Ball, BallColor, CryptoType, GameState, GameEconomyConfig, GameplayConfig } from "@shared/schema";
import { GAME_CONFIG, calculateDynamicSpeed } from "./gameConfig";

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

function debugLog(...args: unknown[]) {
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

const BALL_RADIUS = GAME_CONFIG.balls.radius;
const SHOOTER_BALL_SPEED = GAME_CONFIG.balls.shooterSpeed;
const COLLISION_RADIUS_MULTIPLIER = GAME_CONFIG.balls.collisionRadius;

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
    },
  };
}

export function getGameplayConfig(): GameplayConfig {
  return currentGameplay;
}

function getActiveBallColors(): BallColor[] {
  const count = Math.max(2, Math.min(10, currentGameplay.colors.count));
  return ALL_BALL_COLORS.slice(0, count);
}

const DEFAULT_ECONOMY: GameEconomyConfig = {
  points: { normal: 100, btc: 500, eth: 300, usdt: 200 },
  combo: { multiplier: 1.5, maxChain: 10 },
  crypto: { spawnChance: 0.08 },
  cryptoRewards: { btcPerBall: 0.00000005, ethPerBall: 0.0000001, usdtPerBall: 0.01 },
  dailyLimits: { btcMaxSatsPerDay: 300, ethMaxWeiPerDay: 3000000000000000, usdtMaxPerDay: 3.0 },
  pools: { btcBalanceSats: 100000, ethBalanceWei: 1000000000000000, usdtBalance: 100 },
  perGameLimits: { btcMaxBeadsPerGame: 15, ethMaxBeadsPerGame: 15, usdtMaxBeadsPerGame: 15 },
};

let currentEconomy: GameEconomyConfig = DEFAULT_ECONOMY;

function toNumber(val: string | number | undefined, fallback: number): number {
  if (val === undefined || val === null) return fallback;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? fallback : num;
}

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
let cryptoSpawnedThisGame: { btc: number; eth: number; usdt: number } = { btc: 0, eth: 0, usdt: 0 };

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

export function resetCryptoSpawnedCount() {
  cryptoSpawnedThisGame = { btc: 0, eth: 0, usdt: 0 };
}

export function getCryptoSpawnedCount() {
  return { ...cryptoSpawnedThisGame };
}

function getColorCounts(balls: Ball[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ball of balls) {
    if (!ball.crypto && !ball.isUsdtFund) {
      counts.set(ball.color, (counts.get(ball.color) || 0) + 1);
    }
  }
  return counts;
}

function selectBalancedColor(balls: Ball[], forShooter: boolean = false): string {
  const activeColors = getActiveBallColors();
  const colorCounts = getColorCounts(balls);
  
  const totalBalls = balls.filter(b => !b.crypto && !b.isUsdtFund).length;
  const targetPerColor = Math.max(1, Math.floor(totalBalls / activeColors.length));
  
  const weights: { color: string; weight: number }[] = [];
  
  for (const color of activeColors) {
    const count = colorCounts.get(color) || 0;
    let weight: number;
    
    if (forShooter) {
      weight = count > 0 ? Math.max(1, count) : 0.5;
    } else {
      const deficit = Math.max(0, targetPerColor - count);
      weight = 1 + deficit * 2;
      
      if (count === 0 && totalBalls > 10) {
        weight = 5;
      }
    }
    
    weights.push({ color, weight });
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { color, weight } of weights) {
    random -= weight;
    if (random <= 0) {
      return color;
    }
  }
  
  return activeColors[0];
}

export function createBallFromChain(id: string, chainBalls: Ball[], pathProgress: number = 0): Ball {
  const color = selectBalancedColor(chainBalls, true) as BallColor;
  
  return {
    id,
    x: 0,
    y: 0,
    color,
    radius: BALL_RADIUS,
    pathProgress,
  };
}

export function createRandomBall(id: string, pathProgress: number = 0, chainBalls: Ball[] = []): Ball {
  const activeColors = getActiveBallColors();
  const color = (chainBalls.length > 0 
    ? selectBalancedColor(chainBalls, false)
    : activeColors[Math.floor(Math.random() * activeColors.length)]) as BallColor;
  
  const spawnChance = currentEconomy.crypto.spawnChance;
  const limits = currentEconomy.perGameLimits;
  
  const isUsdtFundBall = usdtFundEnabled && Math.random() < spawnChance;
  
  if (isUsdtFundBall) {
    debugLog(`[CRYPTO] Spawning USDT Fund ball: ${id}`);
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
  
  const availableTypes = CRYPTO_TYPES.filter(type => {
    if (!availableCrypto[type]) return false;
    const limit = limits[`${type}MaxBeadsPerGame` as keyof typeof limits] || 15;
    return cryptoSpawnedThisGame[type] < limit;
  });
  const hasCryptoAvailable = availableTypes.length > 0;
  const cryptoRoll = Math.random();
  const isCrypto = hasCryptoAvailable && cryptoRoll < spawnChance;
  
  let crypto: CryptoType | undefined = undefined;
  if (isCrypto) {
    crypto = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    cryptoSpawnedThisGame[crypto]++;
    debugLog(`[CRYPTO] Spawned ${crypto} ball: ${id}, roll=${cryptoRoll.toFixed(3)}, chance=${spawnChance}, spawned=${JSON.stringify(cryptoSpawnedThisGame)}`);
  }
  
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
    const ball = createRandomBall(`ball-${i}`, startOffset + i * spacing, balls);
    balls.push(ball);
  }
  
  return balls;
}

export function createInitialGameState(): GameState {
  debugLog('=== GAME STARTED ===', 'initialBalls:', currentGameplay.balls.initialCount);
  debugLog(`[CRYPTO CONFIG] spawnChance=${currentEconomy.crypto.spawnChance}, availableCrypto=${JSON.stringify(availableCrypto)}, usdtFundEnabled=${usdtFundEnabled}`);
  cryptoSpawnedThisGame = { btc: 0, eth: 0, usdt: 0 };
  const balls = createInitialBalls(currentGameplay.balls.initialCount);
  return {
    balls,
    shooterBall: createBallFromChain('shooter', balls),
    nextBall: createBallFromChain('next', balls),
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
    lives: 3,
    extraLivesBought: 0,
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

function ballsMatch(ball1: Ball, ball2: Ball): boolean {
  if (ball1.crypto && ball2.crypto) {
    const result = ball1.crypto === ball2.crypto;
    debugLog(`ballsMatch crypto: ${ball1.crypto} vs ${ball2.crypto} = ${result}`);
    return result;
  }
  if (!ball1.crypto && !ball2.crypto) {
    const result = ball1.color === ball2.color;
    debugLog(`ballsMatch color: ${ball1.color} vs ${ball2.color} = ${result}`);
    return result;
  }
  debugLog(`ballsMatch mixed: ball1.crypto=${ball1.crypto} ball2.crypto=${ball2.crypto} = false`);
  return false;
}

export function findMatchingBalls(balls: Ball[], insertIndex: number, insertedBall: Ball): number[] {
  const opId = getNextOperationId();
  
  if (insertIndex < 0 || insertIndex >= balls.length) {
    debugLog(`[OP${opId}] findMatchingBalls: invalid index ${insertIndex}, balls.length=${balls.length}`);
    return [];
  }
  
  const matches: number[] = [insertIndex];
  const targetBall = balls[insertIndex];
  
  debugLog(`[OP${opId}] findMatchingBalls START: insertIndex=${insertIndex}, targetBall.id=${targetBall.id}, color=${targetBall.color}, crypto=${targetBall.crypto}`);
  
  const chainSnapshot = balls.slice(0, Math.min(15, balls.length)).map((b, i) => `${i}:${b.color?.slice(0,2)}[${b.id?.slice(-6)}]`).join(' ');
  debugLog(`[OP${opId}] Chain snapshot (first 15): ${chainSnapshot}`);
  
  let left = insertIndex - 1;
  while (left >= 0 && ballsMatch(balls[left], targetBall)) {
    debugLog(`  LEFT match at ${left}: id=${balls[left].id}, color=${balls[left].color}, crypto=${balls[left].crypto}`);
    matches.unshift(left);
    left--;
  }
  
  let right = insertIndex + 1;
  while (right < balls.length && ballsMatch(balls[right], targetBall)) {
    debugLog(`  RIGHT match at ${right}: id=${balls[right].id}, color=${balls[right].color}, crypto=${balls[right].crypto}`);
    matches.push(right);
    right++;
  }
  
  const result = matches.length >= 3 ? matches : [];
  const matchedIds = matches.map(i => balls[i]?.id?.slice(-8) || '?').join(',');
  debugLog(`[OP${opId}] findMatchingBalls END: found ${matches.length} matches, indices=[${matches.join(',')}], ids=[${matchedIds}], returning ${result.length >= 3 ? 'MATCH' : 'NO MATCH'}`);
  
  return result;
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
  debugLog(`insertBallInChain: shooterBall.color=${shooterBall.color}, crypto=${shooterBall.crypto}, insertIndex=${insertIndex}, chainLength=${balls.length}`);
  
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
  
  debugLog(`  Created insertedBall: id=${insertedBall.id}, color=${insertedBall.color}, crypto=${insertedBall.crypto}`);
  
  for (let i = insertIndex; i < newBalls.length; i++) {
    newBalls[i] = {
      ...newBalls[i],
      pathProgress: newBalls[i].pathProgress + spacing,
    };
  }
  
  newBalls.splice(insertIndex, 0, insertedBall);
  
  debugLog(`  Chain after insert: [${newBalls.slice(Math.max(0, insertIndex-2), insertIndex+3).map(b => `${b.color}${b.crypto ? '('+b.crypto+')' : ''}`).join(', ')}]`);
  
  return newBalls;
}

export function removeBalls(balls: Ball[], indices: number[]): Ball[] {
  const opId = getNextOperationId();
  const sortedIndices = [...indices].sort((a, b) => b - a);
  const newBalls = [...balls];
  
  debugLog(`[OP${opId}] removeBalls: removing ${indices.length} balls at indices [${indices.join(',')}]`);
  const removedInfo = indices.map(i => {
    const b = balls[i];
    const shortId = b?.id?.slice(-8) || '?';
    return `idx${i}:${b?.color}${b?.crypto ? '('+b.crypto+')' : ''}[${shortId}]`;
  });
  debugLog(`[OP${opId}] Balls being removed: [${removedInfo.join(', ')}]`);
  
  for (const index of sortedIndices) {
    newBalls.splice(index, 1);
  }
  
  debugLog(`[OP${opId}] Chain after removal: length=${newBalls.length}`);
  return newBalls;
}

export function findAllMatches(balls: Ball[]): { indices: number[]; matchedBalls: Ball[] }[] {
  if (balls.length < 3) return [];
  
  const allMatches: { indices: number[]; matchedBalls: Ball[] }[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < balls.length; i++) {
    if (processed.has(i)) continue;
    
    const currentBall = balls[i];
    const group: number[] = [i];
    
    let j = i + 1;
    while (j < balls.length && ballsMatch(balls[j], currentBall)) {
      group.push(j);
      j++;
    }
    
    if (group.length >= 3) {
      group.forEach(idx => processed.add(idx));
      allMatches.push({
        indices: group,
        matchedBalls: group.map(idx => balls[idx])
      });
    }
  }
  
  return allMatches;
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
    const newBall = createRandomBall(`new-${Date.now()}-${i}`, lastProgress + spacing, newBalls);
    newBalls.push(newBall);
  }
  
  return newBalls;
}

export function spawnBallAtStart(balls: Ball[]): Ball[] {
  const spacing = GAME_CONFIG.balls.spacing;
  const newBall = createRandomBall(`spawn-${Date.now()}`, 0, balls);
  
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
  cyan: '#00e5ff',
  magenta: '#ff2bf2',
  amber: '#ffc400',
  lime: '#b6ff00',
  violet: '#8c3bff',
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
