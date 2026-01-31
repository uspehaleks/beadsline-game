// Тест для проверки соответствия типа GameState
import type { GameState } from '@shared/schema';
import { createInitialGameState } from '../lib/gameEngine';

// Создаем начальное состояние
const initialState: GameState = createInitialGameState(1, "TestPlayer");

// Проверяем, что у нас есть все необходимые поля
console.log("Initial state created successfully:");
console.log("- ID:", initialState.id);
console.log("- Balls length:", initialState.balls.length); // Это было местом ошибки
console.log("- Score:", initialState.score);
console.log("- Combo:", initialState.combo);
console.log("- Lives:", initialState.lives);
console.log("- Level ID:", initialState.levelId);

// Проверяем, что мы можем получить длину массива balls без ошибок
const ballsCount = initialState.balls.length;
console.log("Successfully accessed balls.length:", ballsCount);