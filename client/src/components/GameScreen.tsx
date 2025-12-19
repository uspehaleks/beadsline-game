import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState, LivesConfig } from '@shared/schema';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { NextBallPreview } from './NextBallPreview';
import { GameOverScreen } from './GameOverScreen';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { LevelConfig } from '@/lib/levelConfig';

interface GameScreenProps {
  level: LevelConfig;
  onGameEnd: (state: GameState) => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
}

export function GameScreen({ level, onGameEnd, onViewLeaderboard, onMainMenu }: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const sessionIdRef = useRef<string | null>(null);
  const [isBuyingLife, setIsBuyingLife] = useState(false);
  const { user, refreshUser } = useUser();
  const { toast } = useToast();

  const { data: livesConfig } = useQuery<LivesConfig>({
    queryKey: ["/api/lives-config"],
  });

  const startSession = useCallback(async () => {
    try {
      const res = await apiRequest('POST', '/api/game/start', {});
      const data = await res.json();
      sessionIdRef.current = data.sessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        await apiRequest('POST', '/api/game/end', { sessionId: sessionIdRef.current });
        sessionIdRef.current = null;
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  }, []);

  const handleGameEnd = useCallback((state: GameState) => {
    endSession();
    onGameEnd(state);
  }, [endSession, onGameEnd]);

  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon('/api/game/end', JSON.stringify({ sessionId: sessionIdRef.current }));
      }
    };
  }, []);

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
    ballsOnScreen,
    ballsRemaining,
    totalBalls,
    startGame: originalStartGame,
    shoot,
    updateAim,
    addExtraLife,
    resumeGame,
  } = useGameState({
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
    onGameEnd: handleGameEnd,
    level,
  });

  const startGame = useCallback(() => {
    startSession();
    originalStartGame();
  }, [startSession, originalStartGame]);

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

  const handleBuyLife = useCallback(async () => {
    if (!livesConfig || isBuyingLife) return;
    if (!user || user.totalPoints < livesConfig.extraLifeCost) {
      toast({
        title: "Недостаточно Beads",
        description: `Нужно ${livesConfig.extraLifeCost} Beads для покупки жизни`,
        variant: "destructive",
      });
      return;
    }
    if (gameState.extraLivesBought >= livesConfig.maxExtraLives) {
      toast({
        title: "Лимит достигнут",
        description: `Максимум ${livesConfig.maxExtraLives} дополнительных жизней за игру`,
        variant: "destructive",
      });
      return;
    }
    
    setIsBuyingLife(true);
    try {
      const res = await apiRequest('POST', '/api/buy-life', {});
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to buy life');
      }
      addExtraLife(livesConfig.extraLifeSeconds);
      await refreshUser();
      toast({
        title: "+1 Жизнь!",
        description: "Шарики сброшены в начало",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка покупки",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBuyingLife(false);
    }
  }, [livesConfig, isBuyingLife, user, gameState.extraLivesBought, addExtraLife, refreshUser, toast]);

  const handleContinue = useCallback(async () => {
    if (!livesConfig || isBuyingLife) return;
    if (!user || user.totalPoints < livesConfig.extraLifeCost) {
      toast({
        title: "Недостаточно Beads",
        description: `Нужно ${livesConfig.extraLifeCost} Beads для продолжения`,
        variant: "destructive",
      });
      return;
    }
    if (gameState.extraLivesBought >= livesConfig.maxExtraLives) {
      toast({
        title: "Лимит достигнут",
        description: `Максимум ${livesConfig.maxExtraLives} дополнительных жизней за игру`,
        variant: "destructive",
      });
      return;
    }
    
    setIsBuyingLife(true);
    try {
      const res = await apiRequest('POST', '/api/buy-life', {});
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to buy life');
      }
      resumeGame();
      await refreshUser();
      toast({
        title: "+1 Жизнь!",
        description: "Игра продолжается, шарики сброшены в начало",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка покупки",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBuyingLife(false);
    }
  }, [livesConfig, isBuyingLife, user, gameState.extraLivesBought, resumeGame, refreshUser, toast]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background overflow-hidden flex flex-col"
      data-testid="game-screen"
    >
      {gameState.isPlaying && (
        <GameHUD 
          gameState={gameState} 
          elapsedTime={elapsedTime}
          ballsOnScreen={ballsOnScreen}
          ballsRemaining={ballsRemaining}
          totalBalls={totalBalls}
          userBeads={user?.totalPoints || 0}
          lifeCost={livesConfig?.extraLifeCost || 50}
          maxExtraLives={livesConfig?.maxExtraLives || 5}
          onBuyLife={handleBuyLife}
          isBuyingLife={isBuyingLife}
        />
      )}

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
          onContinue={handleContinue}
          user={user}
          lifeCost={livesConfig?.extraLifeCost || 50}
          maxExtraLives={livesConfig?.maxExtraLives || 5}
          isBuyingLife={isBuyingLife}
          levelName={level.nameRu}
        />
      )}
    </div>
  );
}
