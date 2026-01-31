import { useState, useCallback } from 'react';

interface PlayerState {
  lives: number;
  maxLives: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  coins: number;
  gems: number;
  powerUps: Record<string, number>; // powerUpId: count
}

export function usePlayerState(initialState?: Partial<PlayerState>) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    lives: initialState?.lives ?? 3,
    maxLives: initialState?.maxLives ?? 3,
    energy: initialState?.energy ?? 100,
    maxEnergy: initialState?.maxEnergy ?? 100,
    level: initialState?.level ?? 1,
    experience: initialState?.experience ?? 0,
    nextLevelExp: initialState?.nextLevelExp ?? 100,
    coins: initialState?.coins ?? 0,
    gems: initialState?.gems ?? 0,
    powerUps: initialState?.powerUps ?? {},
  });

  const addLives = useCallback((count: number) => {
    setPlayerState(prev => ({
      ...prev,
      lives: Math.min(prev.lives + count, prev.maxLives),
    }));
  }, []);

  const removeLives = useCallback((count: number) => {
    setPlayerState(prev => ({
      ...prev,
      lives: Math.max(prev.lives - count, 0),
    }));
  }, []);

  const addEnergy = useCallback((amount: number) => {
    setPlayerState(prev => ({
      ...prev,
      energy: Math.min(prev.energy + amount, prev.maxEnergy),
    }));
  }, []);

  const consumeEnergy = useCallback((amount: number) => {
    setPlayerState(prev => ({
      ...prev,
      energy: Math.max(prev.energy - amount, 0),
    }));
  }, []);

  const addExperience = useCallback((exp: number) => {
    setPlayerState(prev => {
      const newExp = prev.experience + exp;
      let newLevel = prev.level;
      let remainingExp = newExp;
      let newNextLevelExp = prev.nextLevelExp;

      // Level up logic
      while (remainingExp >= newNextLevelExp) {
        remainingExp -= newNextLevelExp;
        newLevel += 1;
        newNextLevelExp = Math.floor(newNextLevelExp * 1.2); // Increase exp requirement by 20%
      }

      return {
        ...prev,
        level: newLevel,
        experience: remainingExp,
        nextLevelExp: newNextLevelExp,
      };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setPlayerState(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    setPlayerState(prev => {
      if (prev.coins >= amount) {
        return {
          ...prev,
          coins: prev.coins - amount,
        };
      }
      return prev;
    });
    return playerState.coins >= amount;
  }, [playerState.coins]);

  const addGems = useCallback((amount: number) => {
    setPlayerState(prev => ({
      ...prev,
      gems: prev.gems + amount,
    }));
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    setPlayerState(prev => {
      if (prev.gems >= amount) {
        return {
          ...prev,
          gems: prev.gems - amount,
        };
      }
      return prev;
    });
    return playerState.gems >= amount;
  }, [playerState.gems]);

  const addPowerUp = useCallback((powerUpId: string, count: number = 1) => {
    setPlayerState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [powerUpId]: (prev.powerUps[powerUpId] || 0) + count,
      },
    }));
  }, []);

  const usePowerUp = useCallback((powerUpId: string): boolean => {
    setPlayerState(prev => {
      const currentCount = prev.powerUps[powerUpId] || 0;
      if (currentCount > 0) {
        return {
          ...prev,
          powerUps: {
            ...prev.powerUps,
            [powerUpId]: currentCount - 1,
          },
        };
      }
      return prev;
    });
    return (playerState.powerUps[powerUpId] || 0) > 0;
  }, [playerState.powerUps]);

  const resetPlayerState = useCallback(() => {
    setPlayerState({
      lives: 3,
      maxLives: 3,
      energy: 100,
      maxEnergy: 100,
      level: 1,
      experience: 0,
      nextLevelExp: 100,
      coins: 0,
      gems: 0,
      powerUps: {},
    });
  }, []);

  return {
    ...playerState,
    addLives,
    removeLives,
    addEnergy,
    consumeEnergy,
    addExperience,
    addCoins,
    spendCoins,
    addGems,
    spendGems,
    addPowerUp,
    usePowerUp,
    resetPlayerState,
  };
}