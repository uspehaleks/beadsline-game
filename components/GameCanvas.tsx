import { useRef, useEffect, useCallback } from 'react';
import type { Ball, GameState } from '@shared/schema';
import {
  BALL_COLOR_MAP,
  CRYPTO_COLOR_MAP,
  CRYPTO_SYMBOL_MAP,
  BALL_RADIUS,
} from '@/lib/gameEngine';
import { logService } from '@/lib/logService';
import type { PathPoint } from '@shared/schema';

interface GameCanvasProps {
  gameState: GameState;
  path: PathPoint[];
  projectile: { x: number; y: number; ball: Ball } | null;
  shooterAngle: number;
  shooterPosition: { x: number; y: number };
  onShoot: (x: number, y: number) => void;
  onAim: (x: number, y: number) => void;
  width: number;
  height: number;
}

export function GameCanvas({
  gameState,
  path,
  projectile,
  shooterAngle,
  shooterPosition,
  onShoot,
  onAim,
  width,
  height,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pathRenderedRef = useRef(false);

  const portalAnimationRef = useRef(0);
  
  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    // Добавляем отладочную информацию
    console.log("Path length:", path.length);
    if (path.length > 0) {
      console.log("First point:", path[0]);
      console.log("Last point:", path[path.length - 1]);
      console.log("Canvas size:", width, "x", height);
    }

    // Создаем offscreen canvas для статичных элементов, если он еще не создан
    if (!offscreenCanvasRef.current || !offscreenCtxRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = width;
      offscreenCanvasRef.current.height = height;
      offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
    }

    const offscreenCtx = offscreenCtxRef.current;
    if (!offscreenCtx) return;

    // Отрисовываем статичные элементы (путь) только один раз или при изменении размеров
    if (!pathRenderedRef.current || offscreenCanvasRef.current.width !== width || offscreenCanvasRef.current.height !== height) {
      // Обновляем размеры offscreen canvas при необходимости
      if (offscreenCanvasRef.current.width !== width || offscreenCanvasRef.current.height !== height) {
        offscreenCanvasRef.current.width = width;
        offscreenCanvasRef.current.height = height;
      }

      // Очищаем offscreen canvas
      offscreenCtx.clearRect(0, 0, width, height);

      if (path.length >= 2) {
        // Отрисовываем путь на offscreen canvas
        offscreenCtx.beginPath();
        offscreenCtx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
        offscreenCtx.lineWidth = BALL_RADIUS * 2.5;
        offscreenCtx.lineCap = 'round';
        offscreenCtx.lineJoin = 'round';

        offscreenCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          offscreenCtx.lineTo(path[i].x, path[i].y);
        }
        offscreenCtx.stroke();

        offscreenCtx.beginPath();
        offscreenCtx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
        offscreenCtx.lineWidth = BALL_RADIUS * 3;
        offscreenCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          offscreenCtx.lineTo(path[i].x, path[i].y);
        }
        offscreenCtx.stroke();

        offscreenCtx.beginPath();
        offscreenCtx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        offscreenCtx.lineWidth = 2;
        offscreenCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          offscreenCtx.lineTo(path[i].x, path[i].y);
        }
        offscreenCtx.stroke();
      }

      pathRenderedRef.current = true;
    }

    // Копируем статичные элементы из offscreen canvas на основной canvas
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    // ПРОВЕРКА ПОРТАЛА:
    // Убедись, что начальная точка пути (path[0]) находится внутри видимой области канваса.
    if (path.length > 0) {
      console.log("[PATH] Start Point:", path[0]);
    }

    // Анимированные элементы (порталы) рисуем на основном canvas
    portalAnimationRef.current = (portalAnimationRef.current + 0.05) % (Math.PI * 4);

    if (path.length > 0) {
      const startPoint = path[0];
      const spawnPulse = 1 + Math.sin(portalAnimationRef.current * 1.5) * 0.2;
      const spawnRadius = BALL_RADIUS * 1.5 * spawnPulse; // Уменьшили размер стартового портала

      const spawnGradient = ctx.createRadialGradient(
        startPoint.x, startPoint.y, 0,
        startPoint.x, startPoint.y, spawnRadius
      );
      spawnGradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
      spawnGradient.addColorStop(0.4, 'rgba(99, 102, 241, 0.6)');
      spawnGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, spawnRadius, 0, Math.PI * 2);
      ctx.fillStyle = spawnGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, BALL_RADIUS * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(startPoint.x, startPoint.y);
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(BALL_RADIUS * 0.5, 0);
        ctx.lineTo(BALL_RADIUS * 1.2, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (path.length > 0) {
      const endPoint = path[path.length - 1];
      const pulseScale = 1 + Math.sin(portalAnimationRef.current) * 0.15;
      const portalRadius = BALL_RADIUS * 1.2 * pulseScale; // Уменьшили размер конечного портала

      const portalGradient = ctx.createRadialGradient(
        endPoint.x, endPoint.y, 0,
        endPoint.x, endPoint.y, portalRadius
      );
      portalGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      portalGradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.6)');
      portalGradient.addColorStop(1, 'rgba(185, 28, 28, 0)');

      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, portalRadius, 0, Math.PI * 2);
      ctx.fillStyle = portalGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, BALL_RADIUS * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(endPoint.x, endPoint.y);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(BALL_RADIUS * 0.3, 0);
        ctx.lineTo(BALL_RADIUS * 0.8, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [path, width, height]);

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball, isShooter: boolean = false) => {
    // МАСШТАБ ШАРОВ: жестко задаем размер шаров
    const ballRadius = 15; // фиксированный размер в 15 пикселей

    const progress = ball.pathProgress || 0;

    if (progress < -0.03) return;

    const spawnOpacity = progress < 0 ? Math.max(0, 1 + (progress / 0.03)) : 1;

    const baseColor = ball.crypto ?
      CRYPTO_COLOR_MAP[ball.crypto] || '#FF0000' : // По умолчанию красный для крипто-шаров
      BALL_COLOR_MAP[ball.color] || '#FF0000'; // По умолчанию красный для обычных шаров

    const rollAngle = progress * Math.PI * 20;

    ctx.save();
    ctx.globalAlpha = spawnOpacity;
    ctx.translate(ball.x, ball.y);

    // ДОБАВЛЯЕМ ОТЛАДОЧНУЮ ОБВОДКУ ДЛЯ КАЖДОГО ШАРА
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(-ballRadius, -ballRadius, ballRadius * 2, ballRadius * 2);

    if (ball.isUsdtFund) {
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20 * pulse;

      ctx.beginPath();
      ctx.arc(0, 0, ballRadius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(Date.now() * 0.01) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (ball.crypto) {
      ctx.shadowColor = CRYPTO_COLOR_MAP[ball.crypto];
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, ballRadius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = CRYPTO_COLOR_MAP[ball.crypto];
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    const gradient = ctx.createRadialGradient(
      -ballRadius * 0.3,
      -ballRadius * 0.3,
      0,
      0,
      0,
      ballRadius
    );

    gradient.addColorStop(0, lightenColor(baseColor, 40));
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, darkenColor(baseColor, 20));

    ctx.beginPath();
    ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = darkenColor(baseColor, 30);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (!isShooter) {
      ctx.rotate(rollAngle);

      ctx.beginPath();
      ctx.arc(0, -ballRadius * 0.5, ballRadius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, ballRadius * 0.5, ballRadius * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fill();

      ctx.rotate(-rollAngle);
    }

    if (ball.isUsdtFund) {
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold ${ballRadius * 1.1}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);

      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${ballRadius * 1.0}px Inter, sans-serif`;
      ctx.fillText('$', 0, 0);
    } else if (ball.crypto) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${ballRadius}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(CRYPTO_SYMBOL_MAP[ball.crypto], 0, 0);
    }

    ctx.beginPath();
    ctx.arc(
      -ballRadius * 0.35,
      -ballRadius * 0.35,
      ballRadius * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    ctx.restore();

    // ДОБАВЛЯЕМ ОТЛАДОЧНЫЙ ЛОГ
    if (gameState.balls.length > 0 && gameState.balls[0].id === ball.id) {
      logService.info(`Rendering Ball at: ${ball.x}, ${ball.y} with progress: ${ball.pathProgress}`);
    }
  }, [gameState.balls]);

  const drawShooter = useCallback((ctx: CanvasRenderingContext2D) => {
    const { x, y } = shooterPosition;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(shooterAngle);
    
    const shooterGradient = ctx.createLinearGradient(0, -10, 30, -10); // Уменьшили градиент пушки
    shooterGradient.addColorStop(0, '#6366f1');
    shooterGradient.addColorStop(1, '#8b5cf6');

    ctx.beginPath();
    ctx.roundRect(-6, -9, 36, 18, 3); // Уменьшили размеры пушки
    ctx.fillStyle = shooterGradient;
    ctx.fill();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5; // Уменьшили толщину линии
    ctx.stroke();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2); // Уменьшили размер основания пушки
    const baseGradient = ctx.createRadialGradient(x, y, 0, x, y, 18); // Уменьшили радиус градиента
    baseGradient.addColorStop(0, '#818cf8');
    baseGradient.addColorStop(1, '#4f46e5');
    ctx.fillStyle = baseGradient;
    ctx.fill();
    ctx.strokeStyle = '#3730a3';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    {/* shooterBall not available in current GameState schema */}
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const aimLength = 100;
    ctx.lineTo(
      x + Math.cos(shooterAngle) * aimLength,
      y + Math.sin(shooterAngle) * aimLength
    );
    ctx.stroke();
    ctx.restore();
  }, [shooterPosition, shooterAngle, drawBall]);

  const drawProjectile = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!projectile) return;
    drawBall(ctx, { ...projectile.ball, x: projectile.x, y: projectile.y });
  }, [projectile, drawBall]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Принудительно заливаем черный фон перед отрисовкой каждого кадра
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    console.log("Current balls count:", gameState.balls.length);

    drawPath(ctx);

    // ВИЗУАЛИЗАЦИЯ (components/GameCanvas.tsx):
    // В функции draw(), перед тем как рисовать шары, добавь проверку видимости:
    gameState.balls.forEach((ball, index) => {
      // ЛОГ ПОЗИЦИИ (В консоль браузера): В GameCanvas.tsx добавь:
      console.log(`DEBUG: Ball Progress: ${ball.pathProgress?.toFixed(4) || '0.0000'} | X: ${ball.x?.toFixed(0) || '0'} | Y: ${ball.y?.toFixed(0) || '0'}`);

      if (index === 0 && Math.floor(Date.now() / 1000) % 2 === 0) { // Лог каждые 2 секунды (чтобы не перегружать вывод)
        console.log(`[RENDER] Ball 0: x=${ball.x?.toFixed(1) || '0'}, y=${ball.y?.toFixed(1) || '0'}, color=${ball.color || 'unknown'}, progress=${ball.pathProgress || 0}`);
      }
      drawBall(ctx, ball);
    });

    drawProjectile(ctx);

    drawShooter(ctx);

    // ОТЛАДОЧНЫЙ ЦЕНТР: рисуем красный квадрат в центре холста
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.fillStyle = 'red';
    ctx.fillRect(centerX - 5, centerY - 5, 10, 10);

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [width, height, gameState.balls, drawPath, drawBall, drawProjectile, drawShooter]);

  useEffect(() => {
    // Сбрасываем флаг отрисовки пути при изменении размеров
    pathRenderedRef.current = false;

    draw();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, width, height]);

  const handleInteraction = useCallback((clientX: number, clientY: number, isClick: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (width / rect.width);
    const y = (clientY - rect.top) * (height / rect.height);
    
    if (isClick) {
      onShoot(x, y);
    } else {
      onAim(x, y);
    }
  }, [width, height, onShoot, onAim]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY, true);
  }, [handleInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY, false);
  }, [handleInteraction]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY, false);
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY, false);
  }, [handleInteraction]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      handleInteraction(touch.clientX, touch.clientY, true);
    }
  }, [handleInteraction]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-none cursor-crosshair"
      data-testid="game-canvas"
      style={{ border: 'none', boxSizing: 'border-box', backgroundColor: '#1a1a1a' }}
    />
  );
}

function lightenColor(hex: string | undefined, percent: number): string {
  if (!hex) return '#FFFFFF'; // Возвращаем белый цвет по умолчанию, если hex не определен
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex: string | undefined, percent: number): string {
  if (!hex) return '#000000'; // Возвращаем черный цвет по умолчанию, если hex не определен
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
