import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Ball } from '@shared/schema';
import {
  createInitialGameState,
  createRandomBall,
  createBallFromChain,
  generatePath,
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
  resetCryptoSpawnedCount,
  SHOOTER_BALL_SPEED,
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

interface UseGameStateProps {
  canvasWidth: number;
  canvasHeight: number;
  onGameEnd?: (state: GameState) => void;
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

export function useGameState({ canvasWidth, canvasHeight, onGameEnd }: UseGameStateProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [path, setPath] = useState<PathPoint[]>([]);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [shooterAngle, setShooterAngle] = useState(-Math.PI / 2);
  const [elapsedTime, setElapsedTime] = useState(0);
  
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
  
  onGameEndRef.current = onGameEnd;
  pathRef.current = path;
  dimensionsRef.current = { width: canvasWidth, height: canvasHeight };
  
  const shooterPosition = getShooterPosition(canvasWidth, canvasHeight);

  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0) {
      const newPath = generatePath(canvasWidth, canvasHeight);
      setPath(newPath);
      pathRef.current = newPath;
    }
  }, [canvasWidth, canvasHeight]);

  const stopAllTimers = useCallback(() => {
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (timeTrackerRef.current !== null) {
      clearInterval(timeTrackerRef.current);
      timeTrackerRef.current = null;
    }
  }, []);

  const startGame = useCallback(async () => {
    if (timeTrackerRef.current !== null) {
      console.warn('Game already running, ignoring startGame call');
      return;
    }
    
    try {
      const response = await fetch('/api/game-economy');
      if (response.ok) {
        const economyData = await response.json();
        setEconomyConfig(economyData);
        setAvailableCrypto(economyData.cryptoAvailable || { btc: true, eth: true, usdt: true });
        setUsdtFundEnabled(economyData.usdtFundEnabled === true);
      }
    } catch (error) {
      console.error('Failed to fetch game economy:', error);
      setAvailableCrypto({ btc: true, eth: true, usdt: true });
      setUsdtFundEnabled(false);
    }
    
    stopAllTimers();
    gameEndedRef.current = false;
    gameStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
    resetCryptoSpawnedCount();
    
    const dims = dimensionsRef.current;
    const newPath = generatePath(dims.width, dims.height);
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
    totalSpawnedRef.current = GAME_CONFIG.balls.initialCount;
    spawnFinishedRef.current = false;
    gapContextRef.current = null;
    
    const runLoop = (timestamp: number) => {
      if (gameEndedRef.current) return;
      
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      const currentPath = pathRef.current;
      
      setGameState(prev => {
        if (!prev.isPlaying || gameEndedRef.current) return prev;
        
        let newBalls = moveBallsForward(prev.balls, deltaTime);
        
        newBalls = processRollback(newBalls, deltaTime);
        
        let updatedState = prev;
        
        const gap = gapContextRef.current;
        if (gap && newBalls.length >= 3) {
          const leftIdx = gap.leftBallId ? newBalls.findIndex(b => b.id === gap.leftBallId) : -1;
          const rightIdx = gap.rightBallId ? newBalls.findIndex(b => b.id === gap.rightBallId) : -1;
          
          let foundMatch = false;
          
          if (leftIdx >= 0 && rightIdx >= 0 && rightIdx === leftIdx + 1) {
            const leftBall = newBalls[leftIdx];
            const rightBall = newBalls[rightIdx];
            
            if (leftBall.color === rightBall.color) {
              const matches = findMatchingBalls(newBalls, leftIdx, leftBall);
              
              if (matches.length >= 3 && matches.includes(leftIdx) && matches.includes(rightIdx)) {
                foundMatch = true;
                const matchedBalls = matches.map(i => newBalls[i]);
                const newCombo = prev.combo + 1;
                const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, newCombo);
                
                const minIdx = matches[0];
                const maxIdx = matches[matches.length - 1];
                const newLeftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
                const newRightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
                
                newBalls = removeBalls(newBalls, matches);
                
                if (newLeftBall || newRightBall) {
                  gapContextRef.current = { 
                    leftBallId: newLeftBall?.id || null, 
                    rightBallId: newRightBall?.id || null 
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
                
                updatedState = {
                  ...prev,
                  score: prev.score + points,
                  combo: newCombo,
                  maxCombo: Math.max(prev.maxCombo, newCombo),
                  cryptoCollected: {
                    btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                    eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                    usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
                  },
                  usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
                };
              }
            }
          } else if (leftIdx >= 0 && rightIdx < 0) {
            const matches = findMatchingBalls(newBalls, leftIdx, newBalls[leftIdx]);
            if (matches.length >= 3 && matches.includes(leftIdx)) {
              foundMatch = true;
              const matchedBalls = matches.map(i => newBalls[i]);
              const newCombo = prev.combo + 1;
              const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, newCombo);
              
              const minIdx = matches[0];
              const maxIdx = matches[matches.length - 1];
              const newLeftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
              const newRightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
              
              newBalls = removeBalls(newBalls, matches);
              
              if (newLeftBall || newRightBall) {
                gapContextRef.current = { leftBallId: newLeftBall?.id || null, rightBallId: newRightBall?.id || null };
              } else {
                gapContextRef.current = null;
              }
              
              hapticFeedback('medium');
              const hasCrypto = matchedBalls.some(b => b.crypto || b.isUsdtFund);
              if (hasCrypto) playCryptoMatchSound(); else playMatchSound(newCombo);
              if (newCombo > 1) playComboSound(newCombo);
              
              updatedState = {
                ...prev,
                score: prev.score + points,
                combo: newCombo,
                maxCombo: Math.max(prev.maxCombo, newCombo),
                cryptoCollected: {
                  btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                  eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                  usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
                },
                usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
              };
            }
          } else if (rightIdx >= 0 && leftIdx < 0) {
            const matches = findMatchingBalls(newBalls, rightIdx, newBalls[rightIdx]);
            if (matches.length >= 3 && matches.includes(rightIdx)) {
              foundMatch = true;
              const matchedBalls = matches.map(i => newBalls[i]);
              const newCombo = prev.combo + 1;
              const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, newCombo);
              
              const minIdx = matches[0];
              const maxIdx = matches[matches.length - 1];
              const newLeftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
              const newRightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
              
              newBalls = removeBalls(newBalls, matches);
              
              if (newLeftBall || newRightBall) {
                gapContextRef.current = { leftBallId: newLeftBall?.id || null, rightBallId: newRightBall?.id || null };
              } else {
                gapContextRef.current = null;
              }
              
              hapticFeedback('medium');
              const hasCrypto = matchedBalls.some(b => b.crypto || b.isUsdtFund);
              if (hasCrypto) playCryptoMatchSound(); else playMatchSound(newCombo);
              if (newCombo > 1) playComboSound(newCombo);
              
              updatedState = {
                ...prev,
                score: prev.score + points,
                combo: newCombo,
                maxCombo: Math.max(prev.maxCombo, newCombo),
                cryptoCollected: {
                  btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                  eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                  usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
                },
                usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
              };
            }
          }
          
          if (!foundMatch) {
            gapContextRef.current = null;
          }
        }
        
        const { period, buffer } = GAME_CONFIG.spawn;
        const { targetCount } = GAME_CONFIG.balls;
        const { maxTotalBalls } = GAME_CONFIG.gameplay;
        
        spawnAccumRef.current += deltaTime;
        
        const canSpawn = !spawnFinishedRef.current && 
                         newBalls.length < targetCount && 
                         totalSpawnedRef.current < maxTotalBalls;
        
        if (spawnAccumRef.current >= period && canSpawn) {
          spawnAccumRef.current = 0;
          const newBall = createBallFromChain(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, newBalls, -buffer);
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
          const newLives = updatedState.lives - 1;
          
          if (newLives <= 0) {
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
          const targetHeadPosition = 0.5;
          
          let respawnedBalls = [...newBalls];
          respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
          
          const n = respawnedBalls.length;
          if (n > 0) {
            const chainLength = (n - 1) * spacing;
            let headPos = targetHeadPosition;
            
            if (headPos - chainLength < 0) {
              headPos = chainLength;
            }
            if (headPos > 0.85) {
              headPos = 0.85;
            }
            
            for (let i = 0; i < n; i++) {
              respawnedBalls[i] = { ...respawnedBalls[i], pathProgress: Math.max(0, headPos - i * spacing) };
            }
          }
          
          respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
          respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
          
          gapContextRef.current = null;
          
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
        
        let newBalls = insertBallInChain(prev.balls, projectile.ball, insertIndex);
        newBalls = updateBallPositions(newBalls, pathRef.current);
        
        const matches = findMatchingBalls(newBalls, insertIndex, projectile.ball);
        
        if (matches.length >= 3) {
          const matchedBalls = matches.map(i => newBalls[i]);
          const { points, cryptoCollected, usdtFundCollected } = calculatePoints(matchedBalls, prev.combo + 1);
          
          const minIdx = matches[0];
          const maxIdx = matches[matches.length - 1];
          const leftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
          const rightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
          
          newBalls = removeBalls(newBalls, matches);
          
          if (leftBall || rightBall) {
            gapContextRef.current = { leftBallId: leftBall?.id || null, rightBallId: rightBall?.id || null };
          } else {
            gapContextRef.current = null;
          }
          
          hapticFeedback('medium');
          
          const newCombo = prev.combo + 1;
          
          const hasCrypto = matchedBalls.some(b => b.crypto || b.isUsdtFund);
          if (hasCrypto) {
            playCryptoMatchSound();
          } else {
            playMatchSound(newCombo);
          }
          if (newCombo > 1) {
            playComboSound(newCombo);
          }
          const newScore = prev.score + points;
          
          setProjectile(null);
          
          if (checkWin(newBalls)) {
            gameEndedRef.current = true;
            stopAllTimers();
            const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
            const finalState = {
              ...prev,
              balls: newBalls,
              score: newScore,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              cryptoCollected: {
                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
              },
              usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
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
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            cryptoCollected: {
              btc: prev.cryptoCollected.btc + cryptoCollected.btc,
              eth: prev.cryptoCollected.eth + cryptoCollected.eth,
              usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt,
            },
            usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
            shotsHit: prev.shotsHit + 1,
          };
        } else {
          setProjectile(null);
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
    if (!gameState.isPlaying || projectile || !gameState.shooterBall) return;
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const vx = (dx / distance) * SHOOTER_BALL_SPEED;
    const vy = (dy / distance) * SHOOTER_BALL_SPEED;
    
    setProjectile({
      x: shooterPosition.x,
      y: shooterPosition.y,
      prevX: shooterPosition.x,
      prevY: shooterPosition.y,
      vx,
      vy,
      ball: gameState.shooterBall,
    });
    
    setGameState(prev => ({
      ...prev,
      shooterBall: prev.nextBall,
      nextBall: createBallFromChain('next-' + Date.now(), prev.balls),
      shotsTotal: prev.shotsTotal + 1,
    }));
    
    hapticFeedback('light');
    playShootSound();
  }, [gameState.isPlaying, gameState.shooterBall, projectile, shooterPosition]);

  const updateAim = useCallback((targetX: number, targetY: number) => {
    if (!gameState.isPlaying) return;
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const angle = Math.atan2(dy, dx);
    
    setShooterAngle(angle);
  }, [gameState.isPlaying, shooterPosition]);

  const addExtraLife = useCallback((extraSeconds: number) => {
    setGameState(prev => {
      const spacing = GAME_CONFIG.balls.spacing;
      const sortedBalls = [...prev.balls].sort((a, b) => a.pathProgress - b.pathProgress);
      let resetBalls = sortedBalls.map((ball, index) => ({
        ...ball,
        pathProgress: index * spacing,
      }));
      resetBalls = updateBallPositions(resetBalls, pathRef.current);
      return {
        ...prev,
        balls: resetBalls,
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
      const spacing = GAME_CONFIG.balls.spacing;
      const sortedBalls = [...prev.balls].sort((a, b) => a.pathProgress - b.pathProgress);
      let resetBalls = sortedBalls.map((ball, index) => ({
        ...ball,
        pathProgress: index * spacing,
      }));
      resetBalls = updateBallPositions(resetBalls, pathRef.current);
      
      return {
        ...prev,
        balls: resetBalls,
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
      
      setGameState(prev => {
        if (!prev.isPlaying || gameEndedRef.current) return prev;
        
        let newBalls = moveBallsForward(prev.balls, deltaTime);
        newBalls = processRollback(newBalls, deltaTime);
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
          const newLives = prev.lives - 1;
          
          if (newLives <= 0) {
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
          const targetHeadPosition = 0.5;
          
          let respawnedBalls = [...newBalls];
          respawnedBalls.sort((a, b) => b.pathProgress - a.pathProgress);
          
          const n = respawnedBalls.length;
          if (n > 0) {
            const chainLength = (n - 1) * spacing;
            let headPos = targetHeadPosition;
            
            if (headPos - chainLength < 0) {
              headPos = chainLength;
            }
            if (headPos > 0.85) {
              headPos = 0.85;
            }
            
            for (let i = 0; i < n; i++) {
              respawnedBalls[i] = { ...respawnedBalls[i], pathProgress: Math.max(0, headPos - i * spacing) };
            }
          }
          
          respawnedBalls.sort((a, b) => a.pathProgress - b.pathProgress);
          respawnedBalls = updateBallPositions(respawnedBalls, currentPath);
          
          hapticFeedback('warning');
          playLifeLostSound();
          return { ...prev, balls: respawnedBalls, lives: newLives };
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
  const totalBalls = GAME_CONFIG.gameplay.maxTotalBalls;
  const ballsRemaining = totalBalls - totalSpawnedRef.current + ballsOnScreen;

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
    startGame,
    shoot,
    updateAim,
    addExtraLife,
    resumeGame,
  };
}
