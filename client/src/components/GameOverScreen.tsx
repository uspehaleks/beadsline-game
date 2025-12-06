import type { GameState, User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RefreshCw, Crown, Target, Zap, Clock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameOverScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
  user: User | null;
}

export function GameOverScreen({
  gameState,
  onPlayAgain,
  onViewLeaderboard,
  onMainMenu,
  user,
}: GameOverScreenProps) {
  const { score, won, maxCombo, cryptoCollected, shotsTotal, shotsHit, timeLeft } = gameState;
  const accuracy = shotsTotal > 0 ? Math.round((shotsHit / shotsTotal) * 100) : 0;
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Card className="w-full max-w-sm p-8 text-center bg-card border-border">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            {won ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl font-bold mb-2"
            data-testid="text-game-result"
          >
            {won ? 'Победа!' : 'Игра окончена'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground mb-6"
          >
            {won ? 'Отличный результат!' : 'Повезёт в следующий раз!'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="font-display text-5xl font-bold text-primary mb-8 tabular-nums"
            data-testid="text-final-score"
          >
            {score.toLocaleString()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <StatCard icon={<Clock className="w-4 h-4" />} label="Время" value={formatDuration(timeLeft)} />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Комбо" value={`x${maxCombo}`} />
            <StatCard icon={<Target className="w-4 h-4" />} label="Точность" value={`${accuracy}%`} />
            <div className="col-span-3">
              <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/50">
                <CryptoStat type="btc" count={cryptoCollected.btc} />
                <CryptoStat type="eth" count={cryptoCollected.eth} />
                <CryptoStat type="usdt" count={cryptoCollected.usdt} />
              </div>
            </div>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Ваш баланс</span>
              </div>
              <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <CryptoBalance type="btc" amount={user.btcBalanceSats || 0} />
                <CryptoBalance type="eth" amount={user.ethBalanceWei || 0} />
                <CryptoBalance type="usdt" amount={user.usdtBalance || 0} />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            <Button
              size="lg"
              className="w-full font-display text-lg"
              onClick={onPlayAgain}
              data-testid="button-play-again"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Играть снова
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full font-display"
              onClick={onViewLeaderboard}
              data-testid="button-view-leaderboard"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Рейтинг
            </Button>
            <Button
              variant="ghost"
              onClick={onMainMenu}
              data-testid="button-main-menu"
            >
              Главное меню
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

interface CryptoStatProps {
  type: 'btc' | 'eth' | 'usdt';
  count: number;
}

function CryptoStat({ type, count }: CryptoStatProps) {
  const config = {
    btc: { symbol: '₿', color: 'text-crypto-btc' },
    eth: { symbol: 'Ξ', color: 'text-crypto-eth' },
    usdt: { symbol: '₮', color: 'text-crypto-usdt' },
  };

  const { symbol, color } = config[type];

  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-bold text-lg ${color}`}>{symbol}</span>
      <span className="font-semibold tabular-nums">{count}</span>
    </div>
  );
}

interface CryptoBalanceProps {
  type: 'btc' | 'eth' | 'usdt';
  amount: number;
}

function CryptoBalance({ type, amount }: CryptoBalanceProps) {
  const config = {
    btc: { symbol: '₿', color: 'text-crypto-btc', unit: 'sat' },
    eth: { symbol: 'Ξ', color: 'text-crypto-eth', unit: 'gwei' },
    usdt: { symbol: '₮', color: 'text-crypto-usdt', unit: '' },
  };

  const { symbol, color, unit } = config[type];

  const formatAmount = () => {
    if (type === 'btc') {
      return `${amount} ${unit}`;
    } else if (type === 'eth') {
      const gwei = Math.floor(amount / 1000000000);
      return `${gwei} ${unit}`;
    } else {
      return `$${Number(amount).toFixed(2)}`;
    }
  };

  return (
    <div className="flex items-center gap-1" data-testid={`balance-${type}`}>
      <span className={`font-bold ${color}`}>{symbol}</span>
      <span className="text-sm font-medium tabular-nums">{formatAmount()}</span>
    </div>
  );
}
