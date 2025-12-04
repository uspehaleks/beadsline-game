import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Ball } from '@shared/schema';
import {
  createInitialGameState,
  createRandomBall,
  generatePath,
  getShooterPosition,
  updateBallPositions,
  moveBallsForward,
  processRollback,
  findMatchingBalls,
  calculatePoints,
  insertBallInChain,
  removeBalls,
  checkCollision,
  checkPathCollision,
  checkGameOver,
  checkWin,
  SHOOTER_BALL_SPEED,
  type PathPoint,
} from '@/lib/gameEngine';
import { GAME_CONFIG } from '@/lib/gameConfig';
import { hapticFeedback } from '@/lib/telegram';

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

  const startGame = useCallback(() => {
    if (timeTrackerRef.current !== null) {
      console.warn('Game already running, ignoring startGame call');
      return;
    }
    
    stopAllTimers();
    gameEndedRef.current = false;
    gameStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
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
    
    const runLoop = (timestamp: number) => {
      if (gameEndedRef.current) return;
      
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      const currentPath = pathRef.current;
      
      setGameState(prev => {
        if (!prev.isPlaying || gameEndedRef.current) return prev;
        
        let newBalls = moveBallsForward(prev.balls, deltaTime);
        
        newBalls = processRollback(newBalls, deltaTime);
        
        const { period, buffer } = GAME_CONFIG.spawn;
        const { targetCount } = GAME_CONFIG.balls;
        
        spawnAccumRef.current += deltaTime;
        
        if (spawnAccumRef.current >= period && newBalls.length < targetCount) {
          spawnAccumRef.current = 0;
          const newBall = createRandomBall(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, -buffer);
          newBalls = [newBall, ...newBalls];
        }
        
        newBalls = updateBallPositions(newBalls, currentPath);
        
        if (checkGameOver(newBalls)) {
          gameEndedRef.current = true;
          stopAllTimers();
          const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          const won = prev.score >= GAME_CONFIG.gameplay.winCondition;
          const finalState = { ...prev, balls: newBalls, isPlaying: false, isGameOver: true, won, timeLeft: duration };
          setTimeout(() => {
            onGameEndRef.current?.(finalState);
            hapticFeedback(won ? 'success' : 'error');
          }, 0);
          return finalState;
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
        
        const matches = findMatchingBalls(newBalls, insertIndex, projectile.ball.color);
        
        if (matches.length >= 3) {
          const matchedBalls = matches.map(i => newBalls[i]);
          const { points, cryptoCollected } = calculatePoints(matchedBalls, prev.combo + 1);
          
          newBalls = removeBalls(newBalls, matches);
          
          hapticFeedback('medium');
          
          const newCombo = prev.combo + 1;
          const newScore = prev.score + points;
          
          if (checkWin(newScore)) {
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
          
          setProjectile(null);
          
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
            shotsHit: prev.shotsHit + 1,
          };
        } else {
          setProjectile(null);
          
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
      nextBall: createRandomBall('next-' + Date.now()),
      shotsTotal: prev.shotsTotal + 1,
    }));
    
    hapticFeedback('light');
  }, [gameState.isPlaying, gameState.shooterBall, projectile, shooterPosition]);

  const updateAim = useCallback((targetX: number, targetY: number) => {
    if (!gameState.isPlaying) return;
    
    const dx = targetX - shooterPosition.x;
    const dy = targetY - shooterPosition.y;
    const angle = Math.atan2(dy, dx);
    
    setShooterAngle(angle);
  }, [gameState.isPlaying, shooterPosition]);

  return {
    gameState,
    path,
    projectile,
    shooterAngle,
    shooterPosition,
    elapsedTime,
    startGame,
    shoot,
    updateAim,
  };
}
