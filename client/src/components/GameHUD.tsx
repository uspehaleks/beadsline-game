import type { GameState } from '@shared/schema';
import { Clock, Zap, Circle, Heart, Plus, Loader2, Timer, Bomb, Sparkles, RotateCcw, Shield, Magnet, Crosshair, Ticket } from 'lucide-react';
import { getEconomyConfig, getBoostState } from '@/lib/gameEngine';
import { Button } from '@/components/ui/button';
import type { BoostType } from '@/lib/gameEngine';

export interface BoostInventoryItem {
  boostType: BoostType;
  quantity: number;
}

interface GameHUDProps {
  gameState: GameState;
  elapsedTime: number;
  ballsOnScreen: number;
  ballsRemaining: number;
  totalBalls: number;
  userBeads: number;
  lifeCost: number;
  maxExtraLives: number;
  onBuyLife: () => void;
  isBuyingLife: boolean;
  boostInventory?: BoostInventoryItem[];
  onUseBoost?: (boostType: BoostType) => void;
  isUsingBoost?: boolean;
  bonusLives?: number;
  useCryptoTicket?: boolean;
}

export function GameHUD({ 
  gameState, 
  elapsedTime, 
  ballsOnScreen, 
  ballsRemaining, 
  totalBalls,
  userBeads,
  lifeCost,
  maxExtraLives,
  onBuyLife,
  isBuyingLife,
  boostInventory = [],
  onUseBoost,
  isUsingBoost = false,
  bonusLives = 0,
  useCryptoTicket = false,
}: GameHUDProps) {
  const { score, combo, cryptoCollected, lives, extraLivesBought } = gameState;
  const canBuyLife = userBeads >= lifeCost && extraLivesBought < maxExtraLives;
  const boostState = getBoostState();
  
  const economy = getEconomyConfig();
  const SATS_PER_BTC = 100_000_000;
  const WEI_PER_ETH = 1_000_000_000_000_000_000; // 10^18
  
  const btcSats = Math.round(cryptoCollected.btc * economy.cryptoRewards.btcPerBall * SATS_PER_BTC);
  const ethWei = Math.round(cryptoCollected.eth * economy.cryptoRewards.ethPerBall * WEI_PER_ETH);
  const usdtAmount = cryptoCollected.usdt * economy.cryptoRewards.usdtPerBall;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3">
        <div className="flex items-center justify-between gap-4 backdrop-blur-md bg-background/80 rounded-lg px-4 py-3 border border-border/50">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-display font-bold text-lg tabular-nums" data-testid="text-timer">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              {/* Crypto ticket indicator */}
              {useCryptoTicket && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40">
                  <Ticket className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">КРИПТО</span>
                </div>
              )}
              <div className="flex items-center gap-1" data-testid="lives-display">
                {/* Стандартные 3 жизни */}
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={`base-${i}`}
                    className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`}
                  />
                ))}
                {/* Бонусные жизни из BEADS BOX - изумрудные сердца */}
                {bonusLives > 0 && [...Array(bonusLives)].map((_, i) => (
                  <Heart
                    key={`bonus-${i}`}
                    className="w-4 h-4 text-emerald-400 fill-emerald-400"
                  />
                ))}
                {extraLivesBought > 0 && (
                  <span className="text-xs text-green-500 font-bold">+{extraLivesBought}</span>
                )}
                <Button
                  size="sm"
                  variant={canBuyLife ? "default" : "outline"}
                  onClick={onBuyLife}
                  disabled={!canBuyLife || isBuyingLife}
                  className={`h-6 px-2 ml-1 text-xs ${!canBuyLife ? 'opacity-50' : ''}`}
                  data-testid="button-buy-life"
                >
                  {isBuyingLife ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-0.5" />
                      {lifeCost}
                    </>
                  )}
                </Button>
              </div>
            </div>
            {boostInventory.length > 0 && (
              <div className="flex items-center gap-1">
                {boostInventory.map((item) => (
                  <BoostButton
                    key={item.boostType}
                    boostType={item.boostType}
                    quantity={item.quantity}
                    onUse={() => onUseBoost?.(item.boostType)}
                    disabled={isUsingBoost || item.quantity <= 0}
                    isActive={
                      (item.boostType === 'slowdown' && boostState.slowdownActive) ||
                      (item.boostType === 'rainbow' && boostState.rainbowActive) ||
                      (item.boostType === 'bomb' && boostState.pendingBomb) ||
                      (item.boostType === 'rewind' && boostState.pendingRewind) ||
                      (item.boostType === 'shield' && boostState.shieldActive) ||
                      (item.boostType === 'magnet' && boostState.magnetActive) ||
                      (item.boostType === 'laser' && boostState.pendingLaser)
                    }
                  />
                ))}
              </div>
            )}
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
      </div>

    </>
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
    ? (value > 0 ? `$${value.toFixed(4)}` : '$0')
    : type === 'eth' ? `${value.toFixed(2)} ${unit}` : `${value} ${unit}`;

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

interface BoostButtonProps {
  boostType: BoostType;
  quantity: number;
  onUse: () => void;
  disabled: boolean;
  isActive: boolean;
}

const BOOST_CONFIG: Record<BoostType, { icon: typeof Timer; color: string; bgColor: string; label: string }> = {
  slowdown: { icon: Timer, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Замедление' },
  bomb: { icon: Bomb, color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Бомба' },
  rainbow: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Радуга' },
  rewind: { icon: RotateCcw, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Откат' },
  shield: { icon: Shield, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Щит' },
  magnet: { icon: Magnet, color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: 'Магнит' },
  laser: { icon: Crosshair, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Лазер' },
};

function BoostButton({ boostType, quantity, onUse, disabled, isActive }: BoostButtonProps) {
  const config = BOOST_CONFIG[boostType];
  const Icon = config.icon;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onUse}
      disabled={disabled}
      className={`relative h-10 px-3 ${config.bgColor} ${isActive ? 'ring-2 ring-primary animate-pulse' : ''} ${disabled ? 'opacity-40' : 'hover-elevate'}`}
      data-testid={`button-boost-${boostType}`}
    >
      <Icon className={`w-5 h-5 ${config.color}`} />
      {quantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {quantity}
        </span>
      )}
    </Button>
  );
}
