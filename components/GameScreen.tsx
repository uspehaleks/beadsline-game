import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState, LivesConfig, Boost, UserBoostInventory } from '@shared/schema';
import { GameCanvas } from './GameCanvas';
import { GameHUD, type BoostInventoryItem } from './GameHUD';
import { NextBallPreview } from './NextBallPreview';
import { GameOverScreen } from './GameOverScreen';
import { GameCharacter } from './GameCharacter';
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
import type { LevelConfig } from '@/lib/levelTypes';
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
      // Сохраняем ID сессии в localStorage для использования в useGameState
      localStorage.setItem('currentSessionId', data.sessionId);
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
        // Учитываем высоту верхней панели (с логотипом и персонажем ~60px) и нижней панели (~96px)
        setDimensions({
          width: rect.width,
          height: rect.height - 156, // ~60px верх + ~96px низ
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
    canvasWidth: dimensions.width > 0 ? dimensions.width : 800, // Используем стандартный размер, если размеры не определены
    canvasHeight: dimensions.height > 0 ? dimensions.height : 600,
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
      // Принудительно снимаем паузу, чтобы игра точно запустилась
      resumeGame();
    }
  }, [dimensions.width, dimensions.height, resumeGame]);

  const handlePlayAgain = useCallback(() => {
    // Crypto ticket only applies to the first game
    if (isFirstGameRef.current) {
      isFirstGameRef.current = false;
    }
    // Disable crypto ticket for replay
    setCryptoTicketActive(false);
    setLevelCompleted(isLevelCompleted);
    startGame();
    // Принудительно снимаем паузу, чтобы игра точно запустилась
    resumeGame();
  }, [startGame, resumeGame, isLevelCompleted]);

  const handleBuyLife = useCallback(async () => {
    if (!livesConfig || isBuyingLife) return;
    if (!user || user.totalPoints < livesConfig.costPerLife) {
      toast({
        title: "Недостаточно Beads",
        description: `Нужно ${livesConfig.costPerLife} Beads для покупки жизни`,
        variant: "destructive",
      });
      return;
    }
    // extraLivesBought not available in current GameState schema
    // Skip this check for now

    setIsBuyingLife(true);
    try {
      const res = await apiRequest('POST', '/api/buy-life', {});
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to buy life');
      }
      addExtraLife(0); // extraLifeSeconds not available in current schema
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
  }, [livesConfig, isBuyingLife, user, addExtraLife, refreshUser, toast]); // Removed gameState.extraLivesBought as it's not available in current schema

  const handleContinue = useCallback(async () => {
    if (!livesConfig || isBuyingLife) return;
    if (!user || user.totalPoints < livesConfig.costPerLife) {
      toast({
        title: "Недостаточно Beads",
        description: `Нужно ${livesConfig.costPerLife} Beads для продолжения`,
        variant: "destructive",
      });
      return;
    }
    // extraLivesBought not available in current GameState schema
    // Skip this check for now

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
  }, [livesConfig, isBuyingLife, user, resumeGame, refreshUser, toast]); // Removed gameState.extraLivesBought as it's not available in current schema

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden flex flex-row"
      data-testid="game-screen"
    >

      {/* Игровой Canvas (основное поле) */}
      <div className="flex-1 relative flex flex-col">
        {/* Верхняя панель с логотипом и персонажем */}
        <div className="flex items-center justify-between px-4 py-3 z-10">
          <div className="flex items-center">
            {/* Логотип или название игры */}
            <h1 className="text-xl font-bold text-primary">Beads Line</h1>
          </div>

          {/* Компонент персонажа */}
          <GameCharacter size="sm" showStats={true} />
        </div>

        {/* isPlaying not available in current GameState schema */}
        <GameHUD
          gameState={gameState}
          elapsedTime={elapsedTime}
          ballsOnScreen={ballsOnScreen}
          ballsRemaining={ballsRemaining}
          totalBalls={totalBalls}
          totalSpawned={totalSpawned}
          currentLifeMax={currentLifeMax}
          userBeads={user?.totalPoints || 0}
          lifeCost={livesConfig?.costPerLife || 50}  /* Changed extraLifeCost to costPerLife */
          maxExtraLives={livesConfig?.maxLives || 5}  /* Changed maxExtraLives to maxLives */
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

        <div className="flex-1 relative flex items-center justify-center bg-black border-none shadow-none overflow-hidden">
          <div className="w-full max-w-4xl max-h-[70vh] flex items-center justify-center border-none shadow-none bg-black">
            {dimensions.width > 0 && dimensions.height > 0 ? (
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black border-none shadow-none">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="mt-2">Загрузка игрового поля...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-24 bg-gradient-to-t from-black to-transparent px-4 py-3 flex items-center justify-between relative border-none shadow-none">
          <div className="w-16" />

          <div className="absolute left-1/2 -translate-x-1/2 top-2">
            {/* nextBall not available in current GameState schema */}
          </div>

          <div className="w-16 flex justify-end">
            {/* isPlaying and isGameOver not available in current GameState schema */}
            {/* For now, always show the start game button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={startGame}
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* isGameOver not available in current GameState schema */}
        {/* For now, we'll conditionally render based on other criteria */}
        {/* Assuming game is over when lives <= 0 or level completed */}
        {gameState.lives <= 0 && (
          <GameOverScreen
            gameState={gameState}
            onPlayAgain={handlePlayAgain}
            onViewLeaderboard={onViewLeaderboard}
            onMainMenu={onMainMenu}
            onContinue={handleContinue}
            user={user}
            lifeCost={livesConfig?.costPerLife || 50}  /* Changed extraLifeCost to costPerLife */
            maxExtraLives={livesConfig?.maxLives || 5}  /* Changed maxExtraLives to maxLives */
            isBuyingLife={isBuyingLife}
            levelName={level.nameRu}
          />
        )}
      </div>

      {/* Боковая панель (ширина 300px, темный фон, без границы слева) */}
      <aside className="w-[300px] min-w-[300px] bg-slate-900 text-cyan-300 p-4 flex flex-col font-mono" style={{padding: '20px', zIndex: 50, position: 'relative'}}>
        <h2 className="text-lg font-bold mb-4">Отладка</h2>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between">
              <span>Balls:</span>
              <span>{gameState.balls?.length || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Speed:</span>
              <span>{gameState.chainSpeed?.toFixed(6) || 'N/A'}</span>
            </li>
            <li className="flex justify-between">
              <span>Lives:</span>
              <span>{gameState.lives || 'N/A'}</span>
            </li>
            <li className="flex justify-between">
              <span>Progress:</span>
              <span>{(gameState.balls?.[0]?.pathProgress * 100 || 0).toFixed(1)}%</span>
            </li>
            <li className="flex justify-between">
              <span>Score:</span>
              <span>{gameState.score || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Combo:</span>
              <span>{gameState.combo || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Level:</span>
              <span>{level.nameRu}</span>
            </li>
            <li className="flex justify-between">
              <span>Elapsed:</span>
              <span>{elapsedTime}s</span>
            </li>
            <li className="flex justify-between">
              <span>Balls On Screen:</span>
              <span>{ballsOnScreen || 'N/A'}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Spawned:</span>
              <span>{totalSpawned || 'N/A'}</span>
            </li>
            <li className="flex justify-between">
              <span>Current Life Max:</span>
              <span>{currentLifeMax || 'N/A'}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
