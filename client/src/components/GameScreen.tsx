import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState } from '@shared/schema';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { NextBallPreview } from './NextBallPreview';
import { GameOverScreen } from './GameOverScreen';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface GameScreenProps {
  onGameEnd: (state: GameState) => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
}

export function GameScreen({ onGameEnd, onViewLeaderboard, onMainMenu }: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height - 160,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const {
    gameState,
    path,
    projectile,
    shooterAngle,
    shooterPosition,
    elapsedTime,
    startGame,
    shoot,
    updateAim,
  } = useGameState({
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
    onGameEnd,
  });

  const hasStartedRef = useRef(false);
  const startGameRef = useRef(startGame);
  startGameRef.current = startGame;
  
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startGameRef.current();
    }
  }, [dimensions.width, dimensions.height]);

  const handlePlayAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background overflow-hidden flex flex-col"
      data-testid="game-screen"
    >
      {gameState.isPlaying && <GameHUD gameState={gameState} elapsedTime={elapsedTime} />}

      <div className="flex-1 relative mt-24">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <GameCanvas
            gameState={gameState}
            path={path}
            projectile={projectile}
            shooterAngle={shooterAngle}
            shooterPosition={shooterPosition}
            onShoot={shoot}
            onAim={updateAim}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>

      <div className="h-24 bg-gradient-to-t from-background to-transparent px-4 py-3 flex items-center justify-between">
        <div className="w-16" />
        
        <NextBallPreview ball={gameState.nextBall} />
        
        <div className="w-16 flex justify-end">
          {!gameState.isPlaying && !gameState.isGameOver && (
            <Button
              variant="ghost"
              size="icon"
              onClick={startGame}
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {gameState.isGameOver && (
        <GameOverScreen
          gameState={gameState}
          onPlayAgain={handlePlayAgain}
          onViewLeaderboard={onViewLeaderboard}
          onMainMenu={onMainMenu}
        />
      )}
    </div>
  );
}
