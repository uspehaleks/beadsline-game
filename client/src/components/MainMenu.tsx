import { useState } from 'react';
import type { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Play, Trophy, Settings, Users, Gift, Copy, Check, X, Bitcoin, Award, ChevronRight, Medal, Target, Gamepad2 } from 'lucide-react';
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

function getRankInfo(totalPoints: number): { name: string; level: number; progress: number; nextRankLabel: string; pointsToNext: number; isMaxLevel: boolean } {
  const ranks = [
    { name: 'Cadet', minPoints: 0, levels: 5, pointsPerLevel: 1000 },
    { name: 'Sergeant', minPoints: 5000, levels: 5, pointsPerLevel: 2000 },
    { name: 'Lieutenant', minPoints: 15000, levels: 5, pointsPerLevel: 5000 },
    { name: 'Captain', minPoints: 40000, levels: 5, pointsPerLevel: 10000 },
    { name: 'Major', minPoints: 90000, levels: 5, pointsPerLevel: 20000 },
    { name: 'Colonel', minPoints: 190000, levels: 5, pointsPerLevel: 50000 },
    { name: 'General', minPoints: 440000, levels: 5, pointsPerLevel: 100000 },
    { name: 'Legend', minPoints: 940000, levels: 1, pointsPerLevel: Infinity },
  ];

  let currentRankIdx = 0;
  
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalPoints >= ranks[i].minPoints) {
      currentRankIdx = i;
      break;
    }
  }

  const currentRank = ranks[currentRankIdx];
  const nextRankData = ranks[currentRankIdx + 1];
  const pointsInRank = totalPoints - currentRank.minPoints;
  const level = Math.min(currentRank.levels, Math.floor(pointsInRank / currentRank.pointsPerLevel) + 1);
  
  const isMaxRank = !nextRankData;
  const isMaxLevelInRank = level >= currentRank.levels;
  const isMaxLevel = isMaxRank && isMaxLevelInRank;
  
  let progress: number;
  let nextRankLabel: string;
  let pointsToNext: number;
  
  if (isMaxLevel) {
    progress = 100;
    nextRankLabel = 'MAX';
    pointsToNext = 0;
  } else if (isMaxLevelInRank && nextRankData) {
    const pointsToNextRank = nextRankData.minPoints - totalPoints;
    const totalPointsForTransition = nextRankData.minPoints - (currentRank.minPoints + (currentRank.levels - 1) * currentRank.pointsPerLevel);
    progress = Math.max(0, Math.min(100, ((totalPointsForTransition - pointsToNextRank) / totalPointsForTransition) * 100));
    nextRankLabel = `${nextRankData.name} 1`;
    pointsToNext = pointsToNextRank;
  } else {
    const pointsInLevel = pointsInRank - (level - 1) * currentRank.pointsPerLevel;
    progress = Math.min(100, (pointsInLevel / currentRank.pointsPerLevel) * 100);
    nextRankLabel = `${currentRank.name} ${level + 1}`;
    pointsToNext = currentRank.pointsPerLevel - pointsInLevel;
  }

  return {
    name: currentRank.name,
    level,
    progress,
    nextRankLabel,
    pointsToNext,
    isMaxLevel,
  };
}

function BeadsLogo() {
  const beadColors = ['#00ff88', '#8b5cf6', '#00d4ff', '#f7931a', '#ff6b6b'];
  
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/30"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, hsl(155 100% 50% / 0.3), transparent 70%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {beadColors.map((color, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}, 0 0 24px ${color}50`,
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * 72 * Math.PI) / 180) * 40 - 8,
                Math.cos(((i * 72 + 30) * Math.PI) / 180) * 40 - 8,
                Math.cos((i * 72 * Math.PI) / 180) * 40 - 8,
              ],
              y: [
                Math.sin((i * 72 * Math.PI) / 180) * 40 - 8,
                Math.sin(((i * 72 + 30) * Math.PI) / 180) * 40 - 8,
                Math.sin((i * 72 * Math.PI) / 180) * 40 - 8,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
        
        <span 
          className="text-4xl font-bold relative z-10"
          style={{ 
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850',
          }}
        >
          B
        </span>
      </div>
      
      <h1 
        className="mt-4 font-display text-4xl font-bold"
        style={{ 
          background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 50%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px #00ff8830',
        }}
        data-testid="text-title"
      >
        BeadsLine
      </h1>
    </div>
  );
}

