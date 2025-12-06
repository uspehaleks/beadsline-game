import { useRef, useEffect, useCallback } from 'react';
import type { Ball, GameState } from '@shared/schema';
import {
  BALL_COLOR_MAP,
  CRYPTO_COLOR_MAP,
  CRYPTO_SYMBOL_MAP,
  BALL_RADIUS,
  type PathPoint,
} from '@/lib/gameEngine';

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

  const portalAnimationRef = useRef(0);
  
  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    if (path.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.lineWidth = BALL_RADIUS * 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.lineWidth = BALL_RADIUS * 3;
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    portalAnimationRef.current = (portalAnimationRef.current + 0.05) % (Math.PI * 4);
    
    if (path.length > 0) {
      const startPoint = path[0];
      const spawnPulse = 1 + Math.sin(portalAnimationRef.current * 1.5) * 0.2;
      const spawnRadius = BALL_RADIUS * 2.5 * spawnPulse;
      
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
      const portalRadius = BALL_RADIUS * 2 * pulseScale;
      
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
  }, [path]);

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball, isShooter: boolean = false) => {
    const progress = ball.pathProgress || 0;
    
    if (progress < -0.03) return;
    
    const spawnOpacity = progress < 0 ? Math.max(0, 1 + (progress / 0.03)) : 1;
    
    const baseColor = ball.crypto ? CRYPTO_COLOR_MAP[ball.crypto] : BALL_COLOR_MAP[ball.color];
    
    const rollAngle = progress * Math.PI * 20;
    
    ctx.save();
    ctx.globalAlpha = spawnOpacity;
    ctx.translate(ball.x, ball.y);
    
    if (ball.isUsdtFund) {
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20 * pulse;
      
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(Date.now() * 0.01) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (ball.crypto) {
      ctx.shadowColor = CRYPTO_COLOR_MAP[ball.crypto];
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS + 3, 0, Math.PI * 2);
      ctx.strokeStyle = CRYPTO_COLOR_MAP[ball.crypto];
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    const gradient = ctx.createRadialGradient(
      -BALL_RADIUS * 0.3,
      -BALL_RADIUS * 0.3,
      0,
      0,
      0,
      BALL_RADIUS
    );
    
    gradient.addColorStop(0, lightenColor(baseColor, 40));
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, darkenColor(baseColor, 20));
    
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = darkenColor(baseColor, 30);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    if (!isShooter) {
      ctx.rotate(rollAngle);
      
      ctx.beginPath();
      ctx.arc(0, -BALL_RADIUS * 0.5, BALL_RADIUS * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(0, BALL_RADIUS * 0.5, BALL_RADIUS * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fill();
      
      ctx.rotate(-rollAngle);
    }
    
    if (ball.isUsdtFund) {
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold ${BALL_RADIUS * 1.1}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${BALL_RADIUS * 1.0}px Inter, sans-serif`;
      ctx.fillText('$', 0, 0);
    } else if (ball.crypto) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${BALL_RADIUS}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(CRYPTO_SYMBOL_MAP[ball.crypto], 0, 0);
    }
    
    ctx.beginPath();
    ctx.arc(
      -BALL_RADIUS * 0.35,
      -BALL_RADIUS * 0.35,
      BALL_RADIUS * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    
    ctx.restore();
  }, []);

  const drawShooter = useCallback((ctx: CanvasRenderingContext2D) => {
    const { x, y } = shooterPosition;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(shooterAngle);
    
    const shooterGradient = ctx.createLinearGradient(0, -15, 50, -15);
    shooterGradient.addColorStop(0, '#6366f1');
    shooterGradient.addColorStop(1, '#8b5cf6');
    
    ctx.beginPath();
    ctx.roundRect(-10, -15, 60, 30, 5);
    ctx.fillStyle = shooterGradient;
    ctx.fill();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    const baseGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    baseGradient.addColorStop(0, '#818cf8');
    baseGradient.addColorStop(1, '#4f46e5');
    ctx.fillStyle = baseGradient;
    ctx.fill();
    ctx.strokeStyle = '#3730a3';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    if (gameState.shooterBall) {
      drawBall(ctx, { ...gameState.shooterBall, x, y }, true);
    }
    
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
  }, [shooterPosition, shooterAngle, gameState.shooterBall, drawBall]);

  const drawProjectile = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!projectile) return;
    drawBall(ctx, { ...projectile.ball, x: projectile.x, y: projectile.y });
  }, [projectile, drawBall]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    drawPath(ctx);
    
    for (const ball of gameState.balls) {
      drawBall(ctx, ball);
    }
    
    drawProjectile(ctx);
    
    drawShooter(ctx);
    
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [width, height, gameState.balls, drawPath, drawBall, drawProjectile, drawShooter]);

  useEffect(() => {
    draw();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

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
    />
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
