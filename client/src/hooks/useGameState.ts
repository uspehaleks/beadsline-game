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
  type PathPoint,
} from '@/lib/gameEngine';
import { GAME_CONFIG } from '@/lib/gameConfig';
import { hapticFeedback } from '@/lib/telegram';
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
import type { LevelConfig } from '@/lib/levelConfig';

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
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [path, setPath] = useState<PathPoint[]>([]);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [shooterAngle, setShooterAngle] = useState(-Math.PI / 2);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [usedBonusLives, setUsedBonusLives] = useState(0);
  
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
  const pendingChainReactionRef = useRef<PendingChainReaction | null>(null);
  const bonusLivesRef = useRef(bonusLives);
  const usedBonusLivesRef = useRef(0);
  const onUseBonusLifeRef = useRef(onUseBonusLife);
  const shooterBallRef = useRef(gameState.shooterBall);
  
  useEffect(() => {
    shooterBallRef.current = gameState.shooterBall;
  }, [gameState.shooterBall]);
  
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
  
  const shooterPosition = getShooterPosition(canvasWidth, canvasHeight);

  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0) {
      setCurrentLevel(level);
      const newPath = generatePathForLevel(canvasWidth, canvasHeight, level);
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
    
    try {
      const [economyRes, gameplayRes, cryptoAvailRes] = await Promise.all([
        fetch('/api/game-economy'),
        fetch('/api/gameplay-config'),
        fetch('/api/crypto-availability', { credentials: 'include' }),
      ]);
      
      // Default to crypto disabled for safety
      let cryptoAvailable = { btc: false, eth: false, usdt: false };
      
      if (economyRes.ok) {
        const economyData = await economyRes.json();
        setEconomyConfig(economyData);
        // Get crypto availability from economy config (respects cryptoFundEnabled toggle)
        cryptoAvailable = economyData.cryptoAvailable || { btc: false, eth: false, usdt: false };
        setUsdtFundEnabled(economyData.usdtFundEnabled === true);
      }
      
      if (cryptoAvailRes.ok) {
        const cryptoAvail = await cryptoAvailRes.json();
        // Only override if crypto-availability returns explicit values
        // This endpoint also respects cryptoFundEnabled, so use AND logic
        cryptoAvailable = {
          btc: cryptoAvailable.btc && (cryptoAvail.btcEnabled === true),
          eth: cryptoAvailable.eth && (cryptoAvail.ethEnabled === true),
          usdt: cryptoAvailable.usdt && (cryptoAvail.usdtEnabled === true),
        };
      }
      
      setAvailableCrypto(cryptoAvailable);
      
      if (gameplayRes.ok) {
        const gameplayData = await gameplayRes.json();
        // Override with level-specific spawn period if available
        if (level?.spawnPeriod) {
          gameplayData.spawn = { ...gameplayData.spawn, period: level.spawnPeriod };
        }
        setGameplayConfig(gameplayData);
        maxTotalBallsRef.current = gameplayData.balls?.maxTotalBalls || 100;
      }
    } catch (error) {
      console.error('Failed to fetch game config:', error);
      // Default to crypto disabled for safety when API fails
      setAvailableCrypto({ btc: false, eth: false, usdt: false });
      setUsdtFundEnabled(false);
    }
    
    stopAllTimers();
    gameEndedRef.current = false;
    gameStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
    resetCryptoSpawnedCount();
    
    const dims = dimensionsRef.current;
    setCurrentLevel(level);
    const newPath = generatePathForLevel(dims.width, dims.height, level);
    setPath(newPath);
    pathRef.current = newPath;
    
    const initialState = createInitialGameState();
    const ballsWithPositions = updateBallPositions(initialState.balls, newPath);
    
    setGameState({
      ...initialState,
      balls: ballsWithPositions,
      isPlaying: true,
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
      
      frameCount++;
      
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
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
        if (!prev.isPlaying || gameEndedRef.current) return prev;
        
        // During rollback, pause forward movement to let chain close gaps properly
        let newBalls = isRollbackActive() 
          ? prev.balls 
          : moveBallsForward(prev.balls, deltaTime);
        
        newBalls = processRollback(newBalls, deltaTime, spawnFinishedRef.current);
        
        let updatedState = prev;
        
        const gap = gapContextRef.current;
        // Debug: log gap status every check
        if (gap) {
          const leftIdx = gap.leftBallId ? newBalls.findIndex(b => b.id === gap.leftBallId) : -1;
          const rightIdx = gap.rightBallId ? newBalls.findIndex(b => b.id === gap.rightBallId) : -1;
          const isAdj = rightIdx === leftIdx + 1;
          // Only log when adjacent or first time
          if (isAdj) {
            sendDebugLog(`[GAP-FOUND] L:${leftIdx} R:${rightIdx} adj:${isAdj} len:${newBalls.length}`);
          }
        }
        if (gap && newBalls.length >= 3) {
          const leftIdx = gap.leftBallId ? newBalls.findIndex(b => b.id === gap.leftBallId) : -1;
          const rightIdx = gap.rightBallId ? newBalls.findIndex(b => b.id === gap.rightBallId) : -1;
          
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
            
            sendDebugLog(`[CHECK] L:${leftBall.id.slice(-6)} ${leftBall.color}/${leftBall.crypto || 'reg'} R:${rightBall.id.slice(-6)} ${rightBall.color}/${rightBall.crypto || 'reg'} match:${ballsDoMatch}`);
            
            if (ballsDoMatch) {
              // Boundary balls match - check for 3+ chain that includes both
              const matches = findMatchingBalls(newBalls, leftIdx, leftBall);
              sendDebugLog(`[MATCH] found:${matches.length} both:${matches.includes(leftIdx) && matches.includes(rightIdx)}`);
              
              if (matches.length >= 3 && matches.includes(leftIdx) && matches.includes(rightIdx)) {
                foundMatch = true;
                matchesToProcess = matches;
              }
            } else {
              // Boundary balls DON'T match - check each side independently for 3+ chains
              // Check LEFT side: leftBall and its left neighbors
              const leftMatches = findMatchingBalls(newBalls, leftIdx, leftBall);
              sendDebugLog(`[LEFT] matches:${leftMatches.length} hasLeft:${leftMatches.includes(leftIdx)}`);
              if (leftMatches.length >= 3 && leftMatches.includes(leftIdx)) {
                foundMatch = true;
                matchesToProcess = leftMatches;
              }
              
              // Check RIGHT side: rightBall and its right neighbors (only if left didn't match)
              if (!foundMatch) {
                const rightMatches = findMatchingBalls(newBalls, rightIdx, rightBall);
                sendDebugLog(`[RIGHT] matches:${rightMatches.length} hasRight:${rightMatches.includes(rightIdx)}`);
                if (rightMatches.length >= 3 && rightMatches.includes(rightIdx)) {
                  foundMatch = true;
                  matchesToProcess = rightMatches;
                }
              }
            }
          } else if (leftIdx >= 0 && rightIdx < 0) {
            sendDebugLog(`[EDGE] Only left exists, checking`);
            const matches = findMatchingBalls(newBalls, leftIdx, newBalls[leftIdx]);
            if (matches.length >= 3 && matches.includes(leftIdx)) {
              foundMatch = true;
              matchesToProcess = matches;
            }
          } else if (rightIdx >= 0 && leftIdx < 0) {
            sendDebugLog(`[EDGE] Only right exists, checking`);
            const matches = findMatchingBalls(newBalls, rightIdx, newBalls[rightIdx]);
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
                if (!currentState.isPlaying || gameEndedRef.current) {
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
                const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, chainCombo);
                
                const processedBalls = removeBalls(currentState.balls, ballIndicesToRemove);
                // Only arm portal retreat if very early in game (< 10 balls spawned)
                const isEarlyGame = totalSpawnedRef.current < 10;
                activateRollback(isEarlyGame);
                
                if (pending.newLeftBallId || pending.newRightBallId) {
                  gapContextRef.current = { 
                    leftBallId: pending.newLeftBallId, 
                    rightBallId: pending.newRightBallId 
                  };
                } else {
                  gapContextRef.current = null;
                }
                
                hapticFeedback('medium');
                
                const hasCrypto = matchedBalls.some(b => b.crypto || b.isUsdtFund);
                if (hasCrypto) {
                  playCryptoMatchSound();
                } else {
                  playMatchSound(newCombo);
                }
                if (newCombo > 1) {
                  playComboSound(newCombo);
                }
                
                const ballsWithPositions = updateBallPositions(processedBalls, pathRef.current);
                
                return {
                  ...currentState,
                  balls: ballsWithPositions,
                  score: currentState.score + points,
                  combo: newCombo,
                  maxCombo: Math.max(currentState.maxCombo, newCombo),
                  cryptoCollected: {
                    btc: currentState.cryptoCollected.btc + cryptoCollected.btc,
                    eth: currentState.cryptoCollected.eth + cryptoCollected.eth,
                    usdt: currentState.cryptoCollected.usdt + cryptoCollected.usdt,
                  },
                  usdtFundCollected: currentState.usdtFundCollected + usdtFundCollected,
                };
              });
            }, CHAIN_REACTION_DELAY);
            
            newBalls = updateBallPositions(newBalls, currentPath);
            return { ...prev, balls: newBalls };
          }
          
          if (!foundMatch) {
            gapContextRef.current = null;
          }
        }
        
        const gameplayConfig = getGameplayConfig();
        const { period } = gameplayConfig.spawn;
        const buffer = GAME_CONFIG.spawn.buffer;
        const { targetCount, maxTotalBalls } = gameplayConfig.balls;
        
        spawnAccumRef.current += deltaTime;
        
        const canSpawn = !spawnFinishedRef.current && 
                         newBalls.length < targetCount && 
                         totalSpawnedRef.current < maxTotalBalls;
        
        if (spawnAccumRef.current >= period && canSpawn) {
          const spacing = getBallSpacing();
          
          // Find tail ball (lowest progress)
          const tailBall = newBalls.length > 0 
            ? newBalls.reduce((min, b) => b.pathProgress < min.pathProgress ? b : min, newBalls[0])
            : null;
          const tailProgress = tailBall?.pathProgress ?? spacing;
          
          // Spawn at correct logical position (adjacent to tail) for chain cohesion
          const spawnPosition = Math.max(0, tailProgress - spacing);
          
          sendDebugLog(`[SPAWN] accum=${spawnAccumRef.current.toFixed(0)}ms, balls=${newBalls.length}, tailProg=${tailProgress.toFixed(4)}, spawnPos=${spawnPosition.toFixed(4)}`);
          
          spawnAccumRef.current = 0;
          
          // Create ball at correct position with spawn animation for visual portal emergence
          const rawBall = createRandomBall(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, spawnPosition, newBalls);
          const newBall = { ...rawBall, spawnAnimStart: Date.now() };
          
          sendDebugLog(`[SPAWN] Created ball at pos=${spawnPosition.toFixed(4)} with portal anim, id=${newBall.id.slice(0,10)}, color=${newBall.color}`);
          
          newBalls = [newBall, ...newBalls];
          totalSpawnedRef.current++;
          
          if (totalSpawnedRef.current >= maxTotalBalls) {
            spawnFinishedRef.current = true;
          }
        }
        
        newBalls = updateBallPositions(newBalls, currentPath);
        
        if (spawnFinishedRef.current && checkWin(newBalls)) {
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
        
        if (checkGameOver(newBalls)) {
          if (consumeShield()) {
            const spacing = GAME_CONFIG.balls.spacing;
            
            let respawnedBalls = [...newBalls];
            respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
            
            // Откат 50% = оставляем только половину шаров
            const keepCount = Math.ceil(respawnedBalls.length / 2);
            respawnedBalls = respawnedBalls.slice(0, keepCount);
            
            const n = respawnedBalls.length;
            if (n > 0) {
              const headPos = 0.5; // Голова на 50%
              
              for (let i = 0; i < n; i++) {
                const newProgress = Math.max(0, headPos - i * spacing);
                respawnedBalls[i] = { 
                  ...respawnedBalls[i], 
                  pathProgress: newProgress,
                  spawnAnimStart: undefined // Без анимации - сразу на позицию
                };
              }
            }
            
            respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
            respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
            
            gapContextRef.current = null;
            spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
            hapticFeedback('medium');
            return { ...updatedState, balls: respawnedBalls, combo: 0 };
          }
          
          const beforeLossCount = newBalls.length;
          const maxProgressBefore = newBalls.length > 0 ? Math.max(...newBalls.map(b => b.pathProgress)) : 0;
          const newLives = updatedState.lives - 1;
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount} шаров, голова на ${(maxProgressBefore * 100).toFixed(0)}%, осталось жизней: ${newLives}`);
          
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
              const beforeCount = newBalls.length;
              
              let respawnedBalls = [...newBalls];
              respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
              
              // Откат 50% = оставляем только половину шаров
              const keepCount = Math.ceil(respawnedBalls.length / 2);
              respawnedBalls = respawnedBalls.slice(0, keepCount);
              
              const n = respawnedBalls.length;
              if (n > 0) {
                const headPos = 0.5; // Голова на 50%
                
                for (let i = 0; i < n; i++) {
                  const newProgress = Math.max(0, headPos - i * spacing);
                  respawnedBalls[i] = { 
                    ...respawnedBalls[i], 
                    pathProgress: newProgress,
                    spawnAnimStart: undefined // Без анимации - сразу на позицию
                  };
                }
              }
              
              respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
              respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
              
              gapContextRef.current = null;
              spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
              
              sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeCount}, осталось ${respawnedBalls.length} шаров`);
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
          
          const spacing = GAME_CONFIG.balls.spacing;
          
          let respawnedBalls = [...newBalls];
          respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
          
          // Откат 50% = оставляем только половину шаров
          const keepCount = Math.ceil(respawnedBalls.length / 2);
          respawnedBalls = respawnedBalls.slice(0, keepCount);
          
          const n = respawnedBalls.length;
          if (n > 0) {
            const headPos = 0.5; // Голова на 50%
            
            for (let i = 0; i < n; i++) {
              const newProgress = Math.max(0, headPos - i * spacing);
              respawnedBalls[i] = { 
                ...respawnedBalls[i], 
                pathProgress: newProgress,
                spawnAnimStart: undefined // Без анимации - сразу на позицию
              };
            }
          }
          
          respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
          respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
          
          gapContextRef.current = null;
          spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
          
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount} шаров, осталось ${respawnedBalls.length}, ещё выедут ${maxTotalBallsRef.current - totalSpawnedRef.current + (beforeLossCount - keepCount)}`);
          hapticFeedback('warning');
          playLifeLostSound();
          return { ...updatedState, balls: respawnedBalls, lives: newLives, combo: 0 };
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
      if (!prev.isPlaying || gameEndedRef.current) return prev;
      
      const collision = checkPathCollision(
        projectile.x, projectile.y,
        projectile.prevX, projectile.prevY,
        prev.balls, pathRef.current
      );
      
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
            const { newBalls: laserBalls, removedBalls } = applyLaserEffect(prev.balls, hitIndices);
            const updatedBalls = updateBallPositions(laserBalls, pathRef.current);
            
            const { points, cryptoCollected, usdtFundCollected } = calculatePoints(removedBalls, 0);
            
            hapticFeedback('heavy');
            playComboSound(removedBalls.length);
            
            const hasCrypto = removedBalls.some(b => b.crypto || b.isUsdtFund);
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
              maxCombo: Math.max(prev.maxCombo, removedBalls.length),
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
              },
              usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
              shooterBall: prev.nextBall,
              nextBall: createRandomBall('next-' + Date.now(), 0, prev.balls, true),
            };
          }
        }
        
        let newBalls = insertBallInChain(prev.balls, projectile.ball, insertIndex);
        newBalls = updateBallPositions(newBalls, pathRef.current);
        
        // Check if magnet boost is active - attracts same color balls closer
        const magnetResult = consumeMagnet();
        if (magnetResult.active) {
          newBalls = applyMagnetEffect(newBalls, insertIndex, magnetResult.radius);
          newBalls = updateBallPositions(newBalls, pathRef.current);
          hapticFeedback('medium');
        }
        
        // Check if bomb boost is active
        if (consumeBomb()) {
          const { newBalls: bombedBalls, removedBalls } = applyBombEffect(newBalls, insertIndex, 5);
          newBalls = bombedBalls;
          
          if (removedBalls.length > 0) {
            const { points, cryptoCollected, usdtFundCollected } = calculatePoints(removedBalls, 0);
            
            hapticFeedback('heavy');
            playComboSound(2);
            
            const hasCrypto = removedBalls.some(b => b.crypto || b.isUsdtFund);
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
              maxCombo: Math.max(prev.maxCombo, 2),
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
              },
              usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
              shooterBall: prev.nextBall,
              nextBall: createRandomBall('next-' + Date.now(), 0, newBalls, true),
            };
          }
        }
        
        const matches = findMatchingBalls(newBalls, insertIndex, projectile.ball);
        
        if (matches.length >= 3) {
          const matchedBalls = matches.map(i => newBalls[i]);
          const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, 0);
          
          const minIdx = matches[0];
          const maxIdx = matches[matches.length - 1];
          const leftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
          const rightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
          
          newBalls = removeBalls(newBalls, matches);
          // Only arm portal retreat if very early in game (< 10 balls spawned)
          const isEarlyGame = totalSpawnedRef.current < 10;
          activateRollback(isEarlyGame);
          
          let totalPoints = points;
          let totalCryptoCollected = { ...cryptoCollected };
          let totalUsdtFundCollected = usdtFundCollected;
          let currentCombo = 1;
          let currentLeftBall = leftBall;
          let currentRightBall = rightBall;
          
          // Check for immediate chain reaction (balls are already adjacent after removal)
          while (currentLeftBall && currentRightBall && newBalls.length >= 3) {
            const leftIdx = newBalls.findIndex(b => b.id === currentLeftBall!.id);
            const rightIdx = newBalls.findIndex(b => b.id === currentRightBall!.id);
            
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
            const chainMatches = findMatchingBalls(newBalls, leftIdx, leftB);
            
            if (chainMatches.length < 3 || !chainMatches.includes(leftIdx) || !chainMatches.includes(rightIdx)) {
              sendDebugLog(`[CHAIN-SHORT] found:${chainMatches.length} hasLeft:${chainMatches.includes(leftIdx)} hasRight:${chainMatches.includes(rightIdx)}`);
              break;
            }
            
            // Chain reaction found!
            currentCombo++;
            sendDebugLog(`[CHAIN-REACT] combo:${currentCombo} removing:${chainMatches.length} balls`);
            
            const chainMatchedBalls = chainMatches.map(i => newBalls[i]);
            const chainResult = calculatePoints(chainMatchedBalls, currentCombo - 1);
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
            
            newBalls = removeBalls(newBalls, chainMatches);
            // Keep same early game state for chain reactions
            activateRollback(isEarlyGame);
            
            // Play combo sound
            const hasChainCrypto = chainMatchedBalls.some(b => b.crypto || b.isUsdtFund);
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
          
          const hasCrypto = matchedBalls.some(b => b.crypto || b.isUsdtFund);
          if (hasCrypto) {
            playCryptoMatchSound();
          } else {
            playMatchSound(currentCombo);
          }
          const newScore = prev.score + totalPoints;
          
          setProjectile(null);
          
          // Only win if ALL balls have spawned AND all are cleared
          if (spawnFinishedRef.current && checkWin(newBalls)) {
            gameEndedRef.current = true;
            stopAllTimers();
            const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
            const finalState = {
              ...prev,
              balls: newBalls,
              score: newScore,
              combo: currentCombo,
              maxCombo: Math.max(prev.maxCombo, currentCombo),
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
                eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt,
              },
              usdtFundCollected: prev.usdtFundCollected + totalUsdtFundCollected,
              shotsHit: prev.shotsHit + 1,
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
          
          return {
            ...prev,
            balls: newBalls,
            score: newScore,
            combo: currentCombo,
            maxCombo: Math.max(prev.maxCombo, currentCombo),
            cryptoCollected: {
              btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
              eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
              usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt,
            },
            usdtFundCollected: prev.usdtFundCollected + totalUsdtFundCollected,
            shotsHit: prev.shotsHit + 1,
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
            shotsHit: prev.shotsHit + 1,
          };
        }
      }
      
      return prev;
    });
  }, [projectile, stopAllTimers]);

  const shoot = useCallback((targetX: number, targetY: number) => {
    // Use ref to get current shooterBall to avoid stale closure issues
    const currentShooterBall = shooterBallRef.current;
    if (!gameState.isPlaying || projectile || !currentShooterBall) return;
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const vx = (dx / distance) * SHOOTER_BALL_SPEED;
    const vy = (dy / distance) * SHOOTER_BALL_SPEED;
    
    // Apply rainbow boost to the shooting ball if active
    let ballToShoot = currentShooterBall;
    if (consumeRainbow()) {
      ballToShoot = { ...ballToShoot, isRainbow: true };
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
      shooterBall: prev.nextBall,
      nextBall: createRandomBall('next-' + Date.now(), 0, prev.balls, true),
      shotsTotal: prev.shotsTotal + 1,
    }));
    
    hapticFeedback('light');
    playShootSound();
  }, [gameState.isPlaying, projectile, shooterPosition]);

  const updateAim = useCallback((targetX: number, targetY: number) => {
    if (!gameState.isPlaying) return;
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const angle = Math.atan2(dy, dx);
    
    setShooterAngle(angle);
  }, [gameState.isPlaying, shooterPosition]);

  const addExtraLife = useCallback((extraSeconds: number) => {
    setGameState(prev => {
      const beforeCount = prev.balls.length;
      
      if (prev.balls.length === 0) {
        sendDebugLog(`[ПОКУПКА ЖИЗНИ] Цепочка: 0 → 0 шаров`);
        return {
          ...prev,
          lives: prev.lives + 1,
          extraLivesBought: prev.extraLivesBought + 1,
        };
      }
      
      // Find the minimum pathProgress (tail of the chain)
      const minProgress = Math.min(...prev.balls.map(b => b.pathProgress));
      // Find the maximum pathProgress (leading ball position)
      const maxProgress = Math.max(...prev.balls.map(b => b.pathProgress));
      
      // Target: move the leading ball to 50% of its current position
      // But keep the chain intact by shifting all balls by the same amount
      const targetMaxProgress = maxProgress * 0.5;
      const shiftAmount = maxProgress - targetMaxProgress;
      
      // Ensure minimum progress doesn't go below starting position (with some buffer)
      const minStartPosition = GAME_CONFIG.balls.spacing;
      const newMinProgress = minProgress - shiftAmount;
      
      // If shift would put tail below minimum, adjust
      const actualShift = newMinProgress < minStartPosition 
        ? minProgress - minStartPosition 
        : shiftAmount;
      
      // Move all balls back by the same shift amount, preserving their spacing
      let rewindedBalls = prev.balls.map(ball => ({
        ...ball,
        pathProgress: Math.max(0, ball.pathProgress - actualShift),
      }));
      rewindedBalls = updateBallPositions(rewindedBalls, pathRef.current);
      
      const afterCount = rewindedBalls.length;
      sendDebugLog(`[ПОКУПКА ЖИЗНИ] Цепочка: ${beforeCount} → ${afterCount} шаров`);
      
      return {
        ...prev,
        balls: rewindedBalls,
        lives: prev.lives + 1,
        extraLivesBought: prev.extraLivesBought + 1,
      };
    });
    hapticFeedback('success');
  }, []);

  const resumeGame = useCallback(() => {
    stopAllTimers();
    gameEndedRef.current = false;
    lastTimeRef.current = 0;
    spawnAccumRef.current = 0;
    
    setGameState(prev => {
      if (prev.balls.length === 0) {
        return {
          ...prev,
          lives: 1,
          isPlaying: true,
          isGameOver: false,
          won: false,
          extraLivesBought: prev.extraLivesBought + 1,
        };
      }
      
      // Find the minimum pathProgress (tail of the chain)
      const minProgress = Math.min(...prev.balls.map(b => b.pathProgress));
      // Find the maximum pathProgress (leading ball position)
      const maxProgress = Math.max(...prev.balls.map(b => b.pathProgress));
      
      // Target: move the leading ball to 50% of its current position
      // But keep the chain intact by shifting all balls by the same amount
      const targetMaxProgress = maxProgress * 0.5;
      const shiftAmount = maxProgress - targetMaxProgress;
      
      // Ensure minimum progress doesn't go below starting position (with some buffer)
      const minStartPosition = GAME_CONFIG.balls.spacing;
      const newMinProgress = minProgress - shiftAmount;
      
      // If shift would put tail below minimum, adjust
      const actualShift = newMinProgress < minStartPosition 
        ? minProgress - minStartPosition 
        : shiftAmount;
      
      // Move all balls back by the same shift amount, preserving their spacing
      let rewindedBalls = prev.balls.map(ball => ({
        ...ball,
        pathProgress: Math.max(0, ball.pathProgress - actualShift),
      }));
      rewindedBalls = updateBallPositions(rewindedBalls, pathRef.current);
      
      return {
        ...prev,
        balls: rewindedBalls,
        lives: 1,
        isPlaying: true,
        isGameOver: false,
        won: false,
        extraLivesBought: prev.extraLivesBought + 1,
      };
    });
    
    const currentPath = pathRef.current;
    
    const runLoop = (timestamp: number) => {
      if (gameEndedRef.current) return;
      
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      
      updateBoostTimers();
      
      setGameState(prev => {
        if (!prev.isPlaying || gameEndedRef.current) return prev;
        
        // During rollback, pause forward movement to let chain close gaps properly
        let newBalls = isRollbackActive() 
          ? prev.balls 
          : moveBallsForward(prev.balls, deltaTime);
        newBalls = processRollback(newBalls, deltaTime, spawnFinishedRef.current);
        newBalls = updateBallPositions(newBalls, currentPath);
        
        if (spawnFinishedRef.current && checkWin(newBalls)) {
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
        
        if (checkGameOver(newBalls)) {
          if (consumeShield()) {
            const spacing = GAME_CONFIG.balls.spacing;
            
            let respawnedBalls = [...newBalls];
            respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
            
            // Откат 50% = оставляем только половину шаров
            const keepCount = Math.ceil(respawnedBalls.length / 2);
            respawnedBalls = respawnedBalls.slice(0, keepCount);
            
            const n = respawnedBalls.length;
            if (n > 0) {
              const headPos = 0.5; // Голова на 50%
              
              for (let i = 0; i < n; i++) {
                const newProgress = Math.max(0, headPos - i * spacing);
                respawnedBalls[i] = { 
                  ...respawnedBalls[i], 
                  pathProgress: newProgress,
                  spawnAnimStart: undefined // Без анимации - сразу на позицию
                };
              }
            }
            
            respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
            respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
            
            gapContextRef.current = null;
            spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
            hapticFeedback('medium');
            return { ...prev, balls: respawnedBalls, combo: 0 };
          }
          
          const beforeLossCount2 = newBalls.length;
          const maxProgressBefore2 = newBalls.length > 0 ? Math.max(...newBalls.map(b => b.pathProgress)) : 0;
          const newLives = prev.lives - 1;
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount2} шаров, голова на ${(maxProgressBefore2 * 100).toFixed(0)}%, осталось жизней: ${newLives}`);
          
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
              
              // Сбрасываем шарики в начало
              const spacing = GAME_CONFIG.balls.spacing;
              const beforeCount = newBalls.length;
              
              let respawnedBalls = [...newBalls];
              respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
              
              // Откат 50% = оставляем только половину шаров
              const keepCount = Math.ceil(respawnedBalls.length / 2);
              respawnedBalls = respawnedBalls.slice(0, keepCount);
              
              const n = respawnedBalls.length;
              if (n > 0) {
                const headPos = 0.5; // Голова на 50%
                
                for (let i = 0; i < n; i++) {
                  const newProgress = Math.max(0, headPos - i * spacing);
                  respawnedBalls[i] = { 
                    ...respawnedBalls[i], 
                    pathProgress: newProgress,
                    spawnAnimStart: undefined // Без анимации - сразу на позицию
                  };
                }
              }
              
              respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
              respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
              
              gapContextRef.current = null;
              spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
              
              sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeCount}, осталось ${respawnedBalls.length} шаров`);
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
          
          const spacing = GAME_CONFIG.balls.spacing;
          
          let respawnedBalls = [...newBalls];
          respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
          
          // Откат 50% = оставляем только половину шаров
          const keepCount = Math.ceil(respawnedBalls.length / 2);
          respawnedBalls = respawnedBalls.slice(0, keepCount);
          
          const n = respawnedBalls.length;
          if (n > 0) {
            const headPos = 0.5; // Голова на 50%
            
            for (let i = 0; i < n; i++) {
              const newProgress = Math.max(0, headPos - i * spacing);
              respawnedBalls[i] = { 
                ...respawnedBalls[i], 
                pathProgress: newProgress,
                spawnAnimStart: undefined // Без анимации - сразу на позицию
              };
            }
          }
          
          respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
          respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
          
          gapContextRef.current = null;
          spawnFinishedRef.current = false; // Разрешаем спавн после потери жизни
          
          sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount2} шаров, осталось ${respawnedBalls.length}, ещё выедут новые`);
          hapticFeedback('warning');
          playLifeLostSound();
          return { ...prev, balls: respawnedBalls, lives: newLives, combo: 0 };
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
  }, [stopAllTimers]);

  const ballsOnScreen = gameState.balls.length;
  const totalBalls = maxTotalBallsRef.current;
  const totalSpawned = totalSpawnedRef.current;
  const ballsRemaining = totalBalls - totalSpawned + ballsOnScreen;

  const applyRewind = useCallback(() => {
    setGameState(prev => {
      const rewindedBalls = applyRewindEffect(prev.balls, 0.2);
      const updatedBalls = updateBallPositions(rewindedBalls, pathRef.current);
      return { ...prev, balls: updatedBalls };
    });
    hapticFeedback('medium');
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
    startGame,
    shoot,
    updateAim,
    addExtraLife,
    resumeGame,
    applyRewind,
  };
}