function CryptoCard({ type, balance, label }: { type: 'btc' | 'eth' | 'usdt'; balance: string; label: string }) {
  const config = {
    btc: { 
      icon: Bitcoin, 
      color: '#f7931a', 
      bgColor: 'rgba(247, 147, 26, 0.15)',
      borderColor: 'rgba(247, 147, 26, 0.3)',
    },
    eth: { 
      icon: SiEthereum, 
      color: '#627eea', 
      bgColor: 'rgba(98, 126, 234, 0.15)',
      borderColor: 'rgba(98, 126, 234, 0.3)',
    },
    usdt: { 
      icon: SiTether, 
      color: '#26a17b', 
      bgColor: 'rgba(38, 161, 123, 0.15)',
      borderColor: 'rgba(38, 161, 123, 0.3)',
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = config[type];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex-1 rounded-xl p-3 text-center transition-all"
      style={{ 
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 20px ${color}20, inset 0 0 20px ${color}10`,
      }}
    >
      <div 
        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
        }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div 
        className="text-sm font-bold mt-1 tabular-nums"
        style={{ color }}
        data-testid={`text-${type}-balance`}
      >
        {balance}
      </div>
    </motion.div>
  );
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

  const rankInfo = user ? getRankInfo(user.totalPoints) : null;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pb-24 overflow-y-auto" style={{ background: 'linear-gradient(180deg, hsl(230 35% 7%) 0%, hsl(230 35% 10%) 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-6"
      >
        <BeadsLogo />
      </motion.div>

      {user && rankInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm mb-4"
        >
          <Card className="p-4 border-primary/20" style={{ boxShadow: '0 0 30px hsl(155 100% 50% / 0.1)' }}>
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14 border-2" style={{ borderColor: '#00ff88' }}>
                <AvatarImage src={user.photoUrl || undefined} alt={user.username} />
                <AvatarFallback 
                  className="font-display text-lg font-bold"
                  style={{ backgroundColor: 'hsl(155 100% 50% / 0.2)', color: '#00ff88' }}
                >
                  {user.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg truncate" data-testid="text-username">
                  {user.firstName || user.username}
                </h3>
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4" style={{ color: '#f7931a' }} />
                  <span className="text-sm text-muted-foreground">
                    {rankInfo.name} {rankInfo.level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="flex items-center gap-1 font-bold tabular-nums"
                  style={{ color: '#00ff88' }}
                  data-testid="text-total-points"
                >
                  <span className="text-lg">P</span>
                  <span>{user.totalPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{rankInfo.isMaxLevel ? 'Максимальный уровень' : `Прогресс до ${rankInfo.nextRankLabel}`}</span>
                <span>{Math.round(rankInfo.progress)}%</span>
              </div>
              <Progress 
                value={rankInfo.progress} 
                className="h-2"
                style={{ 
                  background: 'hsl(230 30% 15%)',
                }}
              />
            </div>
          </Card>
        </motion.div>
      )}

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="flex gap-3">
            <CryptoCard 
              type="btc" 
              balance={`${(Number(user.btcBalanceSats) || 0).toLocaleString()} sat`}
              label="BTC"
            />
            <CryptoCard 
              type="eth" 
              balance={`${(Number(user.ethBalanceWei) || 0).toLocaleString()} gwei`}
              label="ETH"
            />
            <CryptoCard 
              type="usdt" 
              balance={`$${(user.usdtBalance || 0).toFixed(2)}`}
              label="USDT"
            />
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm mb-4"
      >
        <Card 
          className="p-4 border-secondary/30"
          style={{ 
            background: 'linear-gradient(135deg, hsl(270 60% 55% / 0.15) 0%, hsl(195 100% 50% / 0.1) 100%)',
            boxShadow: '0 0 30px hsl(270 60% 55% / 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(270 60% 55% / 0.3)' }}
            >
              <Trophy className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg" style={{ color: '#00d4ff' }}>$200 TOURNAMENT</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>03:52</span>
                <span className="text-xs" style={{ color: '#8b5cf6' }}>Rewards boost!</span>
              </div>
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="flex gap-3">
            <Card 
              className="flex-1 p-3 border-muted/30 hover-elevate cursor-pointer"
              onClick={() => {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stats</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Игр</div>
                      <div className="font-bold tabular-nums" data-testid="stats-games">{user.gamesPlayed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Лучший</div>
                      <div className="font-bold tabular-nums" style={{ color: '#00ff88' }} data-testid="stats-best">{user.bestScore.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ранг</div>
                      <div className="font-bold tabular-nums text-xs" style={{ color: '#f7931a' }} data-testid="stats-rank">{rankInfo?.name} {rankInfo?.level}</div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
            
            <Card 
              className="p-3 border-muted/30 hover-elevate cursor-pointer"
              style={{ minWidth: '90px' }}
              onClick={() => setShowReferral(!showReferral)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Refirs</div>
                  <div className="text-lg font-bold mt-1" style={{ color: '#00ff88' }}>
                    {referralInfo?.directReferralsCount || 0}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm"
      >
        <Button
          size="lg"
          className="w-full h-14 font-display text-xl font-bold border-0"
          onClick={onPlay}
          disabled={isLoading}
          data-testid="button-play"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #00d4ff 100%)',
            boxShadow: '0 0 30px hsl(270 60% 55% / 0.4), 0 0 60px hsl(195 100% 50% / 0.2)',
          }}
        >
          START
        </Button>

        {user?.isAdmin && (
          <Link href="/admin">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-display mt-3"
              data-testid="button-admin"
            >
              <Settings className="w-5 h-5 mr-2" />
              Админ-панель
            </Button>
          </Link>
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
            <Card className="p-4 relative border-primary/20">
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
                  <Gift className="w-5 h-5" style={{ color: '#00ff88' }} />
                  Реферальная программа
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Зови друзей — получай 10% их Beads!
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
                      {copied ? <Check className="w-4 h-4" style={{ color: '#00ff88' }} /> : <Copy className="w-4 h-4" />}
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
                    <div className="font-display font-bold text-lg" style={{ color: '#00ff88' }} data-testid="text-referral-rewards">
                      {referralInfo.totalEarnedBeads.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-4 max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={onLeaderboard}
            data-testid="nav-rankings"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Rankings</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
            data-testid="nav-leagues"
          >
            <Award className="w-5 h-5" />
            <span className="text-xs">Leagues</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
            data-testid="nav-achievements"
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Quests</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
