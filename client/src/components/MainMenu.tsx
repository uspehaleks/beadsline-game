import type { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Trophy, Gamepad2, Star, TrendingUp, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface MainMenuProps {
  user: User | null;
  onPlay: () => void;
  onLeaderboard: () => void;
  isLoading?: boolean;
}

export function MainMenu({ user, onPlay, onLeaderboard, isLoading }: MainMenuProps) {
  const { data: activePlayers } = useQuery<{ count: number }>({
    queryKey: ["/api/active-players"],
    refetchInterval: 10000,
  });

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
      </motion.div>

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
    btc: { symbol: '\u20BF', color: 'bg-crypto-btc', points: '+500' },
    eth: { symbol: '\u039E', color: 'bg-crypto-eth', points: '+300' },
    usdt: { symbol: '\u20AE', color: 'bg-crypto-usdt', points: '+200' },
  };

  const { symbol, color, points } = config[type];

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shadow-lg`}
        style={{ boxShadow: `0 0 15px ${type === 'btc' ? '#f7931a' : type === 'eth' ? '#627eea' : '#26a17b'}40` }}
      >
        <span className="text-white font-bold">{symbol}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-primary">{points}</span>
    </div>
  );
}
