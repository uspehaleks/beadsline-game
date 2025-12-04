import type { GameState } from '@shared/schema';
import { Clock, Zap, Target, Circle } from 'lucide-react';

interface GameHUDProps {
  gameState: GameState;
  elapsedTime: number;
  ballsOnScreen: number;
  ballsRemaining: number;
  totalBalls: number;
}

export function GameHUD({ gameState, elapsedTime, ballsOnScreen, ballsRemaining, totalBalls }: GameHUDProps) {
  const { score, combo, cryptoCollected } = gameState;
  const accuracy = gameState.shotsTotal > 0 
    ? Math.round((gameState.shotsHit / gameState.shotsTotal) * 100) 
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between gap-4 backdrop-blur-md bg-background/80 rounded-lg px-4 py-3 border border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-display font-bold text-lg tabular-nums" data-testid="text-timer">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Beads</span>
          <span className="font-display font-bold text-2xl text-primary tabular-nums" data-testid="text-score">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div className="flex items-center gap-1 text-amber-400 animate-pulse">
              <Zap className="w-4 h-4" />
              <span className="font-display font-bold text-lg" data-testid="text-combo">
                x{combo}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Circle className="w-4 h-4" />
            <span className="font-semibold text-sm tabular-nums" data-testid="text-balls">
              {ballsOnScreen}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        <CryptoCounter type="btc" count={cryptoCollected.btc} />
        <CryptoCounter type="eth" count={cryptoCollected.eth} />
        <CryptoCounter type="usdt" count={cryptoCollected.usdt} />
      </div>
    </div>
  );
}

interface CryptoCounterProps {
  type: 'btc' | 'eth' | 'usdt';
  count: number;
}

function CryptoCounter({ type, count }: CryptoCounterProps) {
  const config = {
    btc: { symbol: '₿', color: 'text-crypto-btc' },
    eth: { symbol: 'Ξ', color: 'text-crypto-eth' },
    usdt: { symbol: '₮', color: 'text-crypto-usdt' },
  };

  const { symbol, color } = config[type];

  return (
    <div 
      className="flex items-center gap-1"
      data-testid={`crypto-counter-${type}`}
    >
      <span className={`font-bold text-lg ${color}`}>{symbol}</span>
      <span className="font-semibold text-base tabular-nums text-foreground">{count}</span>
    </div>
  );
}
