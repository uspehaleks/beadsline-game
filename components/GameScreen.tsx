import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState, LivesConfig, Boost, UserBoostInventory } from '@shared/schema';
import { GameCanvas } from './GameCanvas';
import { GameHUD, type BoostInventoryItem } from './GameHUD';
import { NextBallPreview } from './NextBallPreview';
import { GameOverScreen } from './GameOverScreen';
import { useGameState } from '@/hooks/useGameState';
import { 
  setLevelCompleted,
  activateSlowdown,
  activateRainbow,
  activateBomb,
  activateRewind,
  activateShield,
  activateMagnet,
  activateLaser,
  type BoostType
} from '@/lib/gameEngine';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useUser } from '@/contexts/UserContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { LevelConfig } from '@/lib/levelConfig';
import { 
  playSlowdownSound, 
  playBombSound, 
  playRainbowSound, 
  playRewindSound, 
  playShieldSound, 
  playMagnetSound, 
  playLaserSound 
} from '@/lib/sounds';

interface GameScreenProps {
  level: LevelConfig;
  isLevelCompleted: boolean;
  onGameEnd: (state: GameState) => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
  useCryptoTicket?: boolean;
}

export function GameScreen({ level, isLevelCompleted, onGameEnd, onViewLeaderboard, onMainMenu, useCryptoTicket = false }: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track if crypto ticket was used for the FIRST game only
  const [cryptoTicketActive, setCryptoTicketActive] = useState(useCryptoTicket);
  const isFirstGameRef = useRef(true);
  
  // Set level completion state for crypto ball spawning (only on mount/changes)
  useEffect(() => {
    // When using crypto ticket, treat level as not completed so crypto balls spawn
    const effectiveCompleted = cryptoTicketActive ? false : isLevelCompleted;
    setLevelCompleted(effectiveCompleted);
    
    // Cleanup: restore original state when unmounting
    return () => {
      setLevelCompleted(isLevelCompleted);
    };
  }, [cryptoTicketActive, isLevelCompleted]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const sessionIdRef = useRef<string | null>(null);
  const [isBuyingLife, setIsBuyingLife] = useState(false);
  const { user, refreshUser } = useUser();
  const { toast } = useToast();

  const { data: livesConfig } = useQuery<LivesConfig>({
    queryKey: ["/api/lives-config"],
  });

  const { data: userBoostsData } = useQuery<Array<UserBoostInventory & { boost: Boost }>>({
    queryKey: ["/api/user/boosts"],
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const boostInventory: BoostInventoryItem[] = (userBoostsData || []).map(item => ({
    boostType: item.boost.type as BoostType,
    quantity: item.quantity,
  }));

  const useBoostMutation = useMutation({
    mutationFn: async (boostId: string) => {
      const res = await apiRequest('POST', '/api/boosts/use', { boostId });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to use boost');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/boosts"] });
    },
  });

  const handleUseBoost = useCallback((boostType: BoostType) => {
    const inventoryItem = userBoostsData?.find(item => item.boost.type === boostType);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      toast({
        title: "Буст недоступен",
        description: "У вас нет этого буста",
        variant: "destructive",
      });
      return;
    }

    useBoostMutation.mutate(inventoryItem.boostId, {
      onSuccess: () => {
        switch (boostType) {
          case 'slowdown':
            activateSlowdown(10000, 0.5);
            playSlowdownSound();
            toast({ title: "Замедление активировано!", description: "Шары замедлены на 10 секунд" });
            break;
          case 'rainbow':
            activateRainbow();
            playRainbowSound();
            toast({ title: "Радуга активирована!", description: "Следующий шар совместим со всеми цветами" });
            break;
          case 'bomb':
            activateBomb();
            playBombSound();
            toast({ title: "Бомба активирована!", description: "Следующий выстрел уничтожит область" });
            break;
          case 'rewind':
            activateRewind();
            applyRewind();
            playRewindSound();
            toast({ title: "Откат активирован!", description: "Шары откатились назад" });
            break;
          case 'shield':
            activateShield();
            playShieldSound();
            toast({ title: "Щит активирован!", description: "Защита от одного попадания в конец" });
            break;
          case 'magnet':
            activateMagnet(3);
            playMagnetSound();
            toast({ title: "Магнит активирован!", description: "Притянет ближайшие шары" });
            break;
          case 'laser':
            activateLaser(3);
            playLaserSound();
            toast({ title: "Лазер активирован!", description: "Пробьёт несколько шаров" });
            break;
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }, [userBoostsData, useBoostMutation, toast]);

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
    totalSpawned,
    currentLifeMax,
    isPaused,
    startGame: originalStartGame,
    shoot,
    updateAim,
    addExtraLife,
    resumeGame,
    applyRewind,
    togglePause,
    stepFrame,
  } = useGameState({
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
    onGameEnd: handleGameEnd,
    level,
    bonusLives: user?.bonusLives || 0,
    onUseBonusLife: async () => {
      try {
        await apiRequest('POST', '/api/use-bonus-life', {});
        await refreshUser();
      } catch (error) {
        console.error('Failed to use bonus life:', error);
      }
    },
  });

  const startGame = useCallback(() => {
    // Crypto ticket is already consumed in Home.tsx before entering this screen
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
    // Crypto ticket only applies to the first game
    if (isFirstGameRef.current) {
      isFirstGameRef.current = false;
    }
    // Disable crypto ticket for replay
    setCryptoTicketActive(false);
    setLevelCompleted(isLevelCompleted);
    startGame();
  }, [startGame, isLevelCompleted]);

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
          totalSpawned={totalSpawned}
          currentLifeMax={currentLifeMax}
          userBeads={user?.totalPoints || 0}
          lifeCost={livesConfig?.extraLifeCost || 50}
          maxExtraLives={livesConfig?.maxExtraLives || 5}
          onBuyLife={handleBuyLife}
          isBuyingLife={isBuyingLife}
          boostInventory={boostInventory}
          onUseBoost={handleUseBoost}
          isUsingBoost={useBoostMutation.isPending}
          bonusLives={user?.bonusLives || 0}
          useCryptoTicket={cryptoTicketActive}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onStepFrame={stepFrame}
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

      <div className="h-24 bg-gradient-to-t from-background to-transparent px-4 py-3 flex items-center justify-between relative">
        <div className="w-16" />
        
        <div className="absolute left-1/2 -translate-x-1/2 top-2">
          <NextBallPreview ball={gameState.nextBall} />
        </div>
        
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
