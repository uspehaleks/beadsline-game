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
import { Trophy, RefreshCw, Crown, Target, Zap, Clock, Wallet, Heart, Loader2, Coins } from 'lucide-react';
import { SiBitcoin, SiEthereum, SiTether } from 'react-icons/si';
import { motion } from 'framer-motion';
import { getEconomyConfig } from '@/lib/gameEngine';

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
  const [showVictoryDialog, setShowVictoryDialog] = useState(false);
  const { score, won, maxCombo, cryptoCollected, shotsTotal, shotsHit, timeLeft, extraLivesBought } = gameState;
  const accuracy = shotsTotal > 0 ? Math.round((shotsHit / shotsTotal) * 100) : 0;
  
  const economy = getEconomyConfig();
  const SATS_PER_BTC = 100_000_000;
  const GWEI_PER_ETH = 1_000_000_000;
  
  const earnedBtcSats = Math.round(cryptoCollected.btc * economy.cryptoRewards.btcPerBall * SATS_PER_BTC);
  const earnedEthGwei = Math.round(cryptoCollected.eth * economy.cryptoRewards.ethPerBall * GWEI_PER_ETH);
  const earnedUsdt = cryptoCollected.usdt * economy.cryptoRewards.usdtPerBall;
  
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

  useEffect(() => {
    if (won) {
      const timer = setTimeout(() => {
        setShowVictoryDialog(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [won]);

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

          {(earnedBtcSats > 0 || earnedEthGwei > 0 || earnedUsdt > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
              className="mb-6"
            >
              <div className="text-sm text-muted-foreground mb-2">Заработано крипты:</div>
              <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-muted/50" data-testid="crypto-collected-stats">
                {earnedBtcSats > 0 && <CryptoEarned type="btc" amount={earnedBtcSats} />}
                {earnedEthGwei > 0 && <CryptoEarned type="eth" amount={earnedEthGwei} />}
                {earnedUsdt > 0 && <CryptoEarned type="usdt" amount={earnedUsdt} />}
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
                {/* Score earned this game */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <div className="flex items-center justify-center gap-2 mb-1 text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-medium">Набрано за игру:</span>
                  </div>
                  <div className="font-display text-3xl font-bold text-primary tabular-nums">
                    {score.toLocaleString()} Beads
                  </div>
                </div>

                {/* Animated progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-5 bg-muted rounded-full overflow-hidden relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-[length:200%_100%]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(95, Math.max(50, 100 - (gameState.balls?.length || 10) * 1.5))}%`,
                        backgroundPosition: ['0% 0%', '100% 0%']
                      }}
                      transition={{ 
                        width: { duration: 0.8, ease: 'easeOut' },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow-md">
                        {Math.min(95, Math.max(50, 100 - (gameState.balls?.length || 10) * 1.5))}% пройдено
                      </span>
                    </div>
                  </div>
                  {gameState.balls?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Осталось: <span className="font-bold text-amber-400">{gameState.balls.length} шариков</span>
                    </div>
                  )}
                </div>

                {/* Crypto earned this game */}
                {(earnedBtcSats > 0 || earnedEthGwei > 0 || earnedUsdt > 0) && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50">
                    <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">Заработано крипты:</span>
                    </div>
                    <div className="space-y-2">
                      {earnedBtcSats > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiBitcoin className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-400 font-bold">Bitcoin:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+{earnedBtcSats} sats</span>
                        </div>
                      )}
                      {earnedEthGwei > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiEthereum className="w-5 h-5 text-purple-400" />
                            <span className="text-purple-400 font-bold">Ethereum:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+{earnedEthGwei} gwei</span>
                        </div>
                      )}
                      {earnedUsdt > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiTether className="w-5 h-5 text-green-500" />
                            <span className="text-green-400 font-bold">USDT:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+${earnedUsdt.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning - static */}
                <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-red-500/20 border border-red-500/50">
                  <span className="text-3xl">⚠️</span>
                  <span className="text-xl font-bold text-red-400">ПОТЕРЯЕТЕ ВСЁ БЕЗ ЖИЗНИ!</span>
                </div>

                {/* Life cost */}
                <div className="text-lg">
                  <span className="text-muted-foreground">💸 Стоимость жизни: </span>
                  <span className="font-bold text-amber-400">{lifeCost} Beads</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 mt-6 sm:flex-col">
            <motion.div
              animate={{ 
                opacity: [1, 0.7, 1],
                scale: [1, 1.03, 1]
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="w-full"
            >
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
            </motion.div>
            <AlertDialogCancel 
              className="w-full mt-0 h-12 text-base bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              data-testid="button-cancel-continue"
            >
              ❌ Уйти без крипты
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Victory Dialog with Confetti */}
      <AlertDialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
        <AlertDialogContent className="max-w-md p-6 border-2 border-amber-500/50 overflow-hidden">
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][i % 6],
                }}
                initial={{ top: -20, rotate: 0, opacity: 1 }}
                animate={{ 
                  top: '120%',
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ))}
          </div>

          <AlertDialogHeader className="space-y-4 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <AlertDialogTitle className="flex items-center justify-center gap-2 text-3xl text-amber-400">
              <Zap className="w-8 h-8 text-amber-400" />
              ПОБЕДА!
              <Zap className="w-8 h-8 text-amber-400" />
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="text-center space-y-4">
                {/* Score earned */}
                <motion.div 
                  className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
                    <Coins className="w-5 h-5" />
                    <span className="text-base font-medium">Заработано:</span>
                  </div>
                  <div className="font-display text-4xl font-bold text-green-400 tabular-nums">
                    +{score.toLocaleString()} Beads
                  </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-bold">{formatDuration(timeLeft)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <div className="text-sm font-bold">x{maxCombo}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-bold">{accuracy}%</div>
                  </div>
                </div>

                {/* Crypto earned this game */}
                {(earnedBtcSats > 0 || earnedEthGwei > 0 || earnedUsdt > 0) && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50">
                    <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">Заработано крипты:</span>
                    </div>
                    <div className="space-y-2">
                      {earnedBtcSats > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiBitcoin className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-400 font-bold">Bitcoin:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+{earnedBtcSats} sats</span>
                        </div>
                      )}
                      {earnedEthGwei > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiEthereum className="w-5 h-5 text-purple-400" />
                            <span className="text-purple-400 font-bold">Ethereum:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+{earnedEthGwei} gwei</span>
                        </div>
                      )}
                      {earnedUsdt > 0 && (
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <SiTether className="w-5 h-5 text-green-500" />
                            <span className="text-green-400 font-bold">USDT:</span>
                          </div>
                          <span className="font-mono text-foreground font-semibold">+${earnedUsdt.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-3 mt-6 sm:flex-col relative z-10">
            <AlertDialogAction
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-14 text-lg rounded-xl shadow-lg shadow-amber-500/30 border-2 border-amber-400"
              onClick={onPlayAgain}
              data-testid="button-victory-play-again"
            >
              <RefreshCw className="w-6 h-6 mr-2" />
              ИГРАТЬ СНОВА
            </AlertDialogAction>
            <AlertDialogCancel 
              className="w-full mt-0 h-12 text-base"
              onClick={onMainMenu}
              data-testid="button-victory-main-menu"
            >
              Главное меню
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

interface CryptoEarnedProps {
  type: 'btc' | 'eth' | 'usdt';
  amount: number;
}

function CryptoEarned({ type, amount }: CryptoEarnedProps) {
  const config = {
    btc: { icon: <SiBitcoin className="w-5 h-5 text-orange-500" />, unit: 'sats' },
    eth: { icon: <SiEthereum className="w-5 h-5 text-purple-400" />, unit: 'gwei' },
    usdt: { icon: <SiTether className="w-5 h-5 text-green-500" />, unit: '$' },
  };

  const { icon, unit } = config[type];
  const formatted = type === 'usdt' ? `$${amount.toFixed(2)}` : `${amount} ${unit}`;

  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="font-semibold tabular-nums text-sm">{formatted}</span>
    </div>
  );
}

interface CryptoBalanceProps {
  type: 'btc' | 'eth' | 'usdt';
  amount: number;
}

function CryptoBalance({ type, amount }: CryptoBalanceProps) {
  const icons = {
    btc: <SiBitcoin className="w-4 h-4 text-orange-500" />,
    eth: <SiEthereum className="w-4 h-4 text-purple-400" />,
    usdt: <SiTether className="w-4 h-4 text-green-500" />,
  };

  const formatAmount = () => {
    if (type === 'btc') {
      return `${amount} sat`;
    } else if (type === 'eth') {
      const gwei = Math.floor(amount / 1000000000);
      return `${gwei} gwei`;
    } else {
      return `$${Number(amount).toFixed(2)}`;
    }
  };

  return (
    <div className="flex items-center gap-1" data-testid={`balance-${type}`}>
      {icons[type]}
      <span className="text-sm font-medium tabular-nums">{formatAmount()}</span>
    </div>
  );
}
