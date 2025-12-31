import type { Ball, BallColor, CryptoType, GameState, GameEconomyConfig, GameplayConfig } from "@shared/schema";
import { GAME_CONFIG, calculateDynamicSpeed } from "./gameConfig";
import type { LevelConfig, LevelPath } from "./levelConfig";

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
  debugLog(`[BOOST] Laser activated - next shot pierces ${pierceCount} balls`);
}

export function consumeLaser(): { active: boolean; pierceCount: number } {
  if (boostState.pendingLaser) {
    const count = boostState.laserPierceCount;
    boostState.pendingLaser = false;
    boostState.laserPierceCount = 0;
    debugLog('[BOOST] Laser consumed');
    return { active: true, pierceCount: count };
  }
  return { active: false, pierceCount: 0 };
}

export function applyMagnetEffect(balls: Ball[], insertIndex: number, radius: number): Ball[] {
  const insertedBall = balls[insertIndex];
  if (!insertedBall) return balls;
  
  const targetColor = insertedBall.color;
  const targetProgress = insertedBall.pathProgress;
  const newBalls = [...balls];
  const spacing = 0.02;
  
  let movedCount = 0;
  for (let i = Math.max(0, insertIndex - radius); i <= Math.min(balls.length - 1, insertIndex + radius); i++) {
    if (i !== insertIndex && newBalls[i].color === targetColor) {
      const distance = Math.abs(i - insertIndex);
      const newProgress = i < insertIndex 
        ? targetProgress - (distance * spacing)
        : targetProgress + (distance * spacing);
      
      newBalls[i] = {
        ...newBalls[i],
        pathProgress: Math.max(0, Math.min(1, newProgress)),
      };
      movedCount++;
    }
  }
  
  debugLog(`[BOOST] Magnet pulled ${movedCount} same-color balls toward index ${insertIndex}`);
  return newBalls;
}

export function applyLaserEffect(balls: Ball[], hitIndices: number[]): {
  newBalls: Ball[];
  removedBalls: Ball[];
  removedIndices: number[];
} {
  const removedBalls = hitIndices.map(i => balls[i]).filter(Boolean);
  const newBalls = balls.filter((_, i) => !hitIndices.includes(i));
  
  debugLog(`[BOOST] Laser pierced through ${hitIndices.length} balls`);
  return { newBalls, removedBalls, removedIndices: hitIndices };
}

export function updateBoostTimers() {
  if (boostState.slowdownActive && Date.now() >= boostState.slowdownEndTime) {
    boostState.slowdownActive = false;
    boostState.slowdownMultiplier = 1.0;
    debugLog('[BOOST] Slowdown expired');
  }
}

export function getSpeedMultiplier(): number {
  return boostState.slowdownActive ? boostState.slowdownMultiplier : 1.0;
}

export function applyBombEffect(balls: Ball[], hitIndex: number, radius: number = 5): { 
  newBalls: Ball[]; 
  removedBalls: Ball[];
  removedIndices: number[];
} {
  const toRemove: number[] = [];
  const hitBall = balls[hitIndex];
  if (!hitBall) {
    return { newBalls: balls, removedBalls: [], removedIndices: [] };
  }
  
  for (let i = Math.max(0, hitIndex - radius); i <= Math.min(balls.length - 1, hitIndex + radius); i++) {
    toRemove.push(i);
  }
  
  const removedBalls = toRemove.map(i => balls[i]);
  const newBalls = balls.filter((_, i) => !toRemove.includes(i));
  
  debugLog(`[BOOST] Bomb exploded at index ${hitIndex}: removed ${toRemove.length} balls`);
  return { newBalls, removedBalls, removedIndices: toRemove };
}

export function applyRewindEffect(balls: Ball[], rewindPercent: number = 0.15): Ball[] {
  const rewindAmount = rewindPercent;
  const newBalls = balls.map(ball => ({
    ...ball,
    pathProgress: Math.max(0, ball.pathProgress - rewindAmount),
  }));
  debugLog(`[BOOST] Rewind applied: moved balls back by ${rewindPercent * 100}%`);
  return newBalls;
}

