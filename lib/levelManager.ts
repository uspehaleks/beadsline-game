import { LEVELS } from './levelConfig';
import type { LevelConfig, LevelPath, PathType } from './levelTypes';
import { logService } from './logService';

// Расширяем интерфейс LevelConfig, чтобы включить метод getPathPoint
interface ExtendedLevelConfig extends LevelConfig {
  getPathPoint: (progress: number) => { x: number; y: number; progress: number };
}

// Функция для генерации пути на основе типа и параметров
function generatePathPoints(pathConfig: LevelPath, canvasWidth: number = 1, canvasHeight: number = 1): Array<{ x: number; y: number; progress: number }> {
  const points: Array<{ x: number; y: number; progress: number }> = [];
  const segmentCount = pathConfig.segments || 100;

  // Вычисляем центр и масштабный коэффициент для всех типов путей
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const scaleFactor = minDimension * 0.75; // Радиус спирали - 75% от меньшей стороны

  for (let i = 0; i <= segmentCount; i++) {
    const progress = i / segmentCount;
    let x = centerX; // По умолчанию в центре
    let y = centerY; // По умолчанию в центре

    switch (pathConfig.type) {
      case 'spiral':
        // Параметрическое уравнение спирали
        const turns = pathConfig.spiralTurns || 3;
        const outerRadius = pathConfig.outerRadius || 0.4;
        const innerRadius = pathConfig.innerRadius || 0.1;

        // Радиус уменьшается от outerRadius до innerRadius
        const radius = innerRadius + (outerRadius - innerRadius) * (1 - progress);
        const angle = progress * 2 * Math.PI * turns;

        x = centerX + (radius * scaleFactor * Math.cos(angle));
        y = centerY + (radius * scaleFactor * Math.sin(angle));
        break;

      case 'zigzag':
        const amplitude = pathConfig.amplitude || 0.3;
        const frequency = pathConfig.frequency || 4;

        // Масштабируем x от левого края к правому
        x = centerX + (progress - 0.5) * canvasWidth;
        // Масштабируем y с амплитудой относительно минимального размера
        y = centerY + amplitude * Math.sin(progress * Math.PI * frequency) * minDimension * 0.4;
        break;

      case 'wave':
        const waveAmplitude = pathConfig.amplitude || 0.18;
        const waveFrequency = pathConfig.frequency || 3;

        // Масштабируем x от левого края к правому
        x = centerX + (progress - 0.5) * canvasWidth;
        // Масштабируем y с амплитудой относительно минимального размера
        y = centerY + waveAmplitude * Math.sin(progress * Math.PI * waveFrequency) * minDimension * 0.4;
        break;

      case 'sShape':
        const sAmplitude = pathConfig.amplitude || 0.3;

        // Масштабируем x от левого края к правому
        x = centerX + (progress - 0.5) * canvasWidth;
        // Масштабируем y с амплитудой относительно минимального размера
        y = centerY + sAmplitude * Math.sin(progress * Math.PI * 2) * minDimension * 0.4;
        break;

      case 'heart':
        // Упрощенная параметрическая функция для формы сердца
        const heartScale = 0.3;
        const t = progress * 2 * Math.PI;

        x = centerX + (heartScale * (16 * Math.pow(Math.sin(t), 3)) / 20) * minDimension * 0.4;
        y = centerY - (heartScale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 20) * minDimension * 0.4;
        break;

      case 'infinity':
        // Форма восьмерки (lemniscate)
        const infinityScale = 0.3;
        const u = (progress - 0.5) * 4 * Math.PI; // масштабируем от -2π до 2π
        const denominator = 1 + Math.pow(Math.sin(u), 2);

        x = centerX + (infinityScale * Math.cos(u) / denominator) * minDimension * 0.4;
        y = centerY + (infinityScale * Math.cos(u) * Math.sin(u) / denominator) * minDimension * 0.4;
        break;
    }

    // Ограничиваем координаты в пределах холста
    x = Math.max(0, Math.min(canvasWidth, x));
    y = Math.max(0, Math.min(canvasHeight, y));

    points.push({ x, y, progress });
  }

  return points;
}

