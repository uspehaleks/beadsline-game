import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Ball } from '@shared/schema';
import {
  createInitialGameState,
  createRandomBall,
  generatePath,
  updateBallPositions,
  moveBallsForward,
  findMatchingBalls,
  calculatePoints,
  insertBallInChain,
  removeBalls,
  checkCollision,
  checkGameOver,
  checkWin,
  addNewBallsToChain,
  SHOOTER_BALL_SPEED,
  GAME_DURATION,
  type PathPoint,
} from '@/lib/gameEngine';
import { hapticFeedback } from '@/lib/telegram';

interface UseGameStateProps {
  canvasWidth: number;
  canvasHeight: number;
  onGameEnd?: (state: GameState) => void;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ball: Ball;
}

export function useGameState({ canvasWidth, canvasHeight, onGameEnd }: UseGameStateProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [path, setPath] = useState<PathPoint[]>([]);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [shooterAngle, setShooterAngle] = useState(-Math.PI / 2);
  
  const gameLoopRef = useRef<number>();
  const timerRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const addBallsTimerRef = useRef<number>();
  
  const shooterPosition = {
    x: canvasWidth / 2,
    y: canvasHeight - 80,
  };

  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0) {
      const newPath = generatePath(canvasWidth, canvasHeight);
      setPath(newPath);
    }
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (path.length > 0 && gameState.balls.length > 0) {
      setGameState(prev => ({
        ...prev,
        balls: updateBallPositions(prev.balls, path),
      }));
    }
  }, [path]);

  const startGame = useCallback(() => {
    const initialState = createInitialGameState();
    const newPath = generatePath(canvasWidth, canvasHeight);
    setPath(newPath);
    
    const ballsWithPositions = updateBallPositions(initialState.balls, newPath);
    
    setGameState({
      ...initialState,
      balls: ballsWithPositions,
      isPlaying: true,
      timeLeft: GAME_DURATION,
    });
    setProjectile(null);
    setShooterAngle(-Math.PI / 2);
    
    hapticFeedback('medium');
  }, [canvasWidth, canvasHeight]);

  const endGame = useCallback((won: boolean) => {
    setGameState(prev => {
      const finalState = {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        won,
      };
      onGameEnd?.(finalState);
      return finalState;
    });
    
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (addBallsTimerRef.current) clearInterval(addBallsTimerRef.current);
    
    hapticFeedback(won ? 'success' : 'error');
  }, [onGameEnd]);

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
    
    const clampedAngle = Math.max(-Math.PI, Math.min(0, angle));
    setShooterAngle(clampedAngle);
  }, [gameState.isPlaying, shooterPosition]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameState.isPlaying) return;
    
    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
    lastTimeRef.current = timestamp;
    
    setGameState(prev => {
      if (!prev.isPlaying) return prev;
      
      let newBalls = moveBallsForward(prev.balls, deltaTime);
      newBalls = updateBallPositions(newBalls, path);
      
      if (checkGameOver(newBalls)) {
        setTimeout(() => endGame(false), 0);
        return { ...prev, balls: newBalls };
      }
      
      return { ...prev, balls: newBalls };
    });
    
    if (projectile) {
      setProjectile(prev => {
        if (!prev) return null;
        
        const newX = prev.x + prev.vx;
        const newY = prev.y + prev.vy;
        
        if (newX < 0 || newX > canvasWidth || newY < 0 || newY > canvasHeight) {
          return null;
        }
        
        const collision = checkCollision(newX, newY, gameState.balls);
        
        if (collision) {
          const insertIndex = collision.insertBefore ? collision.index : collision.index + 1;
          
          setGameState(prevState => {
            let newBalls = insertBallInChain(prevState.balls, prev.ball, insertIndex);
            newBalls = updateBallPositions(newBalls, path);
            
            const matches = findMatchingBalls(newBalls, insertIndex, prev.ball.color);
            
            if (matches.length >= 3) {
              const matchedBalls = matches.map(i => newBalls[i]);
              const { points, cryptoCollected } = calculatePoints(matchedBalls, prevState.combo + 1);
              
              newBalls = removeBalls(newBalls, matches);
              
              hapticFeedback('medium');
              
              const newCombo = prevState.combo + 1;
              const newScore = prevState.score + points;
              
              if (checkWin(newScore)) {
                setTimeout(() => endGame(true), 100);
              }
              
              return {
                ...prevState,
                balls: newBalls,
                score: newScore,
                combo: newCombo,
                maxCombo: Math.max(prevState.maxCombo, newCombo),
                cryptoCollected: {
                  btc: prevState.cryptoCollected.btc + cryptoCollected.btc,
                  eth: prevState.cryptoCollected.eth + cryptoCollected.eth,
                  usdt: prevState.cryptoCollected.usdt + cryptoCollected.usdt,
                },
                shotsHit: prevState.shotsHit + 1,
              };
            } else {
              return {
                ...prevState,
                balls: newBalls,
                combo: 0,
                shotsHit: prevState.shotsHit + 1,
              };
            }
          });
          
          return null;
        }
        
        return { ...prev, x: newX, y: newY };
      });
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.balls, projectile, path, canvasWidth, canvasHeight, endGame]);

  useEffect(() => {
    if (gameState.isPlaying) {
      lastTimeRef.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            setTimeout(() => endGame(prev.score >= 5000), 0);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
      
      addBallsTimerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (!prev.isPlaying) return prev;
          const newBalls = addNewBallsToChain(prev.balls, 2);
          return { ...prev, balls: updateBallPositions(newBalls, path) };
        });
      }, 5000);
      
      return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        if (addBallsTimerRef.current) clearInterval(addBallsTimerRef.current);
      };
    }
  }, [gameState.isPlaying, gameLoop, endGame, path]);

  return {
    gameState,
    path,
    projectile,
    shooterAngle,
    shooterPosition,
    startGame,
    shoot,
    updateAim,
  };
}
