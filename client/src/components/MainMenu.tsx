import { useState } from 'react';
import type { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Trophy, Gamepad2, Star, TrendingUp, Settings, Users, Gift, Copy, Check, X, Bitcoin } from 'lucide-react';
import { SiEthereum, SiTether } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface MainMenuProps {
  user: User | null;
  onPlay: () => void;
  onLeaderboard: () => void;
  isLoading?: boolean;
}

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  directReferralsCount: number;
  totalEarnedBeads: number;
}

export function MainMenu({ user, onPlay, onLeaderboard, isLoading }: MainMenuProps) {
  const [showReferral, setShowReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: activePlayers } = useQuery<{ count: number }>({
    queryKey: ["/api/active-players"],
    refetchInterval: 10000,
  });

  const { data: referralInfo } = useQuery<ReferralInfo>({
    queryKey: ["/api/referral"],
    enabled: !!user && !user.username?.startsWith('guest_'),
  });

  const copyReferralLink = async () => {
    if (!referralInfo?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralInfo.referralLink);
      setCopied(true);
      toast({
        title: "Ссылка скопирована!",
        description: "Отправьте её друзьям",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Gamepad2 className="w-12 h-12 text-primary" />
          </motion.div>
        </div>
        <h1 
          className="font-display text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent"
          data-testid="text-title"
        >
          Beads Line
        </h1>
        <p className="text-muted-foreground mt-2">
          Собирай шарики, лови крипту, покоряй рейтинг!
        </p>
        {activePlayers && activePlayers.count > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-sm"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium" data-testid="text-online-players">
              Сейчас играют: {activePlayers.count}
            </span>
          </motion.div>
        )}
      </motion.div>

      {user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarImage src={user.photoUrl || undefined} alt={user.username} />
                <AvatarFallback className="bg-primary/20 text-primary font-display text-lg">
                  {user.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg" data-testid="text-username">
                  {user.firstName || user.username}
                </h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold tabular-nums" data-testid="text-total-points">
                    {user.totalPoints.toLocaleString()} Beads
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t flex-wrap">
              <div className="flex flex-col items-center px-2 py-1 rounded bg-amber-500/10">
                <div className="flex items-center gap-1">
                  <Bitcoin className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 tabular-nums" data-testid="text-btc-balance">
                    {(Number(user.btcBalanceSats) || 0).toLocaleString()} сат
                  </span>
                </div>
                <span className="text-xs text-amber-500/70">
                  ≈ {(user.btcBalance || 0).toFixed(8)} BTC
                </span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 rounded bg-blue-500/10">
                <div className="flex items-center gap-1">
                  <SiEthereum className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 tabular-nums" data-testid="text-eth-balance">
                    {(Number(user.ethBalanceWei) || 0).toLocaleString()} gwei
                  </span>
                </div>
                <span className="text-xs text-blue-500/70">
                  ≈ {(user.ethBalance || 0).toFixed(8)} ETH
                </span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 rounded bg-green-500/10">
                <div className="flex items-center gap-1">
                  <SiTether className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 tabular-nums" data-testid="text-usdt-balance">
                    ${(user.usdtBalance || 0).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs text-green-500/70">USDT</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm mb-8"
        >
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Игры</div>
                <div className="font-display font-bold text-xl tabular-nums" data-testid="text-games-played">
                  {user.gamesPlayed}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Лучший</div>
                <div className="font-display font-bold text-xl text-primary tabular-nums" data-testid="text-best-score">
                  {user.bestScore.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Ранг</div>
                <div className="font-display font-bold text-xl text-amber-400 tabular-nums flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  --
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <Button
          size="lg"
          className="w-full h-16 font-display text-xl"
          onClick={onPlay}
          disabled={isLoading}
          data-testid="button-play"
        >
          <Play className="w-6 h-6 mr-2 fill-current" />
          Играть
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full font-display"
          onClick={onLeaderboard}
          data-testid="button-leaderboard"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Рейтинг
        </Button>

        {user?.isAdmin && (
          <Link href="/admin">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-display"
              data-testid="button-admin"
            >
              <Settings className="w-5 h-5 mr-2" />
              Админ-панель
            </Button>
          </Link>
        )}

        {referralInfo && (
          <Button
            variant="outline"
            size="lg"
            className="w-full font-display"
            onClick={() => setShowReferral(!showReferral)}
            data-testid="button-referral"
          >
            <Gift className="w-5 h-5 mr-2" />
            Пригласить друзей
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {showReferral && referralInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="w-full max-w-sm overflow-hidden"
          >
            <Card className="p-4 relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => setShowReferral(false)}
                data-testid="button-close-referral"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="mb-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Реферальная программа
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Зови друзей — прокачивайся быстрее.<br/>
                  1 уровень: твой друг фармит Beads — ты получаешь 10% его игровых Beads бонусом.<br/>
                  2 уровень: друзья твоего друга играют — ты дополнительно получаешь 3% их Beads.<br/>
                  Все начисления только в Beads внутри игры, без сложных условий и скрытых правил.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Твоя ссылка:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background rounded px-2 py-1.5 truncate" data-testid="text-referral-link">
                      {referralInfo.referralLink}
                    </code>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="shrink-0"
                      onClick={copyReferralLink}
                      data-testid="button-copy-referral"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Рефералов</div>
                    <div className="font-display font-bold text-lg" data-testid="text-referrals-count">
                      {referralInfo.directReferralsCount}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Заработано</div>
                    <div className="font-display font-bold text-lg text-primary" data-testid="text-referral-rewards">
                      {referralInfo.totalEarnedBeads.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-6"
      >
        <CryptoBadge type="btc" label="BTC" />
        <CryptoBadge type="eth" label="ETH" />
        <CryptoBadge type="usdt" label="USDT" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-xs text-muted-foreground text-center"
      >
        Собирай крипто-шарики для бонусных Beads!
      </motion.p>
    </div>
  );
}

interface CryptoBadgeProps {
  type: 'btc' | 'eth' | 'usdt';
  label: string;
}

function CryptoBadge({ type, label }: CryptoBadgeProps) {
  const config = {
    btc: { symbol: '₿', color: 'bg-crypto-btc', textColor: 'text-crypto-btc', points: '+500' },
    eth: { symbol: 'Ξ', color: 'bg-crypto-eth', textColor: 'text-crypto-eth', points: '+300' },
    usdt: { symbol: '₮', color: 'bg-crypto-usdt', textColor: 'text-crypto-usdt', points: '+200' },
  };

  const { symbol, color, textColor, points } = config[type];

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shadow-lg`}
        style={{ boxShadow: `0 0 15px ${type === 'btc' ? '#f7931a' : type === 'eth' ? '#627eea' : '#26a17b'}40` }}
      >
        <span className="text-white font-bold text-lg">{symbol}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-primary">{points}</span>
    </div>
  );
}