// Функция для получения точки на пути по прогрессу
function createGetPathPointFunction(pathConfig: LevelPath, canvasWidth: number = 1, canvasHeight: number = 1) {
  return (progress: number): { x: number; y: number; progress: number } => {
    // Ограничиваем прогресс в пределах [0, 1]
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
    // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
    // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
    if (clampedProgress > 0) {
      // Calculate position based on path type (we'll validate after calculation)
    }

    // Вычисляем центр холста
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Вычисляем масштабный коэффициент, чтобы спираль помещалась в холст
    const minDimension = Math.min(canvasWidth, canvasHeight);
    const scaleFactor = minDimension * 0.75; // Радиус спирали - 75% от меньшей стороны

    // ПРОВЕРЬ ТИП ПУТИ: Если сейчас стоит "сердце" или "бесконечность",
    // переключи принудительно на простую "линию", чтобы мы поняли, не в формулах ли дело.
    const actualType = (pathConfig.type === 'heart' || pathConfig.type === 'infinity') ? 'line' : pathConfig.type;

    switch (actualType) {
      case 'line':
        // Простая линия от левого края к правому
        const lineX = centerX + (clampedProgress - 0.5) * canvasWidth * 0.8; // 80% ширины
        const lineY = centerY; // Горизонтальная линия по центру
        const lineResult = {
          x: Math.max(0, Math.min(canvasWidth, lineX)),
          y: Math.max(0, Math.min(canvasHeight, lineY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(lineResult.x) || isNaN(lineResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${lineResult.x}, y: ${lineResult.y}`);
        }

        return lineResult;
      case 'spiral':
        const turns = pathConfig.spiralTurns || 3;
        const outerRadius = pathConfig.outerRadius || 0.4;
        const innerRadius = pathConfig.innerRadius || 0.1;

        // Радиус уменьшается от outerRadius до innerRadius (в относительных единицах)
        const radius = innerRadius + (outerRadius - innerRadius) * (1 - clampedProgress);
        const angle = clampedProgress * 2 * Math.PI * turns;

        // Применяем масштабирование и центрирование
        // radius - это относительное значение (0.1-0.4), которое умножаем на scaleFactor
        // scaleFactor здесь - это максимальный возможный радиус спирали
        const scaledRadius = radius * scaleFactor;
        const x = centerX + (scaledRadius * Math.cos(angle));
        const y = centerY + (scaledRadius * Math.sin(angle));

        // Добавляем отладочный лог для начальной точки
        if (clampedProgress === 0) {
          logService.info(`Spiral start point: progress=${clampedProgress}, radius=${radius}, scaledRadius=${scaledRadius}, centerX=${centerX}, centerY=${centerY}, x=${x}, y=${y}, canvasSize=${canvasWidth}x${canvasHeight}`);
        }

        const finalX = Math.max(0, Math.min(canvasWidth, x));
        const finalY = Math.max(0, Math.min(canvasHeight, y));

        // Добавляем отладочный лог, если координаты оказываются в левом нижнем углу
        if (finalX < 10 && finalY > canvasHeight - 10) {
          logService.warn(`WARNING: Point clamped to bottom-left corner! progress=${clampedProgress}, original x=${x}, y=${y}, final x=${finalX}, y=${finalY}`);
        }

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        const pos = { x: finalX, y: finalY, progress: clampedProgress };
        if (isNaN(pos.x) || isNaN(pos.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${pos.x}, y: ${pos.y}`);
        }

        return pos;

      case 'zigzag':
        const amplitude = pathConfig.amplitude || 0.3;
        const frequency = pathConfig.frequency || 4;
        const zigzagX = clampedProgress;
        const zigzagY = 0.5 + amplitude * Math.sin(clampedProgress * Math.PI * frequency);
        // Масштабируем и центрируем с использованием scaleFactor
        const scaledX = centerX + (zigzagX - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const scaledY = centerY + (zigzagY - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const zigzagResult = {
          x: Math.max(0, Math.min(canvasWidth, scaledX)),
          y: Math.max(0, Math.min(canvasHeight, scaledY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(zigzagResult.x) || isNaN(zigzagResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${zigzagResult.x}, y: ${zigzagResult.y}`);
        }

        return zigzagResult;

      case 'wave':
        const waveAmplitude = pathConfig.amplitude || 0.18;
        const waveFrequency = pathConfig.frequency || 3;
        const waveX = clampedProgress;
        const waveY = 0.5 + waveAmplitude * Math.sin(clampedProgress * Math.PI * waveFrequency);
        // Масштабируем и центрируем с использованием scaleFactor
        const scaledWaveX = centerX + (waveX - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const scaledWaveY = centerY + (waveY - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const waveResult = {
          x: Math.max(0, Math.min(canvasWidth, scaledWaveX)),
          y: Math.max(0, Math.min(canvasHeight, scaledWaveY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(waveResult.x) || isNaN(waveResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${waveResult.x}, y: ${waveResult.y}`);
        }

        return waveResult;

      case 'sShape':
        const sAmplitude = pathConfig.amplitude || 0.3;
        const sX = clampedProgress;
        const sY = 0.5 + sAmplitude * Math.sin(clampedProgress * Math.PI * 2);
        // Масштабируем и центрируем с использованием scaleFactor
        const scaledSX = centerX + (sX - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const scaledSY = centerY + (sY - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const sResult = {
          x: Math.max(0, Math.min(canvasWidth, scaledSX)),
          y: Math.max(0, Math.min(canvasHeight, scaledSY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(sResult.x) || isNaN(sResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${sResult.x}, y: ${sResult.y}`);
        }

        return sResult;

      case 'heart':
        const heartScale = 0.3;
        const t = clampedProgress * 2 * Math.PI;
        const heartX = 0.5 + heartScale * (16 * Math.pow(Math.sin(t), 3)) / 20;
        const heartY = 0.5 - heartScale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 20;
        // Масштабируем и центрируем с использованием scaleFactor
        const scaledHeartX = centerX + (heartX - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const scaledHeartY = centerY + (heartY - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const heartResult = {
          x: Math.max(0, Math.min(canvasWidth, scaledHeartX)),
          y: Math.max(0, Math.min(canvasHeight, scaledHeartY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(heartResult.x) || isNaN(heartResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${heartResult.x}, y: ${heartResult.y}`);
        }

        return heartResult;

      case 'infinity':
        const infinityScale = 0.3;
        const u = (clampedProgress - 0.5) * 4 * Math.PI; // масштабируем от -2π до 2π
        const denominator = 1 + Math.pow(Math.sin(u), 2);
        const infinityX = 0.5 + infinityScale * Math.cos(u) / denominator;
        const infinityY = 0.5 + infinityScale * Math.cos(u) * Math.sin(u) / denominator;
        // Масштабируем и центрируем с использованием scaleFactor
        const scaledInfinityX = centerX + (infinityX - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const scaledInfinityY = centerY + (infinityY - 0.5) * minDimension * 0.4; // Используем масштабный коэффициент
        const infinityResult = {
          x: Math.max(0, Math.min(canvasWidth, scaledInfinityX)),
          y: Math.max(0, Math.min(canvasHeight, scaledInfinityY)),
          progress: clampedProgress
        };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (isNaN(infinityResult.x) || isNaN(infinityResult.y)) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${infinityResult.x}, y: ${infinityResult.y}`);
        }

        return infinityResult;

      default:
        const defaultResult = { x: centerX, y: centerY, progress: clampedProgress };

        // МАТЕМАТИКА ТРАЕКТОРИИ (utils/pathPhysics.ts):
        // В функции getPathPoint(progress), которая превращает % пути в координаты X и Y:
        // Если progress > 0, но x или y возвращаются как NaN или 0, выведи ошибку:
        if (clampedProgress > 0 && (isNaN(defaultResult.x) || isNaN(defaultResult.y))) {
          console.error(`[PATH_ERROR] Invalid coordinates for progress: ${clampedProgress}, x: ${defaultResult.x}, y: ${defaultResult.y}`);
        }

        return defaultResult;
    }
  };
}

// Функция для расширения уровней методом getPathPoint
function extendLevelsWithMethods(levels: LevelConfig[]): ExtendedLevelConfig[] {
  return levels.map(level => {
    // Создаем временную функцию с фиксированными размерами холста
    // В реальном приложении эти размеры будут передаваться динамически
    // Используем стандартные размеры, но в реальном приложении они будут обновляться
    const getPathPoint = createGetPathPointFunction(level.path, 800, 600); // стандартные размеры

    return {
      ...level,
      getPathPoint
    };
  });
}

// Расширяем уровни методами
const EXTENDED_LEVELS = extendLevelsWithMethods(LEVELS);

export function getLevelById(id: number): ExtendedLevelConfig | undefined {
  return EXTENDED_LEVELS.find(level => level.id === id);
}

export function getUnlockedLevels(completedLevels: number[]): ExtendedLevelConfig[] {
  return EXTENDED_LEVELS.filter(level => {
    if (level.unlockCondition === null) return true;
    return completedLevels.includes(level.unlockCondition);
  });
}

export function isLevelUnlocked(levelId: number, completedLevels: number[]): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  if (level.unlockCondition === null) return true;
  return completedLevels.includes(level.unlockCondition);
}

export function getDifficultyColor(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getDifficultyBgColor(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/20';
    case 'medium': return 'bg-yellow-500/20';
    case 'hard': return 'bg-red-500/20';
    default: return 'bg-gray-500/20';
  }
}

export function getDifficultyLabel(difficulty: LevelConfig['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'Лёгкий';
    case 'medium': return 'Средний';
    case 'hard': return 'Сложный';
    default: return difficulty;
  }
}

// Функция для обновления метода getPathPoint с учетом текущих размеров холста
export function updateLevelPathMethods(level: LevelConfig, canvasWidth: number, canvasHeight: number): ExtendedLevelConfig {
  const getPathPoint = createGetPathPointFunction(level.path, canvasWidth, canvasHeight);

  return {
    ...level,
    getPathPoint
  };
}

// Экспортируем функцию генерации точек пути
export { generatePathPoints };