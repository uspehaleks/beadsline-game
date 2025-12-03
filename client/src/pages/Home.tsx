import { useState, useCallback } from 'react';
import type { GameState, LeaderboardEntry } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainMenu } from '@/components/MainMenu';
import { GameScreen } from '@/components/GameScreen';
import { Leaderboard } from '@/components/Leaderboard';
import { useUser } from '@/contexts/UserContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

type Screen = 'menu' | 'game' | 'leaderboard';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const { user, isLoading: isUserLoading, refreshUser } = useUser();

  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
    enabled: currentScreen === 'leaderboard',
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (gameState: GameState) => {
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
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      refreshUser();
    },
  });

  const handleGameEnd = useCallback((gameState: GameState) => {
    submitScoreMutation.mutate(gameState);
  }, [submitScoreMutation]);

  const handlePlay = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleViewLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  const handleMainMenu = useCallback(() => {
    setCurrentScreen('menu');
  }, []);

  if (isUserLoading) {
    return <LoadingScreen />;
  }

  switch (currentScreen) {
    case 'game':
      return (
        <GameScreen
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
    
    default:
      return (
        <MainMenu
          user={user}
          onPlay={handlePlay}
          onLeaderboard={handleViewLeaderboard}
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
