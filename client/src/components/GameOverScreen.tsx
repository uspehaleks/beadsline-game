import { useState, useEffect } from 'react';
import type { GameState, User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trophy, RefreshCw, Crown, Target, Zap, Clock, Wallet, Heart, Loader2 } from 'lucide-react';
import { SiEthereum } from 'react-icons/si';
import { motion } from 'framer-motion';

interface GameOverScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onMainMenu: () => void;
  onContinue?: () => void;
  user: User | null;
  lifeCost?: number;
  maxExtraLives?: number;
  isBuyingLife?: boolean;
}

export function GameOverScreen({
  gameState,
  onPlayAgain,
  onViewLeaderboard,
  onMainMenu,
  onContinue,
  user,
  lifeCost = 50,
  maxExtraLives = 5,
  isBuyingLife = false,
}: GameOverScreenProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasAutoShown, setHasAutoShown] = useState(false);
  const { score, won, maxCombo, cryptoCollected, shotsTotal, shotsHit, timeLeft, extraLivesBought } = gameState;
  const accuracy = shotsTotal > 0 ? Math.round((shotsHit / shotsTotal) * 100) : 0;
  
  const canContinue = !won && 
    onContinue && 
    extraLivesBought < maxExtraLives && 
    (user?.totalPoints || 0) >= lifeCost;

  useEffect(() => {
    if (canContinue && !hasAutoShown) {
      const timer = setTimeout(() => {
        setShowConfirmDialog(true);
        setHasAutoShown(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [canContinue, hasAutoShown]);

  const handleContinueClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirmDialog(false);
    if (onContinue) {
      onContinue();
    }
  };
  
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
            className="text-muted-foreground mb-4"
          >
            {won ? 'Отличный результат!' : 'Повезёт в следующий раз!'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="font-display text-5xl font-bold text-primary tabular-nums mb-2" data-testid="text-final-score">
              {score.toLocaleString()}
            </div>
            {won ? (
              <div className="text-sm text-green-500 font-medium">
                +{score.toLocaleString()} Beads начислено!
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Beads начисляются только при победе
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <StatCard icon={<Clock className="w-4 h-4" />} label="Время" value={formatDuration(timeLeft)} />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Комбо" value={`x${maxCombo}`} />
            <StatCard icon={<Target className="w-4 h-4" />} label="Точность" value={`${accuracy}%`} />
          </motion.div>

          {(cryptoCollected.btc > 0 || cryptoCollected.eth > 0 || cryptoCollected.usdt > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
              className="mb-6"
            >
              <div className="text-sm text-muted-foreground mb-2">Собрано крипто-шариков:</div>
              <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-muted/50" data-testid="crypto-collected-stats">
                {cryptoCollected.btc > 0 && <CryptoStat type="btc" count={cryptoCollected.btc} />}
                {cryptoCollected.eth > 0 && <CryptoStat type="eth" count={cryptoCollected.eth} />}
                {cryptoCollected.usdt > 0 && <CryptoStat type="usdt" count={cryptoCollected.usdt} />}
              </div>
            </motion.div>
          )}

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
            {!won && onContinue && (
              <Button
                size="lg"
                className="w-full font-display text-lg bg-green-600 hover:bg-green-700"
                onClick={handleContinueClick}
                disabled={!canContinue || isBuyingLife}
                data-testid="button-continue-game"
              >
                {isBuyingLife ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5 mr-2" />
                )}
                Продолжить за {lifeCost} Beads
              </Button>
            )}
            {!won && onContinue && extraLivesBought >= maxExtraLives && (
              <div className="text-xs text-muted-foreground">
                Достигнут лимит покупок ({maxExtraLives})
              </div>
            )}
            {!won && onContinue && (user?.totalPoints || 0) < lifeCost && extraLivesBought < maxExtraLives && (
              <div className="text-xs text-muted-foreground">
                Недостаточно Beads (нужно {lifeCost})
              </div>
            )}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md p-6 border-2 border-amber-500/50">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="flex items-center justify-center gap-2 text-2xl text-amber-400">
              <Target className="w-8 h-8" />
              ВЫ ПОЧТИ У ЦЕЛИ!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(95, Math.max(60, 100 - (gameState.ballsRemaining || 10) * 2))}%` }}
                    />
                  </div>
                  <div className="text-lg font-bold text-amber-400">
                    {Math.min(95, Math.max(60, 100 - (gameState.ballsRemaining || 10) * 2))}%
                  </div>
                </div>

                {/* Crypto balance */}
                {user && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50">
                    <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">Ваш баланс:</span>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-crypto-btc font-bold">🟠 Bitcoin:</span>
                        <span className="font-mono text-foreground">{(user.btcBalance || 0).toFixed(8)} BTC</span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-crypto-eth font-bold">🟣 Ethereum:</span>
                        <span className="font-mono text-foreground">{(user.ethBalance || 0).toFixed(6)} ETH</span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-crypto-usdt font-bold">🟢 USDT:</span>
                        <span className="font-mono text-foreground">{Number(user.usdtBalance || 0).toFixed(2)} USDT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="flex items-center justify-center gap-2 text-red-400 font-semibold">
                  <span className="text-xl">⚠️</span>
                  <span>Потеряете всё без жизни!</span>
                </div>

                {/* Life cost */}
                <div className="text-lg">
                  <span className="text-muted-foreground">💸 Жизнь: </span>
                  <span className="font-bold text-foreground">{lifeCost} Beads</span>
                </div>

                {/* Balls remaining */}
                {gameState.ballsRemaining !== undefined && gameState.ballsRemaining > 0 && (
                  <div className="text-lg">
                    <span className="text-muted-foreground">⏰ Осталось: </span>
                    <span className="font-bold text-amber-400">{gameState.ballsRemaining} шарика</span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 mt-6 sm:flex-col">
            <AlertDialogAction
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-14 text-lg rounded-xl shadow-lg shadow-amber-500/30 border-2 border-amber-400"
              onClick={handleConfirmContinue}
              disabled={isBuyingLife}
              data-testid="button-confirm-continue"
            >
              {isBuyingLife ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Zap className="w-6 h-6 mr-2" />
              )}
              КУПИТЬ ЖИЗНЬ ({lifeCost} BEADS)
            </AlertDialogAction>
            <AlertDialogCancel 
              className="w-full mt-0 h-12 text-base bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              data-testid="button-cancel-continue"
            >
              ❌ Уйти без крипты
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    eth: { symbol: null, color: 'text-crypto-eth', icon: true },
    usdt: { symbol: '₮', color: 'text-crypto-usdt' },
  };

  const { symbol, color, icon } = config[type] as { symbol: string | null; color: string; icon?: boolean };

  return (
    <div className="flex items-center gap-1.5">
      {icon ? (
        <SiEthereum className={`w-5 h-5 ${color}`} />
      ) : (
        <span className={`font-bold text-lg ${color}`}>{symbol}</span>
      )}
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
    btc: { symbol: '₿', color: 'text-crypto-btc', unit: 'sat', icon: false },
    eth: { symbol: null, color: 'text-crypto-eth', unit: 'gwei', icon: true },
    usdt: { symbol: '₮', color: 'text-crypto-usdt', unit: '', icon: false },
  };

  const { symbol, color, unit, icon } = config[type];

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
      {icon ? (
        <SiEthereum className={`w-4 h-4 ${color}`} />
      ) : (
        <span className={`font-bold ${color}`}>{symbol}</span>
      )}
      <span className="text-sm font-medium tabular-nums">{formatAmount()}</span>
    </div>
  );
}
