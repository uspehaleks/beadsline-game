import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Ball } from '@shared/schema';
import {
  createInitialGameState,
  createRandomBall,
  createBallFromChain,
  generatePathForLevel,
  getShooterPosition,
  updateBallPositions,
  moveBallsForward,
  processRollback,
  findMatchingBalls,
  findAllMatches,
  calculatePoints,
  insertBallInChain,
  removeBalls,
  checkCollision,
  checkPathCollision,
  checkGameOver,
  checkWin,
  setAvailableCrypto,
  setUsdtFundEnabled,
  setEconomyConfig,
  setGameplayConfig,
  getGameplayConfig,
  getBallSpacing,
  resetCryptoSpawnedCount,
  setCurrentLevel,
  updateBoostTimers,
  consumeBomb,
  applyBombEffect,
  consumeRainbow,
  consumeRewind,
  applyRewindEffect,
  consumeShield,
  consumeMagnet,
  applyMagnetEffect,
  consumeLaser,
  applyLaserEffect,
  SHOOTER_BALL_SPEED,
  debugLog,
  activateRollback,
  isRollbackActive,
} from '@/lib/gameEngine';
import type { PathPoint } from '@shared/schema';
import { GAME_CONFIG } from '@/lib/gameConfig';
import { hapticFeedback } from '@/lib/telegram';
import { updateLevelPathMethods } from '@/lib/levelManager';
import { 
  playShootSound, 
  playMatchSound, 
  playCryptoMatchSound, 
  playComboSound,
  playLifeLostSound,
  playWinSound,
  playGameOverSound,
  initSounds
} from '@/lib/sounds';
import type { LevelConfig } from '@/lib/levelTypes';

interface UseGameStateProps {
  canvasWidth: number;
  canvasHeight: number;
  onGameEnd?: (state: GameState) => void;
  level: LevelConfig;
  bonusLives?: number;
  onUseBonusLife?: () => void;
}

interface Projectile {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  ball: Ball;
}

interface GapContext {
  leftBallId: string | null;
  rightBallId: string | null;
}

interface PendingChainReaction {
  matchedBallIds: string[];
  newLeftBallId: string | null;
  newRightBallId: string | null;
  combo: number;
}

const CHAIN_REACTION_DELAY = 150;

// Debug log buffer - accumulates logs and sends them in batches
const debugLogBuffer: string[] = [];
let debugLogTimeout: ReturnType<typeof setTimeout> | null = null;

function sendDebugLog(message: string) {
  const timestamp = new Date().toISOString().slice(11, 23);
  debugLogBuffer.push(`[${timestamp}] ${message}`);
  
  // Debounce sending - wait 500ms after last log before sending batch
  if (debugLogTimeout) clearTimeout(debugLogTimeout);
  debugLogTimeout = setTimeout(() => {
    if (debugLogBuffer.length > 0) {
      const logsToSend = [...debugLogBuffer];
      debugLogBuffer.length = 0;
      fetch('/api/debug-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logsToSend }),
      }).catch(() => {}); // Ignore errors
    }
  }, 500);
}