export function createRainbowBall(id: string, baseBall?: Ball): Ball {
  const activeColors = getActiveBallColors();
  const randomColor = activeColors[Math.floor(Math.random() * activeColors.length)];
  
  return {
    id,
    x: baseBall?.x ?? 0,
    y: baseBall?.y ?? 0,
    color: randomColor,
    radius: BALL_RADIUS,
    pathProgress: baseBall?.pathProgress ?? 0,
    isRainbow: true,
  };
}

// ========== END BOOST SYSTEM ==========

export interface PathPoint {
  x: number;
  y: number;
}

let currentLevelConfig: LevelConfig | null = null;

export function setCurrentLevel(level: LevelConfig | null) {
  currentLevelConfig = level;
}

export function getCurrentLevel(): LevelConfig | null {
  return currentLevelConfig;
}

export function getBallSpacing(): number {
  return currentLevelConfig?.ballSpacing ?? GAME_CONFIG.balls.spacing;
}

function generateSpiralPath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 600;
  const spiralTurns = pathConfig.spiralTurns || 3.0;
  const outerRadius = pathConfig.outerRadius || 0.42;
  const innerRadius = pathConfig.innerRadius || 0.15;
  
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

function generateZigzagPath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 500;
  const amplitude = pathConfig.amplitude || 0.25;
  const frequency = pathConfig.frequency || 6;
  
  const margin = width * 0.1;
  const pathWidth = width - margin * 2;
  const pathHeight = height * 0.7;
  const startY = height * 0.1;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = startY + t * pathHeight;
    const zigzagPhase = t * frequency * Math.PI;
    const zigzagOffset = Math.sin(zigzagPhase) * pathWidth * amplitude;
    const x = width / 2 + zigzagOffset;
    points.push({ x, y });
  }
  
  return points;
}

function generateWavePath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 550;
  const amplitude = pathConfig.amplitude || 0.18;
  const frequency = pathConfig.frequency || 3;
  
  const margin = width * 0.1;
  const pathHeight = height * 0.75;
  const startY = height * 0.1;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = startY + t * pathHeight;
    const waveOffset = Math.sin(t * frequency * Math.PI * 2) * width * amplitude;
    const x = width / 2 + waveOffset;
    points.push({ x, y });
  }
  
  return points;
}

function generateSShapePath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 500;
  const amplitude = pathConfig.amplitude || 0.30;
  
  const pathHeight = height * 0.75;
  const startY = height * 0.1;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = startY + t * pathHeight;
    const sOffset = Math.sin(t * Math.PI * 2) * width * amplitude;
    const x = width / 2 + sOffset;
    points.push({ x, y });
  }
  
  return points;
}

function generateHeartPath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 600;
  
  const centerX = width / 2;
  const centerY = height * 0.5;
  const scale = Math.min(width, height) * 0.38;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const heartX = 16 * Math.pow(Math.sin(angle), 3);
    const heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
    
    const x = centerX + heartX * scale / 16;
    const y = centerY + heartY * scale / 16;
    points.push({ x, y });
  }
  
  return points;
}

function generateInfinityPath(width: number, height: number, pathConfig: LevelPath): PathPoint[] {
  const points: PathPoint[] = [];
  const segments = pathConfig.segments || 650;
  
  const centerX = width / 2;
  const centerY = height * 0.5;
  const scaleX = width * 0.35;
  const scaleY = height * 0.2;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2;
    const x = centerX + scaleX * Math.sin(angle);
    const y = centerY + scaleY * Math.sin(angle * 2);
    points.push({ x, y });
  }
  
  return points;
}

