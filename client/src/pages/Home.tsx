import { useState, useCallback } from 'react';
import type { GameState, LeaderboardEntry } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainMenu } from '@/components/MainMenu';
import { GameScreen } from '@/components/GameScreen';
import { Leaderboard } from '@/components/Leaderboard';
import { LevelSelect } from '@/components/LevelSelect';
import { BoostShop } from '@/components/BoostShop';
import { AccessoryShop } from '@/components/AccessoryShop';
import { CharacterCustomize } from '@/components/CharacterCustomize';
import CharacterCreation from '@/pages/CharacterCreation';
import { useUser } from '@/contexts/UserContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { type LevelConfig, LEVELS } from '@/lib/levelConfig';

type Screen = 'menu' | 'levelSelect' | 'game' | 'leaderboard' | 'shop' | 'accessoryShop' | 'customize';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const { user, isLoading: isUserLoading, refreshUser } = useUser();

  const { data: characterExists, isLoading: isCharacterLoading, refetch: refetchCharacter } = useQuery<{ exists: boolean }>({
    queryKey: ['/api/character/exists'],
    enabled: !!user,
  });

  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
    enabled: currentScreen === 'leaderboard',
  });

  const submitScoreMutation = useMutation({
    mutationFn: async ({ gameState, levelId }: { gameState: GameState; levelId: number }) => {
      if (!user) return;
      
      const response = await apiRequest('POST', '/api/scores', {
        score: gameState.score,
        cryptoBtc: gameState.cryptoCollected.btc,
        cryptoEth: gameState.cryptoCollected.eth,
        cryptoUsdt: gameState.cryptoCollected.usdt,
        maxCombo: gameState.maxCombo,
        accuracy: gameState.shotsTotal > 0 
          ? Math.round((gameState.shotsHit / gameState.shotsTotal) * 100) 
          : 0,
        duration: 45 - gameState.timeLeft,
        won: gameState.won,
        levelId,
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      refreshUser();
    },
  });

  const handleGameEnd = useCallback((gameState: GameState) => {
    submitScoreMutation.mutate({ gameState, levelId: selectedLevel.id });
  }, [submitScoreMutation, selectedLevel.id]);

  const handlePlay = useCallback(() => {
    setCurrentScreen('levelSelect');
  }, []);

  const handleSelectLevel = useCallback((level: LevelConfig) => {
    setSelectedLevel(level);
    setCurrentScreen('game');
  }, []);

  const handleViewLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  const handleMainMenu = useCallback(() => {
    setCurrentScreen('menu');
  }, []);

  const handleShop = useCallback(() => {
    setCurrentScreen('shop');
  }, []);

  const handleAccessoryShop = useCallback(() => {
    setCurrentScreen('accessoryShop');
  }, []);

  const handleCustomize = useCallback(() => {
    setCurrentScreen('customize');
  }, []);

  const handleCharacterCreated = useCallback(() => {
    refetchCharacter();
  }, [refetchCharacter]);

  if (isUserLoading || isCharacterLoading) {
    return <LoadingScreen />;
  }

  if (user && characterExists && !characterExists.exists) {
    return <CharacterCreation onComplete={handleCharacterCreated} />;
  }

  switch (currentScreen) {
    case 'levelSelect':
      return (
        <LevelSelect
          completedLevels={user?.completedLevels ?? []}
          onSelectLevel={handleSelectLevel}
          onBack={handleMainMenu}
        />
      );
    
    case 'game':
      return (
        <GameScreen
          level={selectedLevel}
          isLevelCompleted={(user?.completedLevels ?? []).includes(selectedLevel.id)}
          onGameEnd={handleGameEnd}
          onViewLeaderboard={handleViewLeaderboard}
          onMainMenu={handleMainMenu}
        />
      );
    
    case 'leaderboard':
      return (
        <Leaderboard
          entries={leaderboard}
          currentUserId={user?.id}
          isLoading={isLeaderboardLoading}
          onBack={handleMainMenu}
        />
      );
    
    case 'shop':
      return (
        <BoostShop onBack={handleMainMenu} />
      );
    
    case 'accessoryShop':
      return (
        <AccessoryShop onBack={handleMainMenu} />
      );
    
    case 'customize':
      return (
        <CharacterCustomize onBack={handleMainMenu} />
      );
    
    default:
      return (
        <MainMenu
          user={user}
          onPlay={handlePlay}
          onLeaderboard={handleViewLeaderboard}
          onShop={handleShop}
          onAccessoryShop={handleAccessoryShop}
          onCustomize={handleCustomize}
          isLoading={submitScoreMutation.isPending}
        />
      );
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-16 h-16 mb-6 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-primary/40 animate-pulse" />
      </div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
