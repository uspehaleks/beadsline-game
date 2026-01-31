import { useState, useCallback } from 'react';

interface ScoreState {
  score: number;
  combo: number;
  highestCombo: number;
  pointsMultiplier: number;
}

export function useScoreManager(initialScore: number = 0) {
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: initialScore,
    combo: 0,
    highestCombo: 0,
    pointsMultiplier: 1,
  });

  const addScore = useCallback((points: number, hasCombo: boolean = false) => {
    setScoreState(prev => {
      let newCombo = prev.combo;
      let newHighestCombo = prev.highestCombo;
      let newPointsMultiplier = prev.pointsMultiplier;

      if (hasCombo) {
        newCombo += 1;
        if (newCombo > newHighestCombo) {
          newHighestCombo = newCombo;
        }
        // Increase points multiplier based on combo (e.g., every 5 combos)
        newPointsMultiplier = 1 + Math.floor(newCombo / 5) * 0.2; // 20% bonus every 5 combos
      } else {
        // Reset combo if no combo was achieved
        newCombo = 0;
        newPointsMultiplier = 1;
      }

      const finalPoints = Math.round(points * newPointsMultiplier);
      
      return {
        ...prev,
        score: prev.score + finalPoints,
        combo: newCombo,
        highestCombo: newHighestCombo,
        pointsMultiplier: newPointsMultiplier,
      };
    });
  }, []);

  const resetCombo = useCallback(() => {
    setScoreState(prev => ({
      ...prev,
      combo: 0,
      pointsMultiplier: 1,
    }));
  }, []);

  const resetScore = useCallback(() => {
    setScoreState({
      score: 0,
      combo: 0,
      highestCombo: 0,
      pointsMultiplier: 1,
    });
  }, []);

  return {
    ...scoreState,
    addScore,
    resetCombo,
    resetScore,
  };
}