export function generatePathForLevel(width: number, height: number, levelConfig?: LevelConfig): PathPoint[] {
  const level = levelConfig || currentLevelConfig;
  
  if (!level) {
    return generateSpiralPath(width, height, GAME_CONFIG.path as LevelPath);
  }
  
  switch (level.path.type) {
    case 'spiral':
      return generateSpiralPath(width, height, level.path);
    case 'zigzag':
      return generateZigzagPath(width, height, level.path);
    case 'wave':
      return generateWavePath(width, height, level.path);
    case 'sShape':
      return generateSShapePath(width, height, level.path);
    case 'heart':
      return generateHeartPath(width, height, level.path);
    case 'infinity':
      return generateInfinityPath(width, height, level.path);
    default:
      return generateSpiralPath(width, height, level.path);
  }
}

export function generatePath(width: number, height: number): PathPoint[] {
  return generatePathForLevel(width, height);
}

export function getShooterPosition(width: number, height: number): { x: number; y: number } {
  const level = currentLevelConfig;
  
  if (!level) {
    return { x: width / 2, y: height * 0.48 };
  }
  
  switch (level.path.type) {
    case 'spiral':
      return { x: width / 2, y: height * 0.48 };
    case 'zigzag':
    case 'wave':
    case 'sShape':
      return { x: width / 2, y: height * 0.92 };
    case 'heart':
      return { x: width / 2, y: height * 0.55 };
    case 'infinity':
      return { x: width / 2, y: height * 0.75 };
    default:
      return { x: width / 2, y: height * 0.48 };
  }
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

// Default to disabled for safety - will be set by API response
let availableCrypto: AvailableCrypto = { btc: false, eth: false, usdt: false };
let usdtFundEnabled: boolean = false;
let cryptoSpawnedThisGame: { btc: number; eth: number; usdt: number } = { btc: 0, eth: 0, usdt: 0 };

// Flag to disable crypto balls on completed levels (motivate playing new levels)
let isLevelCompleted: boolean = false;

export function setLevelCompleted(completed: boolean) {
  isLevelCompleted = completed;
  debugLog(`[CRYPTO] Level completed flag set to: ${completed} - crypto balls ${completed ? 'DISABLED' : 'ENABLED'}`);
}

export function getIsLevelCompleted(): boolean {
  return isLevelCompleted;
}

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

function getColorCounts(balls: Ball[], includeAll: boolean = false): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ball of balls) {
    // For shooter color selection, count ALL balls' colors (including crypto)
    // For chain spawning balance, only count regular balls
    if (includeAll || (!ball.crypto && !ball.isUsdtFund)) {
      counts.set(ball.color, (counts.get(ball.color) || 0) + 1);
    }
  }
  return counts;
}