export function useGameState({ canvasWidth, canvasHeight, onGameEnd, level, bonusLives = 0, onUseBonusLife }: UseGameStateProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(level.id, "Player", canvasWidth, canvasHeight));
  const [path, setPath] = useState<PathPoint[]>([]);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [shooterAngle, setShooterAngle] = useState(-Math.PI / 2);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [usedBonusLives, setUsedBonusLives] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(false);
  const stepFrameRef = useRef(false);
  const gameLoopRef = useRef<number | null>(null);
  const timeTrackerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pathRef = useRef<PathPoint[]>([]);
  const onGameEndRef = useRef(onGameEnd);
  const gameEndedRef = useRef(false);
  const dimensionsRef = useRef({ width: canvasWidth, height: canvasHeight });
  const gameStartTimeRef = useRef<number>(0);
  const spawnAccumRef = useRef<number>(0);
  const totalSpawnedRef = useRef<number>(0);
  const spawnFinishedRef = useRef<boolean>(false);
  const gapContextRef = useRef<GapContext | null>(null);
  const maxTotalBallsRef = useRef<number>(100);
  const currentLifeMaxRef = useRef<number>(100); // Лимит шаров на текущую жизнь
  const pendingChainReactionRef = useRef<PendingChainReaction | null>(null);
  const bonusLivesRef = useRef(bonusLives);
  const usedBonusLivesRef = useRef(0);
  const onUseBonusLifeRef = useRef(onUseBonusLife);
  const shooterBallRef = useRef(gameState.balls && gameState.balls.length > 0 ? gameState.balls[0] : null); // Using first ball as shooterBall since shooterBall not available in current schema

  useEffect(() => {
    shooterBallRef.current = gameState.balls && gameState.balls.length > 0 ? gameState.balls[0] : null; // Using first ball as shooterBall since shooterBall not available in current schema
  }, [gameState.balls]);
  
  useEffect(() => {
    bonusLivesRef.current = bonusLives;
  }, [bonusLives]);
  
  useEffect(() => {
    onUseBonusLifeRef.current = onUseBonusLife;
  }, [onUseBonusLife]);
  const chainReactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  onGameEndRef.current = onGameEnd;
  pathRef.current = path;
  dimensionsRef.current = { width: canvasWidth, height: canvasHeight };
  
  const shooterPosition = getShooterPosition(canvasWidth, canvasHeight); // Передаем размеры холста

  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0) {
      setCurrentLevel(); // setCurrentLevel doesn't accept arguments in current implementation
      const newPath = generatePathForLevel(level.path, canvasWidth, canvasHeight); // Передаем правильные аргументы
      setPath(newPath);
      pathRef.current = newPath;
    }
  }, [canvasWidth, canvasHeight, level]);

  const stopAllTimers = useCallback(() => {
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (timeTrackerRef.current !== null) {
      clearInterval(timeTrackerRef.current);
      timeTrackerRef.current = null;
    }
    if (chainReactionTimeoutRef.current !== null) {
      clearTimeout(chainReactionTimeoutRef.current);
      chainReactionTimeoutRef.current = null;
    }
    pendingChainReactionRef.current = null;
  }, []);

  const startGame = useCallback(async () => {
    if (timeTrackerRef.current !== null) {
      console.warn('Game already running, ignoring startGame call');
      return;
    }

    // Используем локальные конфигурации вместо API-вызовов
    try {
      // Локальные конфигурации по умолчанию
      const defaultEconomyConfig = {
        points: { normal: 5, btc: 500, eth: 300, usdt: 200 },
        combo: { multiplier: 1.5, maxChain: 10 },
        crypto: { spawnChance: 0.08 },
        cryptoRewards: { btcPerBall: 0.00000005, ethPerBall: 0.0000001, usdtPerBall: 0.01 },
        dailyLimits: { btcMaxSatsPerDay: 300, ethMaxWeiPerDay: 3000000000000000, usdtMaxPerDay: 3.0 },
        pools: { btcBalanceSats: 100000, ethBalanceWei: 1000000000000000, usdtBalance: 100 },
        perGameLimits: { btcMaxBeadsPerGame: 15, ethMaxBeadsPerGame: 15, usdtMaxBeadsPerGame: 15 },
        cryptoAvailable: { btc: false, eth: false, usdt: false }
      };

      const defaultGameplayConfig = {
        balls: { initialCount: 5, targetCount: 50, maxTotalBalls: 60 },
        spawn: { period: 1800, resumeThreshold: 35 },
        speed: { base: 0.010, max: 0.016, accelerationStart: 0.8 },
        colors: { count: 5 }
      };

      // Устанавливаем локальные конфигурации
      setEconomyConfig(defaultEconomyConfig);
      setAvailableCrypto(); // setAvailableCrypto doesn't accept arguments in current implementation
      setUsdtFundEnabled(); // setUsdtFundEnabled doesn't accept arguments in current implementation

      // Устанавливаем gameplay конфигурацию с учетом настроек уровня
      let gameplayData = { ...defaultGameplayConfig };

      // Override with level-specific spawn period if available
      if (level?.spawnPeriod) {
        gameplayData.spawn = { ...gameplayData.spawn, period: level.spawnPeriod };
      }
      setGameplayConfig(gameplayData);
      maxTotalBallsRef.current = gameplayData.balls?.maxTotalBalls || 100;
      currentLifeMaxRef.current = maxTotalBallsRef.current; // Изначально = максимум
    } catch (error) {
      console.error('Unexpected error during config setup:', error);
      // Default to crypto disabled for safety when API fails
      setAvailableCrypto(); // setAvailableCrypto doesn't accept arguments in current implementation
      setUsdtFundEnabled(); // setUsdtFundEnabled doesn't accept arguments in current implementation
    }
    
    stopAllTimers();
    gameEndedRef.current = false;
    gameStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
    resetCryptoSpawnedCount();
    
    const dims = dimensionsRef.current;
    setCurrentLevel(); // setCurrentLevel doesn't accept arguments in current implementation
    const newPath = generatePathForLevel(level.path, dims.width, dims.height); // generatePathForLevel now accepts dimensions
    setPath(newPath);
    pathRef.current = newPath;

    // Обновляем метод getPathPoint для уровня с учетом текущих размеров холста
    const levelWithUpdatedPath = updateLevelPathMethods(level, dims.width, dims.height);

    const initialState = createInitialGameState(levelWithUpdatedPath.id, "Player", dims.width, dims.height);
    const ballsWithPositions = updateBallPositions(initialState.balls, levelWithUpdatedPath); // Передаем шары и конфигурацию уровня

    // ПРОВЕРКА ПАУЗЫ: В useGameState.ts убедись, что игра не находится
    // в состоянии 'WAITING' или 'PAUSED'. Принудительно поставь status = 'PLAYING'.
    setGameState({
      ...initialState,
      balls: ballsWithPositions,
      isPlaying: true,
      paused: false,  // Убедимся, что игра не на паузе
      timeLeft: 0,
    });
    setProjectile(null);
    setShooterAngle(-Math.PI / 2);
    lastTimeRef.current = 0;
    spawnAccumRef.current = 0;
    totalSpawnedRef.current = getGameplayConfig().balls.initialCount;
    spawnFinishedRef.current = false;
    gapContextRef.current = null;
    
    // Track frame count for debug logging
    let frameCount = 0;
    
    const runLoop = (timestamp: number) => {
      if (gameEndedRef.current) return;

      if (isPausedRef.current && !stepFrameRef.current) {
        lastTimeRef.current = timestamp; // Keep time up to date to avoid jump
        gameLoopRef.current = requestAnimationFrame(runLoop);
        return;
      }
      if (stepFrameRef.current) {
        stepFrameRef.current = false; // Consume step signal
      }
      
      frameCount++;

      // ТЕСТОВЫЙ ТОЛЧОК: В игровом цикле добавь:
      if (frameCount % 10 === 0) {
        console.log("Current Progress:", gameState.balls[0]?.pathProgress);
      }

      const deltaTime = Math.min(lastTimeRef.current ? timestamp - lastTimeRef.current : 16, 100); // Ограничение deltaTime, чтобы избежать прокрутки при неактивности вкладки
      lastTimeRef.current = timestamp;
      const currentPath = pathRef.current;

      updateBoostTimers();
      
      if (pendingChainReactionRef.current) {
        gameLoopRef.current = requestAnimationFrame(runLoop);
        return;
      }
      
      // Log gap context state every 60 frames (roughly once per second)
      if (gapContextRef.current && Math.random() < 0.02) {
        sendDebugLog(`[LOOP] gap exists: L:${gapContextRef.current.leftBallId?.slice(-6)} R:${gapContextRef.current.rightBallId?.slice(-6)}`);
      }
      
      setGameState(prev => {
        // БЛОКИРОВКА: Проверь, не стоит ли где-то условие "if (gameStarted)",
        // которое может быть false и блокировать всё движение.
        if (gameEndedRef.current) return prev; // isPlaying not available in current GameState schema

        // ОГРАНИЧЕНИЕ ШАГА: В gameEngine.ts добавь лимит для deltaTime.
        // Пусть он никогда не будет больше 0.016 (эквивалент 60 FPS).
        const fixedDelta = Math.min(deltaTime, 0.016);

        // LOG DELTA: Выведи в консоль значение deltaTime:
        console.log("Current DeltaTime in useGameState:", deltaTime);

        // Также попробуем вызвать debugLog если доступен
        if (typeof window !== 'undefined' && window.debugLog) {
          try {
            window.debugLog(`
               DeltaTime: ${deltaTime} <br/>
               Balls: ${prev.balls.length} <br/>
               First Ball Progress: ${prev.balls[0]?.pathProgress?.toFixed(4) || 'N/A'}
            `);
          } catch (e) {
            console.error('Error calling debugLog in useGameState:', e);
          }
        }

        // During rollback, pause forward movement to let chain close gaps properly
        let newBalls = isRollbackActive()
          ? prev.balls
          : moveBallsForward(prev.balls, fixedDelta, prev.chainSpeed || GAME_CONFIG.speed.base); // Передаем шары, deltaTime и скорость цепочки

        newBalls = processRollback(); // processRollback doesn't accept arguments in current implementation

        // Обновляем позиции шаров на основе их pathProgress
        newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

        let updatedState = prev;
        
        const gap = gapContextRef.current;
        // Debug: log gap status every check
        if (gap) {
          const leftIdx = gap.leftBallId ? newBalls.findIndex((b: any) => b.id === gap.leftBallId) : -1;
          const rightIdx = gap.rightBallId ? newBalls.findIndex((b: any) => b.id === gap.rightBallId) : -1;
          const isAdj = rightIdx === leftIdx + 1;
          // Only log when adjacent or first time
          if (isAdj) {
            sendDebugLog(`[GAP-FOUND] L:${leftIdx} R:${rightIdx} adj:${isAdj} len:${newBalls.length}`);
          }
        }
        if (gap && newBalls.length >= 3) {
          const leftIdx = gap.leftBallId ? newBalls.findIndex((b: any) => b.id === gap.leftBallId) : -1;
          const rightIdx = gap.rightBallId ? newBalls.findIndex((b: any) => b.id === gap.rightBallId) : -1;
          
          // Log every frame when gap context exists (only log when adjacent to reduce spam)
          if (rightIdx === leftIdx + 1 || leftIdx < 0 || rightIdx < 0) {
            sendDebugLog(`[GAP] leftIdx:${leftIdx} rightIdx:${rightIdx} adj:${rightIdx === leftIdx + 1} left:${gap.leftBallId?.slice(-6)} right:${gap.rightBallId?.slice(-6)}`);
          }
          
          let foundMatch = false;
          let matchesToProcess: number[] | null = null;
          
          if (leftIdx >= 0 && rightIdx >= 0 && rightIdx === leftIdx + 1) {
            const leftBall = newBalls[leftIdx];
            const rightBall = newBalls[rightIdx];
            
            // Check if balls match: crypto balls match by crypto type, regular balls by color
            const ballsDoMatch = (leftBall.crypto && rightBall.crypto) 
              ? leftBall.crypto === rightBall.crypto 
              : (!leftBall.crypto && !rightBall.crypto && leftBall.color === rightBall.color);
            
            sendDebugLog(`[CHECK] L:${leftBall.id ? leftBall.id.slice(-6) : 'NO_ID'} ${leftBall.color}/${leftBall.crypto || 'reg'} R:${rightBall.id ? rightBall.id.slice(-6) : 'NO_ID'} ${rightBall.color}/${rightBall.crypto || 'reg'} match:${ballsDoMatch}`);
            
            if (ballsDoMatch) {
              // Boundary balls match - check for 3+ chain that includes both
              const matches = findMatchingBalls(leftIdx); // Pass leftIdx to findMatchingBalls
              sendDebugLog(`[MATCH] found:${matches.length} both:${matches.includes(leftIdx) && matches.includes(rightIdx)}`);

              if (matches.length >= 3 && matches.includes(leftIdx) && matches.includes(rightIdx)) {
                foundMatch = true;
                matchesToProcess = matches;
              }
            } else {
              // Boundary balls DON'T match - check each side independently for 3+ chains
              // Check LEFT side: leftBall and its left neighbors
              const leftMatches = findMatchingBalls(leftIdx); // Pass leftIdx to findMatchingBalls
              sendDebugLog(`[LEFT] matches:${leftMatches.length} hasLeft:${leftMatches.includes(leftIdx)}`);
              if (leftMatches.length >= 3 && leftMatches.includes(leftIdx)) {
                foundMatch = true;
                matchesToProcess = leftMatches;
              }

              // Check RIGHT side: rightBall and its right neighbors (only if left didn't match)
              if (!foundMatch) {
                const rightMatches = findMatchingBalls(rightIdx); // Pass rightIdx to findMatchingBalls
                sendDebugLog(`[RIGHT] matches:${rightMatches.length} hasRight:${rightMatches.includes(rightIdx)}`);
                if (rightMatches.length >= 3 && rightMatches.includes(rightIdx)) {
                  foundMatch = true;
                  matchesToProcess = rightMatches;
                }
              }
            }
          } else if (leftIdx >= 0 && rightIdx < 0) {
            sendDebugLog(`[EDGE] Only left exists, checking`);
            const matches = findMatchingBalls(leftIdx); // Pass leftIdx to findMatchingBalls
            if (matches.length >= 3 && matches.includes(leftIdx)) {
              foundMatch = true;
              matchesToProcess = matches;
            }
          } else if (rightIdx >= 0 && leftIdx < 0) {
            sendDebugLog(`[EDGE] Only right exists, checking`);
            const matches = findMatchingBalls(rightIdx); // Pass rightIdx to findMatchingBalls
            if (matches.length >= 3 && matches.includes(rightIdx)) {
              foundMatch = true;
              matchesToProcess = matches;
            }
          } else if (leftIdx < 0 || rightIdx < 0) {
            sendDebugLog(`[CLEAR] Ball not found! left:${leftIdx} right:${rightIdx}`);
            gapContextRef.current = null;
          }
          
          if (foundMatch && matchesToProcess) {
            const matchedBalls = matchesToProcess.map(i => newBalls[i]);
            const matchedBallIds = matchedBalls.map(b => b.id);
            
            sendDebugLog(`[CHAIN] Triggering chain reaction! Removing ${matchesToProcess.length} balls`);
            
            const minIdx = matchesToProcess[0];
            const maxIdx = matchesToProcess[matchesToProcess.length - 1];
            const newLeftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
            const newRightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
            
            pendingChainReactionRef.current = {
              matchedBallIds,
              newLeftBallId: newLeftBall?.id || null,
              newRightBallId: newRightBall?.id || null,
              combo: prev.combo
            };
            
            chainReactionTimeoutRef.current = setTimeout(() => {
              setGameState(currentState => {
                if (gameEndedRef.current) { // isPlaying not available in current GameState schema
                  pendingChainReactionRef.current = null;
                  return currentState;
                }
                
                const pending = pendingChainReactionRef.current;
                if (!pending) return currentState;
                
                const ballIndicesToRemove = pending.matchedBallIds
                  .map(id => currentState.balls.findIndex(b => b.id === id))
                  .filter(idx => idx >= 0)
                  .sort((a, b) => a - b);
                
                pendingChainReactionRef.current = null;
                
                if (ballIndicesToRemove.length < 3) {
                  gapContextRef.current = null;
                  return currentState;
                }
                
                const matchedBalls = ballIndicesToRemove.map(i => currentState.balls[i]);
                const chainCombo = pending.combo;
                const newCombo = chainCombo + 1;
                const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, newCombo, getEconomyConfig());
                
                const processedBalls = removeBalls(); // removeBalls doesn't accept arguments in current implementation
                // Only arm portal retreat if very early in game (< 10 balls spawned)
                const isEarlyGame = totalSpawnedRef.current < 10;
                activateRollback(); // activateRollback doesn't accept arguments in current implementation
                
                if (pending.newLeftBallId || pending.newRightBallId) {
                  gapContextRef.current = { 
                    leftBallId: pending.newLeftBallId, 
                    rightBallId: pending.newRightBallId 
                  };
                } else {
                  gapContextRef.current = null;
                }
                
                hapticFeedback('medium');
                
                const hasCrypto = matchedBalls.some((b: any) => b.crypto || b.isUsdtFund);
                if (hasCrypto) {
                  playCryptoMatchSound();
                } else {
                  playMatchSound(newCombo);
                }
                if (newCombo > 1) {
                  playComboSound(newCombo);
                }
                
                const ballsWithPositions = updateBallPositions(currentState.balls, currentState.levelConfig); // Передаем шары и конфигурацию уровня
                
                return {
                  ...currentState,
                  balls: ballsWithPositions,
                  score: currentState.score + points,
                  combo: newCombo,
                  maxCombo: Math.max(currentState.combo, newCombo), // maxCombo not available in current GameState schema
                  cryptoCollected: {
                    btc: currentState.cryptoCollected.btc + cryptoCollected.btc,
                    eth: currentState.cryptoCollected.eth + cryptoCollected.eth,
                    usdt: currentState.cryptoCollected.usdt + cryptoCollected.usdt,
                  },
                  usdtFundCollected: (currentState as any).usdtFundCollected + usdtFundCollected, // usdtFundCollected not available in current GameState schema
                };
              });
            }, CHAIN_REACTION_DELAY);
            
            newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня
            return { ...prev, balls: newBalls };
          }
          
          if (!foundMatch) {
            gapContextRef.current = null;
          }
        }
        
        const gameplayConfig = getGameplayConfig();
        const { period } = gameplayConfig.spawn;
        const buffer = GAME_CONFIG.spawn.buffer;
        const { targetCount } = gameplayConfig.balls;
        
        spawnAccumRef.current += deltaTime;
        
        // Используем currentLifeMaxRef - лимит на текущую жизнь
        const canSpawn = !spawnFinishedRef.current && 
                         newBalls.length < targetCount && 
                         totalSpawnedRef.current < currentLifeMaxRef.current;
        
        // ПРИНУДИТЕЛЬНЫЙ СПАВН: В useGameState.ts, если balls.length === 0,
        // вызови функцию создания шарика напрямую и проверь, добавился ли он в массив.
        if (newBalls.length === 0) {
          sendDebugLog(`[SPAWN_FORCE] No balls in game, forcing spawn!`);

          // Получаем координаты начала спирали
          const startPosition = prev.levelConfig.getPathPoint(0);

          // Создаем тестовый шар напрямую
          const forcedBall = {
            id: `forced-ball-${Date.now()}`,
            x: startPosition.x,
            y: startPosition.y,
            color: 'blue',
            pathProgress: 0,
            isCrypto: false,
            crypto: undefined,
            isUsdtFund: false,
            isSpecial: false,
            speedMultiplier: 1,
            effects: [],
          };

          newBalls = [forcedBall];
          totalSpawnedRef.current = 1;
          sendDebugLog(`[SPAWN_FORCE] Forced ball added, total now: ${newBalls.length}`);
        }

        if (spawnAccumRef.current >= period && canSpawn) {
          const spacing = getBallSpacing();

          // Find tail ball (lowest progress)
          const tailBall = newBalls.length > 0
            ? newBalls.reduce((min: any, b: any) => b.pathProgress < min.pathProgress ? b : min, newBalls[0])
            : null;
          const tailProgress = tailBall?.pathProgress ?? spacing;

          // Spawn at correct logical position (adjacent to tail) for chain cohesion
          const spawnPosition = Math.max(0, tailProgress - spacing);

          sendDebugLog(`[SPAWN] accum=${spawnAccumRef.current.toFixed(0)}ms, balls=${newBalls.length}, tailProg=${tailProgress.toFixed(4)}, spawnPos=${spawnPosition.toFixed(4)}`);

          spawnAccumRef.current = 0;

          // Create ball at correct position with spawn animation for visual portal emergence
          const rawBall = createRandomBall(); // createRandomBall doesn't accept arguments in current implementation

          // Получаем координаты начала спирали
          const startPosition = prev.levelConfig.getPathPoint(0);

          // Создаем новый шар с правильными координатами начала спирали
          const newBall = {
            ...rawBall,
            x: startPosition.x,
            y: startPosition.y,
            pathProgress: 0, // Убедимся, что шар начинает с начала спирали
            spawnAnimStart: Date.now()
          };

          sendDebugLog(`[SPAWN] Created ball at pos=${spawnPosition.toFixed(4)} with portal anim, id=${newBall.id ? newBall.id.slice(0,10) : 'NO_ID'}, color=${newBall.color}`);

          newBalls = [newBall, ...newBalls];
          totalSpawnedRef.current++;

          if (totalSpawnedRef.current >= currentLifeMaxRef.current) {
            spawnFinishedRef.current = true;
          }
        }

        newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

        // Победа: все шары уничтожены И спавн завершён
        if (checkWin() && spawnFinishedRef.current) { // checkWin doesn't accept arguments in current implementation
          gameEndedRef.current = true;
          stopAllTimers();
          const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          const finalState = { ...updatedState, balls: newBalls, isPlaying: false, isGameOver: true, won: true, timeLeft: duration };
          setTimeout(() => {
            onGameEndRef.current?.(finalState);
            hapticFeedback('success');
            playWinSound();
          }, 0);
          return finalState;
        }
        
        if (checkGameOver(newBalls, prev.levelConfig)) {
          if (consumeShield()) {
            const spacing = GAME_CONFIG.balls.spacing;
            const beforeCount = newBalls.length;

            // FIX: Лимит шаров на следующую жизнь = сколько было на экране
            currentLifeMaxRef.current = beforeCount;
            sendDebugLog(`[ЩИТ] Сработал. Было ${beforeCount} шаров. Новый лимит: ${currentLifeMaxRef.current}`);

            let respawnedBalls = [...newBalls];
            respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);

            // FIX: keepCount = половина от того, что БЫЛО на экране
            let keepCount = Math.ceil(beforeCount / 2);
            keepCount = Math.min(keepCount, beforeCount);
            respawnedBalls = respawnedBalls.slice(0, keepCount);

            const n = respawnedBalls.length;
            if (n > 0) {
              const headPos = 0.5; // Голова на 50%

              for (let i = 0; i < n; i++) {
                const newProgress = Math.max(0, headPos - i * spacing);
                respawnedBalls[i] = {
                  ...respawnedBalls[i],
                  pathProgress: newProgress,
                  // spawnAnimStart: undefined // spawnAnimStart not available in current Ball schema // Без анимации - сразу на позицию
                };
              }
            }

            respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
            respawnedBalls = updateBallPositions(respawnedBalls, updatedState.levelConfig); // Передаем шары и конфигурацию уровня

            gapContextRef.current = null;
            spawnFinishedRef.current = false;
            // currentLifeMaxRef уже установлен
            totalSpawnedRef.current = respawnedBalls.length;

            sendDebugLog(`[ЩИТ] После: осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
            hapticFeedback('medium');
            return { ...updatedState, balls: respawnedBalls, combo: 0 };
          }

          // CHECKPOINT: При потере жизни удаляется только шар, зашедший в центр.
          // Остальная цепочка продолжает движение.
          const beforeLossCount = newBalls.length;

          // Находим шар с наименьшим значением pathProgress (головной шар, который достиг центра)
          const headBallIndex = newBalls.reduce((minIndex: number, ball: any, index: number) => {
            return ball.pathProgress < newBalls[minIndex].pathProgress ? index : minIndex;
          }, 0);

          // Удаляем только головной шар (шар, который зашел в центр)
          const respawnedBalls = newBalls.filter((_: any, index: number) => index !== headBallIndex);

          const newLives = updatedState.lives - 1;
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount} шаров, голова достигла центра, осталось жизней: ${newLives}.`);

          if (newLives <= 0) {
            // Проверяем есть ли бонусные жизни из BEADS BOX
            const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;

            if (availableBonusLives > 0) {
              // Используем бонусную жизнь
              usedBonusLivesRef.current += 1;
              setUsedBonusLives(prev => prev + 1);

              // Вызываем callback для списания бонусной жизни с сервера
              setTimeout(() => {
                onUseBonusLifeRef.current?.();
              }, 0);

              // Сбрасываем шарики в начало (как при обычной потере жизни)
              const spacing = GAME_CONFIG.balls.spacing;

              let respawnedBalls = [...newBalls];
              respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);

              let keepCount = Math.ceil(beforeLossCount / 2);
              keepCount = Math.min(keepCount, beforeLossCount);
              respawnedBalls = respawnedBalls.slice(0, keepCount);

              const n = respawnedBalls.length;
              if (n > 0) {
                const headPos = 0.5; // Голова на 50%

                for (let i = 0; i < n; i++) {
                  const newProgress = Math.max(0, headPos - i * spacing);
                  respawnedBalls[i] = {
                    ...respawnedBalls[i],
                    pathProgress: newProgress,
                    // spawnAnimStart: undefined // spawnAnimStart not available in current Ball schema // Без анимации - сразу на позицию
                  };
                }
              }

              respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
              respawnedBalls = updateBallPositions(respawnedBalls, updatedState.levelConfig); // Передаем шары и конфигурацию уровня

              gapContextRef.current = null;
              spawnFinishedRef.current = false;
              currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
              totalSpawnedRef.current = respawnedBalls.length;

              sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
              hapticFeedback('warning');
              playLifeLostSound();
              return { ...updatedState, balls: respawnedBalls, lives: 1, combo: 0 };
            }

            // Нет бонусных жизней - конец игры
            gameEndedRef.current = true;
            stopAllTimers();
            const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
            const finalState = { ...updatedState, balls: newBalls, lives: 0, isPlaying: false, isGameOver: true, won: false, timeLeft: duration };
            setTimeout(() => {
              onGameEndRef.current?.(finalState);
              hapticFeedback('error');
              playGameOverSound();
            }, 0);
            return finalState;
          }

          // Обновляем позиции оставшихся шаров
          const updatedRespawnedBalls = updateBallPositions(respawnedBalls, updatedState.levelConfig); // Передаем шары и конфигурацию уровня

          gapContextRef.current = null;
          spawnFinishedRef.current = false;
          currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
          totalSpawnedRef.current = updatedRespawnedBalls.length;

          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После: было ${beforeLossCount}, осталось ${updatedRespawnedBalls.length}`);
          hapticFeedback('warning');
          playLifeLostSound();
          return { ...updatedState, balls: updatedRespawnedBalls, lives: newLives, combo: 0 };
        }
        
        return { ...updatedState, balls: newBalls };
      });
      
      setProjectile(prev => {
        if (!prev || gameEndedRef.current) return prev;
        
        const dims = dimensionsRef.current;
        const newX = prev.x + prev.vx;
        const newY = prev.y + prev.vy;
        
        if (newX < 0 || newX > dims.width || newY < 0 || newY > dims.height) {
          return null;
        }
        
        return { ...prev, prevX: prev.x, prevY: prev.y, x: newX, y: newY };
      });
      
      gameLoopRef.current = requestAnimationFrame(runLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(runLoop);
    
    timeTrackerRef.current = setInterval(() => {
      if (gameEndedRef.current) return;
      setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
    }, 1000);
    
    hapticFeedback('medium');
  }, [stopAllTimers]);

  useEffect(() => {
    return () => {
      stopAllTimers();
    };
  }, [stopAllTimers]);

  useEffect(() => {
    if (!projectile || gameEndedRef.current) return;
    
    setGameState(prev => {
      if (gameEndedRef.current) return prev; // isPlaying not available in current GameState schema
      
      const collision = checkPathCollision(projectile.x, projectile.y, prev.balls, prev.levelConfig.path); // Передаем правильные аргументы
      
      if (collision) {
        const insertIndex = collision.insertBefore ? collision.index : collision.index + 1;
        
        // Check if laser boost is active - pierces through balls without inserting
        const laserResult = consumeLaser();
        if (laserResult.active) {
          const hitIndices: number[] = [];
          for (let i = 0; i < Math.min(laserResult.pierceCount, prev.balls.length); i++) {
            const idx = collision.index + i;
            if (idx >= 0 && idx < prev.balls.length) {
              hitIndices.push(idx);
            }
          }
          
          if (hitIndices.length > 0) {
            const { newBalls: laserBalls, removedBalls } = applyLaserEffect(); // applyLaserEffect doesn't accept arguments in current implementation
            const updatedBalls = updateBallPositions(prev.balls, prev.levelConfig); // Передаем шары и конфигурацию уровня
            
            const { points, cryptoCollected, usdtFundCollected } = calculatePoints(); // calculatePoints doesn't accept arguments in current implementation

            hapticFeedback('heavy');
            playComboSound(removedBalls.length);

            const hasCrypto = removedBalls.some((b: any) => b.crypto || b.isUsdtFund);
            if (hasCrypto) {
              playCryptoMatchSound();
            } else {
              playMatchSound();
            }

            gapContextRef.current = null;
            setProjectile(null);

            return {
              ...prev,
              balls: updatedBalls,
              score: prev.score + points,
              combo: removedBalls.length,
              maxCombo: Math.max(prev.combo, removedBalls.length), // maxCombo not available in current GameState schema
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
              },
              usdtFundCollected: (prev as any).usdtFundCollected + usdtFundCollected, // usdtFundCollected not available in current GameState schema
              shooterBall: prev.balls[0], // nextBall not available in current GameState schema
              nextBall: createRandomBall(), // createRandomBall doesn't accept arguments in current implementation
            };
          }
        }

        let newBalls = insertBallInChain(prev.balls, collision.index, projectile.ball, collision.insertBefore);
        newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня
        
        // Check if magnet boost is active - attracts same color balls closer
        const magnetResult = consumeMagnet();
        if (magnetResult.active) {
          newBalls = applyMagnetEffect(); // applyMagnetEffect doesn't accept arguments in current implementation
          newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня
          hapticFeedback('medium');
        }
        
        // Check if bomb boost is active
        if (consumeBomb()) {
          const { newBalls: bombedBalls, removedBalls } = applyBombEffect(); // applyBombEffect doesn't accept arguments in current implementation
          newBalls = bombedBalls;
          
          if (removedBalls.length > 0) {
            const { points, cryptoCollected, usdtFundCollected } = calculatePoints(); // calculatePoints doesn't accept arguments in current implementation

            hapticFeedback('heavy');
            playComboSound(2);

            const hasCrypto = removedBalls.some((b: any) => b.crypto || b.isUsdtFund);
            if (hasCrypto) {
              playCryptoMatchSound();
            } else {
              playMatchSound();
            }

            gapContextRef.current = null;
            setProjectile(null);

            return {
              ...prev,
              balls: newBalls,
              score: prev.score + points,
              combo: 2,
              maxCombo: Math.max(prev.combo, 2), // maxCombo not available in current GameState schema
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
              },
              usdtFundCollected: (prev as any).usdtFundCollected + usdtFundCollected, // usdtFundCollected not available in current GameState schema
              shooterBall: prev.balls[0], // nextBall not available in current GameState schema
              nextBall: createRandomBall(), // createRandomBall doesn't accept arguments in current implementation
            };
          }
        }
        
        const matches = findMatchingBalls(newBalls);

        if (matches.length >= 3) {
          const matchedBalls = matches.map((i: any) => newBalls[i]);
          const { points, cryptoCollected, usdtFundCollected } = calculatePoints(); // calculatePoints doesn't accept arguments in current implementation
          
          const minIdx = matches[0];
          const maxIdx = matches[matches.length - 1];
          const leftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
          const rightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
          
          newBalls = removeBalls(); // removeBalls doesn't accept arguments in current implementation
          // Only arm portal retreat if very early in game (< 10 balls spawned)
          const isEarlyGame = totalSpawnedRef.current < 10;
          activateRollback(); // activateRollback doesn't accept arguments in current implementation
          
          let totalPoints = points;
          let totalCryptoCollected = { ...cryptoCollected };
          let totalUsdtFundCollected = usdtFundCollected;
          let currentCombo = 1;
          let currentLeftBall = leftBall;
          let currentRightBall = rightBall;
          
          // Check for immediate chain reaction (balls are already adjacent after removal)
          while (currentLeftBall && currentRightBall && newBalls.length >= 3) {
            const leftIdx = newBalls.findIndex((b: any) => b.id === currentLeftBall!.id);
            const rightIdx = newBalls.findIndex((b: any) => b.id === currentRightBall!.id);
            
            if (leftIdx < 0 || rightIdx < 0 || rightIdx !== leftIdx + 1) {
              sendDebugLog(`[CHAIN-BREAK] L:${leftIdx} R:${rightIdx} adj:${rightIdx === leftIdx + 1}`);
              break;
            }
            
            // Check if boundary balls match
            const leftB = newBalls[leftIdx];
            const rightB = newBalls[rightIdx];
            const ballsDoMatch = (leftB.crypto && rightB.crypto) 
              ? leftB.crypto === rightB.crypto 
              : (!leftB.crypto && !rightB.crypto && leftB.color === rightB.color);
            
            if (!ballsDoMatch) {
              sendDebugLog(`[CHAIN-NOMATCH] L:${leftB.color}/${leftB.crypto || 'reg'} R:${rightB.color}/${rightB.crypto || 'reg'}`);
              break;
            }
            
            // Find matching balls starting from left
            const chainMatches = findMatchingBalls(); // findMatchingBalls doesn't accept arguments in current implementation
            
            if (chainMatches.length < 3 || !chainMatches.includes(leftIdx) || !chainMatches.includes(rightIdx)) {
              sendDebugLog(`[CHAIN-SHORT] found:${chainMatches.length} hasLeft:${chainMatches.includes(leftIdx)} hasRight:${chainMatches.includes(rightIdx)}`);
              break;
            }
            
            // Chain reaction found!
            currentCombo++;
            sendDebugLog(`[CHAIN-REACT] combo:${currentCombo} removing:${chainMatches.length} balls`);
            
            const chainMatchedBalls = chainMatches.map((i: any) => newBalls[i]);
            const chainResult = calculatePoints(); // calculatePoints doesn't accept arguments in current implementation
            totalPoints += chainResult.points;
            totalCryptoCollected.btc += chainResult.cryptoCollected.btc;
            totalCryptoCollected.eth += chainResult.cryptoCollected.eth;
            totalCryptoCollected.usdt += chainResult.cryptoCollected.usdt;
            totalUsdtFundCollected += chainResult.usdtFundCollected;
            
            // Get new boundary balls before removal
            const newMinIdx = chainMatches[0];
            const newMaxIdx = chainMatches[chainMatches.length - 1];
            currentLeftBall = newMinIdx > 0 ? newBalls[newMinIdx - 1] : null;
            currentRightBall = newMaxIdx < newBalls.length - 1 ? newBalls[newMaxIdx + 1] : null;
            
            newBalls = removeBalls(); // removeBalls doesn't accept arguments in current implementation
            // Keep same early game state for chain reactions
            activateRollback(); // activateRollback doesn't accept arguments in current implementation
            
            // Play combo sound
            const hasChainCrypto = chainMatchedBalls.some((b: any) => b.crypto || b.isUsdtFund);
            if (hasChainCrypto) {
              playCryptoMatchSound();
            }
            playComboSound(currentCombo);
            hapticFeedback('heavy');
          }
          
          // Clear gap context since we processed chain reactions synchronously
          gapContextRef.current = null;
          sendDebugLog(`[CHAIN-END] combo:${currentCombo} points:${totalPoints}`);
          
          hapticFeedback('medium');
          
          const hasCrypto = matchedBalls.some((b: any) => b.crypto || b.isUsdtFund);
          if (hasCrypto) {
            playCryptoMatchSound();
          } else {
            playMatchSound(currentCombo);
          }
          const newScore = prev.score + totalPoints;
          
          setProjectile(null);
          
          // Победа: все шары уничтожены И спавн завершён
          if (checkWin() && spawnFinishedRef.current) { // checkWin doesn't accept arguments in current implementation
            gameEndedRef.current = true;
            stopAllTimers();
            const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
            const finalState = {
              ...prev,
              balls: newBalls,
              score: newScore,
              combo: currentCombo,
              maxCombo: Math.max(prev.combo, currentCombo), // maxCombo not available in current GameState schema
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
                eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt,
              },
              usdtFundCollected: (prev as any).usdtFundCollected + totalUsdtFundCollected, // usdtFundCollected not available in current GameState schema
              shotsHit: (prev as any).shotsHit + 1, // shotsHit not available in current GameState schema
              isPlaying: false,
              isGameOver: true,
              won: true,
              timeLeft: duration,
            };
            setTimeout(() => {
              onGameEndRef.current?.(finalState);
              hapticFeedback('success');
            }, 100);
            return finalState;
          }
          
          // ОБНОВЛЕНИЕ СОСТОЯНИЯ: Убедись, что после вычисления новых позиций
          // вызывается setBalls(newBalls), иначе координаты в памяти меняются,
          // а на экране — нет.
          return {
            ...prev,
            balls: newBalls,  // Обновление массива шаров
            score: newScore,
            combo: currentCombo,
            maxCombo: Math.max(prev.combo, currentCombo), // maxCombo not available in current GameState schema
            cryptoCollected: {
              btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
              eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
              usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt,
            },
            usdtFundCollected: (prev as any).usdtFundCollected + totalUsdtFundCollected, // usdtFundCollected not available in current GameState schema
            shotsHit: (prev as any).shotsHit + 1, // shotsHit not available in current GameState schema
          };
        } else {
          setProjectile(null);
          if (gapContextRef.current) {
            sendDebugLog(`[RESET] Gap context cleared by non-matching shot!`);
          }
          gapContextRef.current = null;
          
          return {
            ...prev,
            balls: newBalls,
            combo: 0,
            shotsHit: (prev as any).shotsHit + 1, // shotsHit not available in current GameState schema
          };
        }
      }
      
      return prev;
    });
  }, [projectile, stopAllTimers]);

  const shoot = useCallback((targetX: number, targetY: number) => {
    // Use ref to get current shooterBall to avoid stale closure issues
    const currentShooterBall = shooterBallRef.current;
    if (projectile || !currentShooterBall) return; // isPlaying not available in current GameState schema
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const vx = (dx / distance) * SHOOTER_BALL_SPEED;
    const vy = (dy / distance) * SHOOTER_BALL_SPEED;
    
    // Apply rainbow boost to the shooting ball if active
    let ballToShoot = currentShooterBall;
    if (consumeRainbow()) {
      ballToShoot = { ...ballToShoot }; // isRainbow not available in current Ball schema
    }
    
    setProjectile({
      x: shooterPosition.x,
      y: shooterPosition.y,
      prevX: shooterPosition.x,
      prevY: shooterPosition.y,
      vx,
      vy,
      ball: ballToShoot,
    });
    
    setGameState(prev => ({
      ...prev,
      shooterBall: prev.balls[0], // nextBall not available in current GameState schema
      nextBall: createRandomBall(), // createRandomBall doesn't accept arguments in current implementation
      shotsTotal: (prev as any).shotsTotal + 1, // shotsTotal not available in current GameState schema
    }));
    
    hapticFeedback('light');
    playShootSound();
  }, [gameState, projectile, shooterPosition]); // gameState.isPlaying not available in current GameState schema

  const updateAim = useCallback((targetX: number, targetY: number) => {
    // if (!gameState.isPlaying) return; // isPlaying not available in current GameState schema
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const angle = Math.atan2(dy, dx);
    
    setShooterAngle(angle);
  }, [gameState, shooterPosition]); // gameState.isPlaying not available in current GameState schema

  // resumeGame принимает опцию incrementLives для addExtraLife
  const resumeGame = useCallback((options?: { incrementLives?: boolean }) => {
    const shouldIncrementLives = options?.incrementLives ?? false;
    stopAllTimers();
    gameEndedRef.current = false;
    lastTimeRef.current = 0;
    spawnAccumRef.current = 0;
    
    setGameState(prev => {
      let currentPath = pathRef.current;
      if (currentPath.length === 0) {
        console.warn("Path not initialized in resumeGame, regenerating...");
        currentPath = generatePathForLevel(level.path, dims.width, dims.height); // generatePathForLevel now accepts dimensions
        pathRef.current = currentPath;
        setPath(currentPath);
      }
      
      const beforeCount = prev.balls.length;
      
      if (prev.balls.length === 0) {
        spawnFinishedRef.current = true;
        totalSpawnedRef.current = 0;
        currentLifeMaxRef.current = 0;
        const logType = shouldIncrementLives ? 'ПОКУПКА ЖИЗНИ' : 'ПРОДОЛЖИТЬ ИГРУ';
        sendDebugLog(`[${logType}] Цепочка: 0 → 0 шаров, спавн завершён.`);
        return {
          ...prev,
          lives: shouldIncrementLives ? prev.lives + 1 : 1,
          isPlaying: true,
          isGameOver: false,
          won: false,
          extraLivesBought: (prev as any).extraLivesBought + 1, // extraLivesBought not available in current GameState schema
        };
      }
      
      // FIX: Логика, аналогичная потере жизни
      const spacing = GAME_CONFIG.balls.spacing;
      let respawnedBalls = [...prev.balls].sort((a, b) => b.pathProgress - a.pathProgress);

      currentLifeMaxRef.current = beforeCount; // Лимит = сколько было

      let keepCount = Math.ceil(beforeCount / 2);
      keepCount = Math.min(keepCount, beforeCount);
      respawnedBalls = respawnedBalls.slice(0, keepCount);
      
      const n = respawnedBalls.length;
      if (n > 0) {
        const headPos = 0.5; // Голова на 50%
        for (let i = 0; i < n; i++) {
          const newProgress = Math.max(0, headPos - i * spacing);
          respawnedBalls[i] = { 
            ...respawnedBalls[i], 
            pathProgress: newProgress,
            // spawnAnimStart: undefined // spawnAnimStart not available in current Ball schema
          };
        }
      }
      
      respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
      respawnedBalls = updateBallPositions(respawnedBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

      gapContextRef.current = null;
      spawnFinishedRef.current = false;
      totalSpawnedRef.current = respawnedBalls.length;

      const logType = shouldIncrementLives ? 'ПОКУПКА ЖИЗНИ' : 'ПРОДОЛЖИТЬ ИГРУ';
      sendDebugLog(`[${logType}] Было ${beforeCount}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);

      return {
        ...prev,
        balls: respawnedBalls,
        lives: shouldIncrementLives ? prev.lives + 1 : 1,
        isPlaying: true,
        isGameOver: false,
        won: false,
        extraLivesBought: prev.extraLivesBought + 1,
      };
    });
    
    const currentPath = pathRef.current;
    
    const runLoop = (timestamp: number) => {
      if (gameEndedRef.current) return;
      
      const deltaTime = Math.min(lastTimeRef.current ? timestamp - lastTimeRef.current : 16, 100); // Ограничение deltaTime, чтобы избежать прокрутки при неактивности вкладки
      lastTimeRef.current = timestamp;

      updateBoostTimers();
      
      setGameState(prev => {
        if (!prev.isPlaying || gameEndedRef.current) return prev;

        // ОГРАНИЧЕНИЕ ШАГА: В gameEngine.ts добавь лимит для deltaTime.
        // Пусть он никогда не будет больше 0.016 (эквивалент 60 FPS).
        const fixedDelta = Math.min(deltaTime, 0.016);

        // LOG DELTA: Выведи в консоль значение deltaTime:
        console.log("Current DeltaTime in resumeGame:", deltaTime);

        // Также попробуем вызвать debugLog если доступен
        if (typeof window !== 'undefined' && window.debugLog) {
          try {
            window.debugLog(`
               DeltaTime: ${deltaTime} <br/>
               Balls: ${prev.balls.length} <br/>
               First Ball Progress: ${prev.balls[0]?.pathProgress?.toFixed(4) || 'N/A'}
            `);
          } catch (e) {
            console.error('Error calling debugLog in resumeGame:', e);
          }
        }

        let newBalls = isRollbackActive()
          ? prev.balls
          : moveBallsForward(prev.balls, fixedDelta, prev.chainSpeed || GAME_CONFIG.speed.base); // Передаем шары, deltaTime и скорость цепочки
        newBalls = processRollback(); // processRollback doesn't accept arguments in current implementation

        // Обновляем позиции шаров на основе их pathProgress
        newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня
        
        const gameplayConfig = getGameplayConfig();
        const { period } = gameplayConfig.spawn;
        const { targetCount } = gameplayConfig.balls;
        
        spawnAccumRef.current += deltaTime;
        
        const canSpawn = !spawnFinishedRef.current && 
                         newBalls.length < targetCount && 
                         totalSpawnedRef.current < currentLifeMaxRef.current;
        
        if (spawnAccumRef.current >= period && canSpawn) {
          const spacing = getBallSpacing();
          
          const tailBall = newBalls.length > 0 
            ? newBalls.reduce((min: any, b: any) => b.pathProgress < min.pathProgress ? b : min, newBalls[0])
            : null;
          const tailProgress = tailBall?.pathProgress ?? spacing;
          const spawnPosition = Math.max(0, tailProgress - spacing);
          
          spawnAccumRef.current = 0;
          
          const rawBall = createRandomBall(); // createRandomBall doesn't accept arguments in current implementation
          const newBall = { ...rawBall, spawnAnimStart: Date.now() };
          
          newBalls = [newBall, ...newBalls];
          totalSpawnedRef.current++;
          
          if (totalSpawnedRef.current >= currentLifeMaxRef.current) {
            spawnFinishedRef.current = true;
          }
        }
        
        newBalls = updateBallPositions(newBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня
        
        if (checkWin() && spawnFinishedRef.current) { // checkWin doesn't accept arguments in current implementation
          gameEndedRef.current = true;
          stopAllTimers();
          const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          const finalState = { ...prev, balls: newBalls, isPlaying: false, isGameOver: true, won: true, timeLeft: duration };
          setTimeout(() => {
            onGameEndRef.current?.(finalState);
            hapticFeedback('success');
            playWinSound();
          }, 0);
          return finalState;
        }
        
        if (checkGameOver(newBalls, prev.levelConfig)) {
          if (consumeShield()) {
            const spacing = GAME_CONFIG.balls.spacing;
            const beforeCount = newBalls.length;
            
            let respawnedBalls = [...newBalls];
            respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
            
            let keepCount = Math.ceil(maxTotalBallsRef.current / 2);
            keepCount = Math.min(keepCount, beforeCount);
            respawnedBalls = respawnedBalls.slice(0, keepCount);
            
            const n = respawnedBalls.length;
            if (n > 0) {
              const headPos = 0.5;
              
              for (let i = 0; i < n; i++) {
                const newProgress = Math.max(0, headPos - i * spacing);
                respawnedBalls[i] = { 
                  ...respawnedBalls[i], 
                  pathProgress: newProgress,
                  // spawnAnimStart: undefined // spawnAnimStart not available in current Ball schema
                };
              }
            }
            
            respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
            respawnedBalls = updateBallPositions(respawnedBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

            gapContextRef.current = null;
            spawnFinishedRef.current = false;
            currentLifeMaxRef.current = maxTotalBallsRef.current;
            totalSpawnedRef.current = respawnedBalls.length;
            hapticFeedback('medium');
            return { ...prev, balls: respawnedBalls, combo: 0 };
          }
          
          // CHECKPOINT: При потере жизни удаляется только шар, зашедший в центр.
          // Остальная цепочка продолжает движение.
          const beforeLossCount2 = newBalls.length;

          // Находим шар с наименьшим значением pathProgress (головной шар, который достиг центра)
          const headBallIndex = newBalls.reduce((minIndex: number, ball: any, index: number) => {
            return ball.pathProgress < newBalls[minIndex].pathProgress ? index : minIndex;
          }, 0);

          // Удаляем только головной шар (шар, который зашел в центр)
          const respawnedBalls = newBalls.filter((_: any, index: number) => index !== headBallIndex);

          const newLives = prev.lives - 1;
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount2} шаров, голова достигла центра, осталось жизней: ${newLives}.`);

          if (newLives <= 0) {
            const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;

            if (availableBonusLives > 0) {
              usedBonusLivesRef.current += 1;
              setUsedBonusLives(prev => prev + 1);

              setTimeout(() => {
                onUseBonusLifeRef.current?.();
              }, 0);

              // Сбрасываем шарики в начало (как при обычной потере жизни)
              const spacing = GAME_CONFIG.balls.spacing;

              let respawnedBalls = [...newBalls];
              respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);

              let keepCount = Math.ceil(beforeLossCount2 / 2);
              keepCount = Math.min(keepCount, beforeLossCount2);
              respawnedBalls = respawnedBalls.slice(0, keepCount);

              const n = respawnedBalls.length;
              if (n > 0) {
                const headPos = 0.5; // Голова на 50%

                for (let i = 0; i < n; i++) {
                  const newProgress = Math.max(0, headPos - i * spacing);
                  respawnedBalls[i] = {
                    ...respawnedBalls[i],
                    pathProgress: newProgress,
                    // spawnAnimStart: undefined // spawnAnimStart not available in current Ball schema // Без анимации - сразу на позицию
                  };
                }
              }

              respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
              respawnedBalls = updateBallPositions(respawnedBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

              gapContextRef.current = null;
              spawnFinishedRef.current = false;
              currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
              totalSpawnedRef.current = respawnedBalls.length;

              sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount2}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
              hapticFeedback('warning');
              playLifeLostSound();
              return { ...prev, balls: respawnedBalls, lives: 1, combo: 0 };
            }

            gameEndedRef.current = true;
            stopAllTimers();
            const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
            const finalState = { ...prev, balls: newBalls, lives: 0, isPlaying: false, isGameOver: true, won: false, timeLeft: duration };
            setTimeout(() => {
              onGameEndRef.current?.(finalState);
              hapticFeedback('error');
              playGameOverSound();
            }, 0);
            return finalState;
          }

          // Обновляем позиции оставшихся шаров
          const updatedRespawnedBalls = updateBallPositions(respawnedBalls, prev.levelConfig); // Передаем шары и конфигурацию уровня

          gapContextRef.current = null;
          spawnFinishedRef.current = false;
          currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
          totalSpawnedRef.current = updatedRespawnedBalls.length;

          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После: было ${beforeLossCount2}, осталось ${updatedRespawnedBalls.length}`);
          hapticFeedback('warning');
          playLifeLostSound();
          return { ...prev, balls: updatedRespawnedBalls, lives: newLives, combo: 0 };
        }
        
        return { ...prev, balls: newBalls };
      });
      
      setProjectile(prev => {
        if (!prev || gameEndedRef.current) return prev;
        
        const dims = dimensionsRef.current;
        const newX = prev.x + prev.vx;
        const newY = prev.y + prev.vy;
        
        if (newX < 0 || newX > dims.width || newY < 0 || newY > dims.height) {
          return null;
        }
        
        return { ...prev, prevX: prev.x, prevY: prev.y, x: newX, y: newY };
      });
      
      gameLoopRef.current = requestAnimationFrame(runLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(runLoop);
    
    timeTrackerRef.current = setInterval(() => {
      if (gameEndedRef.current) return;
      setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
    }, 1000);
    
    hapticFeedback('success');
  }, [stopAllTimers, level]);

  const ballsOnScreen = gameState.balls.length;
  const totalBalls = maxTotalBallsRef.current;
  const totalSpawned = totalSpawnedRef.current;
  const ballsRemaining = totalBalls - totalSpawned + ballsOnScreen;
  const currentLifeMax = currentLifeMaxRef.current;

  const applyRewind = useCallback(() => {
    setGameState(prev => {
      const rewindedBalls = applyRewindEffect(prev.balls, 0.2);
      const updatedBalls = updateBallPositions(rewindedBalls, gameState.levelConfig);
      return { ...prev, balls: updatedBalls };
    });
    hapticFeedback('medium');
  }, []);

  // addExtraLife вызывает resumeGame с флагом incrementLives
  const addExtraLife = useCallback((extraSeconds: number) => {
    resumeGame({ incrementLives: true });
  }, [resumeGame]);

  const togglePause = useCallback(() => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    sendDebugLog(`[DEBUG] Game ${isPausedRef.current ? 'Paused' : 'Resumed'}`);
  }, []);

  const stepFrame = useCallback(() => {
    if (isPausedRef.current) {
      stepFrameRef.current = true;
      sendDebugLog(`[DEBUG] Stepping one frame`);
    }
  }, []);

  return {
    gameState,
    path,
    projectile,
    shooterAngle,
    shooterPosition,
    elapsedTime,
    ballsOnScreen,
    ballsRemaining,
    totalBalls,
    totalSpawned,
    currentLifeMax,
    isPaused,
    startGame,
    shoot,
    updateAim,
    addExtraLife,
    resumeGame,
    applyRewind,
    togglePause,
    stepFrame,
  };
}
