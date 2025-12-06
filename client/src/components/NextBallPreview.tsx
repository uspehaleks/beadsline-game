import type { Ball } from '@shared/schema';
import { BALL_COLOR_MAP, CRYPTO_COLOR_MAP, CRYPTO_SYMBOL_MAP } from '@/lib/gameEngine';

interface NextBallPreviewProps {
  ball: Ball | null;
}

export function NextBallPreview({ ball }: NextBallPreviewProps) {
  if (!ball) return null;

  const baseColor = BALL_COLOR_MAP[ball.color];

  const isSpecial = ball.isUsdtFund || ball.crypto;
  const glowColor = ball.isUsdtFund ? '#FFD700' : (ball.crypto ? CRYPTO_COLOR_MAP[ball.crypto] : undefined);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">Next</span>
      <div 
        className="relative w-10 h-10 rounded-full flex items-center justify-center border-2"
        style={{ 
          backgroundColor: baseColor,
          borderColor: darkenColor(baseColor, 20),
          boxShadow: isSpecial ? `0 0 12px ${glowColor}, 0 0 4px ${glowColor}` : undefined,
        }}
        data-testid="next-ball-preview"
      >
        {ball.isUsdtFund ? (
          <span className="font-bold text-lg" style={{ color: '#FFD700', textShadow: '0 0 4px #FFD700' }}>$</span>
        ) : ball.crypto ? (
          <span className="text-white font-bold text-sm" style={{ textShadow: `0 0 4px ${CRYPTO_COLOR_MAP[ball.crypto]}` }}>
            {CRYPTO_SYMBOL_MAP[ball.crypto]}
          </span>
        ) : null}
        <div 
          className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/40"
        />
      </div>
    </div>
  );
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
