import type { GameState } from '@shared/schema';
import { Clock, Zap, Circle } from 'lucide-react';
import { getEconomyConfig } from '@/lib/gameEngine';

interface GameHUDProps {
  gameState: GameState;
  elapsedTime: number;
  ballsOnScreen: number;
  ballsRemaining: number;
  totalBalls: number;
}

export function GameHUD({ gameState, elapsedTime, ballsOnScreen, ballsRemaining, totalBalls }: GameHUDProps) {
  const { score, combo, cryptoCollected } = gameState;
  
  const economy = getEconomyConfig();
  const SATS_PER_BTC = 100_000_000;
  const WEI_PER_ETH = 1_000_000_000;
  
  const btcSats = Math.round(cryptoCollected.btc * economy.cryptoRewards.btcPerBall * SATS_PER_BTC);
  const ethWei = Math.round(cryptoCollected.eth * economy.cryptoRewards.ethPerBall * WEI_PER_ETH);
  const usdtAmount = cryptoCollected.usdt * economy.cryptoRewards.usdtPerBall;

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

      <div className="flex items-center justify-center gap-3 mt-2 backdrop-blur-md bg-background/60 rounded-lg px-3 py-1.5 border border-border/30">
        <CryptoRewardCounter type="btc" value={btcSats} unit="sats" />
        <CryptoRewardCounter type="eth" value={ethWei} unit="gwei" />
        <CryptoRewardCounter type="usdt" value={usdtAmount} unit="$" />
      </div>
    </div>
  );
}

interface CryptoRewardCounterProps {
  type: 'btc' | 'eth' | 'usdt';
  value: number;
  unit: string;
}

function CryptoRewardCounter({ type, value, unit }: CryptoRewardCounterProps) {
  const config = {
    btc: { symbol: '₿', color: 'text-[#f7931a]', bgColor: 'bg-[#f7931a]/10' },
    eth: { symbol: 'Ξ', color: 'text-[#627eea]', bgColor: 'bg-[#627eea]/10' },
    usdt: { symbol: '₮', color: 'text-[#26a17b]', bgColor: 'bg-[#26a17b]/10' },
  };

  const { symbol, color, bgColor } = config[type];
  
  const displayValue = type === 'usdt' 
    ? (value > 0 ? `$${value.toFixed(2)}` : '$0')
    : `${value} ${unit}`;

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bgColor}`}
      data-testid={`crypto-reward-${type}`}
    >
      <span className={`font-bold text-sm ${color}`}>{symbol}</span>
      <span className="font-semibold text-xs tabular-nums text-foreground">
        {displayValue}
      </span>
    </div>
  );
}