function selectBalancedColor(balls: Ball[], forShooter: boolean = false): string {
  const activeColors = getActiveBallColors();
  // For shooter: count ALL colors (including crypto balls) to match what's visible on screen
  // For chain spawning: only count regular balls for balance
  const colorCounts = getColorCounts(balls, forShooter);
  
  const totalBalls = balls.filter(b => !b.crypto && !b.isUsdtFund).length;
  const targetPerColor = Math.max(1, Math.floor(totalBalls / activeColors.length));
  
  if (forShooter) {
    const colorsInChain = activeColors.filter(c => (colorCounts.get(c) || 0) > 0);
    if (colorsInChain.length === 0) {
      return activeColors[Math.floor(Math.random() * activeColors.length)];
    }
    
    const weights: { color: string; weight: number }[] = [];
    for (const color of colorsInChain) {
      const count = colorCounts.get(color) || 1;
      weights.push({ color, weight: count });
    }
    
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { color, weight } of weights) {
      random -= weight;
      if (random <= 0) {
        return color;
      }
    }
    return colorsInChain[0];
  }
  
  const weights: { color: string; weight: number }[] = [];
  
  for (const color of activeColors) {
    const count = colorCounts.get(color) || 0;
    const deficit = Math.max(0, targetPerColor - count);
    let weight = 1 + deficit * 2;
    
    if (count === 0 && totalBalls > 10) {
      weight = 5;
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

export function createRandomBall(id: string, pathProgress: number = 0, chainBalls: Ball[] = [], forShooter: boolean = false): Ball {
  const activeColors = getActiveBallColors();
  
  // Smart shooter generation when few balls remain
  if (forShooter && chainBalls.length > 0 && chainBalls.length <= 15) {
    // Collect unique ball types in chain (color + crypto/usdtFund combination)
    const ballTypes: Array<{ color: BallColor; crypto?: CryptoType; isUsdtFund?: boolean }> = [];
    const seenKeys = new Set<string>();
    
    for (const ball of chainBalls) {
      const key = ball.isUsdtFund ? `usdt-fund-${ball.color}` : 
                  ball.crypto ? `crypto-${ball.crypto}-${ball.color}` : 
                  `regular-${ball.color}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        ballTypes.push({ 
          color: ball.color as BallColor, 
          crypto: ball.crypto, 
          isUsdtFund: ball.isUsdtFund 
        });
      }
    }
    
    if (ballTypes.length > 0) {
      // Weight by count of each type in chain (more balls = higher chance)
      const typeWeights = ballTypes.map(type => {
        const count = chainBalls.filter(b => {
          if (type.isUsdtFund) return b.isUsdtFund && b.color === type.color;
          if (type.crypto) return b.crypto === type.crypto && b.color === type.color;
          return !b.crypto && !b.isUsdtFund && b.color === type.color;
        }).length;
        return { type, weight: count };
      });
      
      const totalWeight = typeWeights.reduce((sum, tw) => sum + tw.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const { type, weight } of typeWeights) {
        random -= weight;
        if (random <= 0) {
          debugLog(`[SHOOTER-SMART] Balls:${chainBalls.length} Types:${ballTypes.length} -> ${type.isUsdtFund ? 'USDT-Fund' : type.crypto || type.color}`);
          return {
            id,
            x: 0,
            y: 0,
            color: type.color,
            crypto: type.crypto,
            isUsdtFund: type.isUsdtFund,
            radius: BALL_RADIUS,
            pathProgress,
          };
        }
      }
      
      // Fallback to first type
      const fallback = ballTypes[0];
      return {
        id,
        x: 0,
        y: 0,
        color: fallback.color,
        crypto: fallback.crypto,
        isUsdtFund: fallback.isUsdtFund,
        radius: BALL_RADIUS,
        pathProgress,
      };
    }
  }
  
  // forShooter=true: pick only from colors in chain (for shooter/next ball)
  // forShooter=false: balanced distribution from all active colors (for chain spawning)
  const color = (chainBalls.length > 0 
    ? selectBalancedColor(chainBalls, forShooter)
    : activeColors[Math.floor(Math.random() * activeColors.length)]) as BallColor;
  
  const spawnChance = currentEconomy.crypto.spawnChance;
  const limits = currentEconomy.perGameLimits;
  
  // Skip crypto spawning on completed levels - only regular balls
  if (isLevelCompleted) {
    return {
      id,
      x: 0,
      y: 0,
      color,
      radius: BALL_RADIUS,
      pathProgress,
    };
  }
  
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
  const spacing = getBallSpacing();
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
  resetBoostState();
  const balls = createInitialBalls(currentGameplay.balls.initialCount);
  return {
    balls,
    shooterBall: createRandomBall('shooter', 0, balls, true),
    nextBall: createRandomBall('next', 0, balls, true),
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
  const speedMultiplier = getSpeedMultiplier();
  return balls.map(ball => {
    const dynamicSpeed = calculateDynamicSpeed(ball.pathProgress);
    const moveAmount = dynamicSpeed * deltaTime * 0.001 * speedMultiplier;
    return {
      ...ball,
      pathProgress: ball.pathProgress + moveAmount,
    };
  });
}

export function processRollback(balls: Ball[], deltaTime: number): Ball[] {
  if (balls.length < 2) return balls;
  
  const spacing = getBallSpacing();
  const rollbackSpeed = 0.15;
  const rollbackAmount = rollbackSpeed * deltaTime * 0.001;
  
  const newBalls = [...balls];
  
  // Process from the FRONT of the chain (highest progress) to the back
  // This prevents chain compression from the end
  for (let i = newBalls.length - 2; i >= 0; i--) {
    const currentBall = newBalls[i];
    const nextBall = newBalls[i + 1];
    
    // Skip rollback near entrance to prevent stuttering when new balls spawn
    if (currentBall.pathProgress < spacing * 3) {
      continue;
    }
    
    const gap = nextBall.pathProgress - currentBall.pathProgress;
    const targetGap = spacing;
    
    // Only apply rollback if there's an actual gap that needs closing
    // This pulls the BACK ball forward, not the front ball backward
    if (gap > targetGap * 1.5) {
      const newProgress = Math.min(
        nextBall.pathProgress - targetGap,
        currentBall.pathProgress + rollbackAmount
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
  // Rainbow balls match any non-crypto ball
  if (ball1.isRainbow && !ball2.crypto) {
    debugLog(`ballsMatch rainbow: ball1 is rainbow, matches ${ball2.color}`);
    return true;
  }
  if (ball2.isRainbow && !ball1.crypto) {
    debugLog(`ballsMatch rainbow: ball2 is rainbow, matches ${ball1.color}`);
    return true;
  }
  
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
  
  debugLog(`[OP${opId}] findMatchingBalls START: insertIndex=${insertIndex}, targetBall.id=${targetBall.id}, color=${targetBall.color}, crypto=${targetBall.crypto}, isRainbow=${targetBall.isRainbow}`);
  
  const chainSnapshot = balls.slice(0, Math.min(15, balls.length)).map((b, i) => `${i}:${b.color?.slice(0,2)}[${b.id?.slice(-6)}]`).join(' ');
  debugLog(`[OP${opId}] Chain snapshot (first 15): ${chainSnapshot}`);
  
  // For rainbow balls, we need to find the color of adjacent balls to match against
  // Rainbow ball acts as a wildcard for the color of its neighbors
  let matchColor = targetBall.color;
  let matchCrypto = targetBall.crypto;
  
  if (targetBall.isRainbow) {
    // Find the color from the left or right neighbor
    const leftNeighbor = insertIndex > 0 ? balls[insertIndex - 1] : null;
    const rightNeighbor = insertIndex < balls.length - 1 ? balls[insertIndex + 1] : null;
    
    // Prefer non-crypto neighbor's color
    if (leftNeighbor && !leftNeighbor.crypto && !leftNeighbor.isRainbow) {
      matchColor = leftNeighbor.color;
      matchCrypto = undefined;
      debugLog(`  Rainbow using LEFT neighbor color: ${matchColor}`);
    } else if (rightNeighbor && !rightNeighbor.crypto && !rightNeighbor.isRainbow) {
      matchColor = rightNeighbor.color;
      matchCrypto = undefined;
      debugLog(`  Rainbow using RIGHT neighbor color: ${matchColor}`);
    } else {
      debugLog(`  Rainbow has no valid neighbor to match, no match possible`);
      return [];
    }
  }
  
  // Helper function for rainbow-aware matching
  const matchesTarget = (ball: Ball): boolean => {
    if (ball.isRainbow) return true; // Rainbow balls always match in a group
    if (matchCrypto) {
      return ball.crypto === matchCrypto;
    }
    return !ball.crypto && ball.color === matchColor;
  };
  
  let left = insertIndex - 1;
  while (left >= 0 && matchesTarget(balls[left])) {
    debugLog(`  LEFT match at ${left}: id=${balls[left].id}, color=${balls[left].color}, crypto=${balls[left].crypto}`);
    matches.unshift(left);
    left--;
  }
  
  let right = insertIndex + 1;
  while (right < balls.length && matchesTarget(balls[right])) {
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

export function insertBallInChain(
  balls: Ball[],
  shooterBall: Ball,
  insertIndex: number
): Ball[] {
  debugLog(`insertBallInChain: shooterBall.color=${shooterBall.color}, crypto=${shooterBall.crypto}, insertIndex=${insertIndex}, chainLength=${balls.length}`);
  
  const newBalls = [...balls];
  const spacing = getBallSpacing();
  
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
  const spacing = getBallSpacing();
  
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
  const spacing = getBallSpacing();
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
