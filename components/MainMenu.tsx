import { useState, useEffect } from 'react';
import type { User, CharacterWithAccessories } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Play, Trophy, Settings, Users, Gift, Copy, Check, X, Bitcoin, Award, ChevronRight, Medal, Target, Gamepad2, QrCode, Download, UserPlus, Volume2, VolumeX, Zap, ArrowDownToLine, Smile, Meh, Frown, ThermometerSun, Heart, Utensils, Droplets, Moon, Pill } from 'lucide-react';
import { SiEthereum, SiTether } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, APP_VERSION } from '@/lib/queryClient';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { CharacterSetup } from '@/components/CharacterSetup';
import { LeagueBadge } from '@/components/LeagueBadge';
import { UserProfileSkeleton } from '@/components/UserProfileSkeleton';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { isSoundEnabled, setSoundEnabled, initSounds } from '@/lib/sounds';

type CharacterMood = 'happy' | 'neutral' | 'sad';
type HealthState = 'normal' | 'tired' | 'sick' | 'hungry';

interface CharacterStatus {
  isSetup: boolean;
  gender: 'male' | 'female' | null;
  name: string | null;
  energy: number;
  maxEnergy: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  fatigue: number;
  maxFatigue: number;
  healthState: HealthState;
  mood: CharacterMood;
  lastActivityAt: string;
  lastCareAt: string | null;
  hoursSinceActivity: number;
  careCooldowns: Record<string, string>;
}

interface MainMenuProps {
  user: User | null;
  onPlay: () => void;
  onLeaderboard: () => void;
  onShop: () => void;
  onAccessoryShop?: () => void;
  onCustomize?: () => void;
  onBeadsBox?: () => void;
  isLoading?: boolean;
}

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  directReferralsCount: number;
  level2ReferralsCount: number;
  totalEarnedBeads: number;
  referralsTotalBeads: number;
  lastRewardId?: string;
}

interface ReferralConfig {
  title: string;
  description: string;
  level1RewardPercent: number;
  level2RewardPercent: number;
}

interface ReferralRewardWithUser {
  id: string;
  userId: string;
  refUserId: string;
  refUsername: string;
  level: number;
  beadsAmount: number;
  createdAt: string;
}

interface ReferralRewardsResponse {
  rewards: ReferralRewardWithUser[];
  total: number;
}

interface League {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  minBeads: number;
  maxRank: number | null;
  themeColor: string;
  sortOrder: number;
}

interface UserLeagueResponse {
  league: League;
  rank: number;
}

interface ReferralListItem {
  id: string;
  username: string;
  gamesPlayed: number;
  earnedFromRef: number;
  joinedAt: string;
}

interface Level2ReferralItem {
  id: string;
  username: string;
  gamesPlayed: number;
  earnedFromRef: number;
  invitedBy: string;
  joinedAt: string;
}

interface ReferralListResponse {
  referrals: ReferralListItem[];
  level2Referrals: Level2ReferralItem[];
  level2Count: number;
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

function MiniBeadsLogo({ size = 22 }: { size?: number }) {
  const beadColors = ['#00ff88', '#8b5cf6', '#00d4ff', '#f7931a'];
  const beadSize = size * 0.18;
  const orbitRadius = size * 0.38;
  
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: size, 
        height: size,
        filter: 'drop-shadow(0 0 4px #00ff88) drop-shadow(0 0 8px #00ff8850)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, hsl(155 100% 50% / 0.25), hsl(270 60% 30% / 0.3) 70%)',
          border: '1.5px solid hsl(155 100% 50% / 0.4)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      
      {beadColors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            width: beadSize,
            height: beadSize,
            backgroundColor: color,
            boxShadow: `0 0 3px ${color}, 0 0 6px ${color}60`,
            top: '50%',
            left: '50%',
            marginTop: -beadSize / 2,
            marginLeft: -beadSize / 2,
          }}
          animate={{
            x: [
              Math.cos((i * 90 * Math.PI) / 180) * orbitRadius,
              Math.cos(((i * 90 + 20) * Math.PI) / 180) * orbitRadius,
              Math.cos((i * 90 * Math.PI) / 180) * orbitRadius,
            ],
            y: [
              Math.sin((i * 90 * Math.PI) / 180) * orbitRadius,
              Math.sin(((i * 90 + 20) * Math.PI) / 180) * orbitRadius,
              Math.sin((i * 90 * Math.PI) / 180) * orbitRadius,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
      
      <span 
        className="font-bold relative z-10"
        style={{ 
          fontSize: size * 0.45,
          color: '#00ff88',
          textShadow: '0 0 6px #00ff88, 0 0 12px #00ff8850',
          lineHeight: 1,
        }}
      >
        B
      </span>
    </div>
  );
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

export function MainMenu({ user, onPlay, onLeaderboard, onShop, onAccessoryShop, onCustomize, onBeadsBox, isLoading }: MainMenuProps) {
  const [, navigate] = useLocation();
  const [showReferral, setShowReferral] = useState(false);
  const [showReferralStats, setShowReferralStats] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastSeenRewardId, setLastSeenRewardId] = useState<string | null>(() => {
    return localStorage.getItem('lastSeenRewardId');
  });
  const [notifiedRewardIds, setNotifiedRewardIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('notifiedRewardIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [pendingNotifications, setPendingNotifications] = useState<ReferralRewardWithUser[]>([]);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [showCharacterSetup, setShowCharacterSetup] = useState(false);
  const { toast } = useToast();
  
  const toggleSound = () => {
    initSounds();
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
  };
  
  const handlePlay = () => {
    initSounds();
    onPlay();
  };

  const { data: activePlayers } = useQuery<{ count: number }>({
    queryKey: ["/api/active-players"],
    refetchInterval: 10000,
  });

  const { data: referralInfo } = useQuery<ReferralInfo>({
    queryKey: ["/api/referral"],
    enabled: !!user && !user.username?.startsWith('guest_'),
    refetchInterval: 30000,
  });

  const { data: referralConfig } = useQuery<ReferralConfig>({
    queryKey: ["/api/referral/config"],
  });

  const { data: referralRewards, refetch: refetchRewards } = useQuery<ReferralRewardsResponse>({
    queryKey: ["/api/referral/rewards"],
    enabled: !!user && !user.username?.startsWith('guest_'),
    refetchInterval: 30000,
  });

  const { data: referralList } = useQuery<ReferralListResponse>({
    queryKey: ["/api/referral/list"],
    enabled: !!user && !user.username?.startsWith('guest_') && showReferralStats,
  });

  const { data: characterData, isLoading: isCharacterLoading } = useQuery<CharacterWithAccessories>({
    queryKey: ["/api/character"],
    enabled: !!user,
    retry: 3,
    staleTime: 30000,
  });

  const { data: characterStatus } = useQuery<CharacterStatus>({
    queryKey: ['/api/character/status'],
    enabled: !!user,
  });

  const [careReaction, setCareReaction] = useState<string | null>(null);
  
  const careMutation = useMutation({
    mutationFn: async (action: string) => {
      return apiRequest('POST', '/api/character/care', { action });
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/status'] });
      // Show micro-animation based on action
      setCareReaction(action);
      setTimeout(() => setCareReaction(null), 2000);
    },
  });

  const getCooldownRemaining = (action: string): number | null => {
    if (!characterStatus?.careCooldowns?.[action]) return null;
    const cooldownHours: Record<string, number> = { feed: 4, drink: 4, rest: 6, heal: 8 };
    const lastTime = new Date(characterStatus.careCooldowns[action]);
    const elapsed = (Date.now() - lastTime.getTime()) / (1000 * 60 * 60);
    const remaining = cooldownHours[action] - elapsed;
    return remaining > 0 ? Math.ceil(remaining * 60) : null;
  };

  const { data: userLeague } = useQuery<UserLeagueResponse>({
    queryKey: ['/api/user/league'],
    enabled: !!user && !user.username?.startsWith('guest_'),
    staleTime: 30000,
  });

  const { data: allLeagues = [] } = useQuery<League[]>({
    queryKey: ['/api/leagues'],
    staleTime: 60000,
  });

  const { data: activeSeason } = useQuery<{ id: number; seasonNumber: number; month: number; year: number; isActive: boolean } | null>({
    queryKey: ['/api/season/active'],
    staleTime: 60000,
  });

  const getMonthName = (month: number) => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return months[month - 1] || '';
  };

  // Calculate progress to next league (both Beads and Rank conditions)
  const getLeagueProgress = () => {
    if (!userLeague || allLeagues.length === 0) return null;
    
    const currentIndex = allLeagues.findIndex(l => l.slug === userLeague.league.slug);
    const nextLeague = currentIndex < allLeagues.length - 1 ? allLeagues[currentIndex + 1] : null;
    const userRank = userLeague.rank;
    
    if (!nextLeague) {
      return {
        isMax: true,
        beadsProgress: 100,
        rankProgress: 100,
        nextLeagueName: 'MAX',
        nextLeagueIcon: '',
        pointsToNext: 0,
        rankToNext: 0,
        nextMaxRank: null,
        themeColor: userLeague.league.themeColor,
        beadsMet: true,
        rankMet: true,
      };
    }
    
    const currentMinBeads = userLeague.league.minBeads;
    const nextMinBeads = nextLeague.minBeads;
    const nextMaxRank = nextLeague.maxRank;
    const userBeads = user?.totalPoints || 0;
    
    // Beads progress
    const beadsProgress = Math.min(100, Math.max(0, ((userBeads - currentMinBeads) / (nextMinBeads - currentMinBeads)) * 100));
    const pointsToNext = Math.max(0, nextMinBeads - userBeads);
    const beadsMet = userBeads >= nextMinBeads;
    
    // Rank progress (if nextMaxRank exists)
    let rankProgress = 100;
    let rankToNext = 0;
    let rankMet = true;
    if (nextMaxRank !== null) {
      rankMet = userRank <= nextMaxRank;
      if (!rankMet) {
        rankToNext = userRank - nextMaxRank;
        // Calculate rank progress (how close to top N)
        const currentMaxRank = userLeague.league.maxRank || 10000;
        rankProgress = Math.min(100, Math.max(0, ((currentMaxRank - userRank) / (currentMaxRank - nextMaxRank)) * 100));
      }
    }
    
    return {
      isMax: false,
      beadsProgress,
      rankProgress,
      nextLeagueName: nextLeague.nameRu,
      nextLeagueIcon: nextLeague.icon,
      pointsToNext,
      rankToNext,
      nextMaxRank,
      themeColor: nextLeague.themeColor,
      beadsMet,
      rankMet,
      userRank,
    };
  };

  const leagueProgress = getLeagueProgress();

  // Проверка и показ новых реферальных наград (только 1 раз каждая)
  useEffect(() => {
    if (!referralRewards?.rewards || referralRewards.rewards.length === 0) return;
    
    // Фильтруем только награды, которые ещё не показывали
    const newRewards = referralRewards.rewards.filter(r => !notifiedRewardIds.has(r.id));
    
    if (newRewards.length === 0) return;
    
    // Показываем до 3 уведомлений
    newRewards.slice(0, 3).forEach((reward, idx) => {
      setTimeout(() => {
        toast({
          title: "Реферальная награда!",
          description: `+${reward.beadsAmount} Beads от ${reward.refUsername} (Ур.${reward.level})`,
        });
      }, idx * 1500);
    });
    
    if (newRewards.length > 3) {
      setTimeout(() => {
        toast({
          title: "И ещё награды!",
          description: `+${newRewards.length - 3} реферальных наград`,
        });
      }, 4500);
    }
    
    // Сохраняем ID показанных наград в localStorage
    const currentIds = Array.from(notifiedRewardIds);
    const newIds = newRewards.map(r => r.id);
    const allIds = [...currentIds, ...newIds];
    const newNotifiedIds = new Set(allIds);
    setNotifiedRewardIds(newNotifiedIds);
    localStorage.setItem('notifiedRewardIds', JSON.stringify(allIds));
    
    // Обновляем lastSeenRewardId
    if (referralRewards.rewards[0]) {
      const latestId = referralRewards.rewards[0].id;
      setLastSeenRewardId(latestId);
      localStorage.setItem('lastSeenRewardId', latestId);
    }
  }, [referralRewards?.rewards, notifiedRewardIds, toast]);

  useEffect(() => {
    if (showQRModal && referralInfo?.referralLink) {
      QRCode.toDataURL(referralInfo.referralLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [showQRModal, referralInfo?.referralLink]);

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

  const saveQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = 'beadsline-invite-qr.png';
    link.href = qrCodeDataUrl;
    link.click();
    toast({
      title: "QR-код сохранён!",
      description: "Проверьте папку загрузок",
    });
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
          {isCharacterLoading ? (
            <UserProfileSkeleton />
          ) : (
            <Card className="p-4 border-primary/20" style={{ boxShadow: '0 0 30px hsl(155 100% 50% / 0.1)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="cursor-pointer rounded-full overflow-hidden border-2 hover-elevate"
                  style={{ borderColor: '#00ff88' }}
                  onClick={onCustomize}
                  data-testid="button-character-avatar"
                >
                  {characterData ? (
                    <CharacterAvatar
                      characterData={characterData}
                      size={56}
                      showPlaceholder={true}
                    />
                  ) : (
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={user.photoUrl || undefined} alt={user.username} />
                      <AvatarFallback
                        className="font-display text-lg font-bold"
                        style={{ backgroundColor: 'hsl(155 100% 50% / 0.2)', color: '#00ff88' }}
                      >
                        {user.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-lg truncate" data-testid="text-username">
                    {characterData?.name || user.firstName || user.username}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <LeagueBadge size="sm" showRank={false} />
                    {activeSeason && (
                      <span
                        className="text-xs text-muted-foreground"
                        data-testid="text-current-season"
                      >
                        Сезон {activeSeason.seasonNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="flex items-center gap-1.5 font-bold tabular-nums"
                    style={{ color: '#00ff88' }}
                    data-testid="text-total-points"
                  >
                    <MiniBeadsLogo size={22} />
                    <span className="text-lg">{user.totalPoints.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {characterStatus?.isSetup && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Энергия
                      </span>
                      <span>{Math.round((characterStatus.energy / characterStatus.maxEnergy) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: characterStatus.energy / characterStatus.maxEnergy > 0.6 
                            ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                            : characterStatus.energy / characterStatus.maxEnergy > 0.4 
                              ? 'linear-gradient(90deg, #eab308, #facc15)' 
                              : characterStatus.energy / characterStatus.maxEnergy > 0.2 
                                ? 'linear-gradient(90deg, #f97316, #fb923c)' 
                                : 'linear-gradient(90deg, #a855f7, #ef4444)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(characterStatus.energy / characterStatus.maxEnergy) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center" title={`Настроение: ${characterStatus.mood === 'happy' ? 'счастливый' : characterStatus.mood === 'sad' ? 'грустный' : 'нейтральный'}`}>
                      {characterStatus.mood === 'happy' 
                        ? <Smile className="w-4 h-4 text-green-400" />
                        : characterStatus.mood === 'sad' 
                          ? <Frown className="w-4 h-4 text-red-400" />
                          : <Meh className="w-4 h-4 text-yellow-400" />
                      }
                    </div>
                    {characterStatus.healthState !== 'normal' && (
                      <div className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center" title={characterStatus.healthState === 'sick' ? 'Болеет' : characterStatus.healthState === 'hungry' ? 'Голоден' : 'Устал'}>
                        {characterStatus.healthState === 'sick' 
                          ? <ThermometerSun className="w-4 h-4 text-red-400" />
                          : characterStatus.healthState === 'hungry'
                            ? <Utensils className="w-4 h-4 text-orange-400" />
                            : <Heart className="w-4 h-4 text-orange-400" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Utensils className="w-3 h-3" />
                      <span>Сытость</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          background: characterStatus.hunger > 50 
                            ? 'linear-gradient(90deg, #f97316, #fb923c)' 
                            : 'linear-gradient(90deg, #ef4444, #f97316)' 
                        }}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${characterStatus.hunger}%`,
                          opacity: characterStatus.hunger < 20 ? [0.5, 1, 0.5] : 1
                        }}
                        transition={{ 
                          width: { duration: 0.5 },
                          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="w-3 h-3" />
                      <span>Жажда</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          background: characterStatus.thirst > 50 
                            ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' 
                            : 'linear-gradient(90deg, #0891b2, #06b6d4)' 
                        }}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${characterStatus.thirst}%`,
                          opacity: characterStatus.thirst < 20 ? [0.5, 1, 0.5] : 1
                        }}
                        transition={{ 
                          width: { duration: 0.5 },
                          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Moon className="w-3 h-3" />
                      <span>Усталость</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          background: characterStatus.fatigue < 50 
                            ? 'linear-gradient(90deg, #a855f7, #c084fc)' 
                            : 'linear-gradient(90deg, #7c3aed, #a855f7)' 
                        }}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${characterStatus.fatigue}%`,
                          opacity: characterStatus.fatigue > 80 ? [0.5, 1, 0.5] : 1
                        }}
                        transition={{ 
                          width: { duration: 0.5 },
                          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {careReaction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-center text-sm font-medium"
                  >
                    {careReaction === 'feed' && <span className="text-orange-400">Ням-ням! 😋</span>}
                    {careReaction === 'drink' && <span className="text-cyan-400">Освежился! 💧</span>}
                    {careReaction === 'rest' && <span className="text-purple-400">*зевает* 😴</span>}
                    {careReaction === 'heal' && <span className="text-pink-400">Мне лучше! 💊</span>}
                  </motion.div>
                )}

                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex flex-col items-center gap-0.5 h-auto py-2 text-xs"
                    disabled={careMutation.isPending || getCooldownRemaining('feed') !== null}
                    onClick={() => careMutation.mutate('feed')}
                    data-testid="button-care-feed"
                  >
                    <motion.div animate={careReaction === 'feed' ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}>
                      <Utensils className="w-4 h-4 text-orange-400" />
                    </motion.div>
                    <span>{getCooldownRemaining('feed') ? `${getCooldownRemaining('feed')}м` : 'Еда'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex flex-col items-center gap-0.5 h-auto py-2 text-xs"
                    disabled={careMutation.isPending || getCooldownRemaining('drink') !== null}
                    onClick={() => careMutation.mutate('drink')}
                    data-testid="button-care-drink"
                  >
                    <motion.div animate={careReaction === 'drink' ? { scale: [1, 1.3, 1], y: [0, -3, 0] } : {}}>
                      <Droplets className="w-4 h-4 text-cyan-400" />
                    </motion.div>
                    <span>{getCooldownRemaining('drink') ? `${getCooldownRemaining('drink')}м` : 'Вода'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex flex-col items-center gap-0.5 h-auto py-2 text-xs"
                    disabled={careMutation.isPending || getCooldownRemaining('rest') !== null}
                    onClick={() => careMutation.mutate('rest')}
                    data-testid="button-care-rest"
                  >
                    <motion.div animate={careReaction === 'rest' ? { rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] } : {}}>
                      <Moon className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <span>{getCooldownRemaining('rest') ? `${getCooldownRemaining('rest')}м` : 'Отдых'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex flex-col items-center gap-0.5 h-auto py-2 text-xs"
                    disabled={careMutation.isPending || getCooldownRemaining('heal') !== null || characterStatus.healthState === 'normal'}
                    onClick={() => careMutation.mutate('heal')}
                    data-testid="button-care-heal"
                  >
                    <motion.div animate={careReaction === 'heal' ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}>
                      <Pill className="w-4 h-4 text-pink-400" />
                    </motion.div>
                    <span>{getCooldownRemaining('heal') ? `${getCooldownRemaining('heal')}м` : 'Лечить'}</span>
                  </Button>
                </div>
              </div>
            )}
            
            {leagueProgress && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-muted-foreground">
                  {leagueProgress.isMax 
                    ? 'Максимальная лига' 
                    : `До ${leagueProgress.nextLeagueIcon} ${leagueProgress.nextLeagueName}`
                  }
                </div>
                
                {!leagueProgress.isMax && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={leagueProgress.beadsMet ? 'text-green-500' : 'text-muted-foreground'}>
                          {leagueProgress.beadsMet ? '✓' : ''} Beads
                        </span>
                        <span className={leagueProgress.beadsMet ? 'text-green-500' : 'text-muted-foreground'}>
                          {leagueProgress.beadsMet 
                            ? 'Выполнено' 
                            : `${Math.round(leagueProgress.beadsProgress)}%`
                          }
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(230 30% 15%)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${leagueProgress.beadsProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {!leagueProgress.beadsMet && leagueProgress.pointsToNext > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Ещё {leagueProgress.pointsToNext.toLocaleString()} Beads
                        </p>
                      )}
                    </div>
                    
                    {leagueProgress.nextMaxRank !== null && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={leagueProgress.rankMet ? 'text-green-500' : 'text-muted-foreground'}>
                            {leagueProgress.rankMet ? '✓' : ''} Рейтинг (Top {leagueProgress.nextMaxRank})
                          </span>
                          <span className={leagueProgress.rankMet ? 'text-green-500' : 'text-muted-foreground'}>
                            {leagueProgress.rankMet 
                              ? 'Выполнено' 
                              : `#${leagueProgress.userRank}`
                            }
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(230 30% 15%)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #8b5cf6, #a855f7)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${leagueProgress.rankMet ? 100 : leagueProgress.rankProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        {!leagueProgress.rankMet && leagueProgress.rankToNext > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Нужно подняться на {leagueProgress.rankToNext} позиций
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        )}
      </motion.div>
      )}

      {user && referralInfo && !user.username?.startsWith('guest_') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="w-full max-w-sm mb-4"
        >
          <Button
            className="w-full h-12 font-display font-semibold border-0"
            onClick={() => setShowReferral(true)}
            data-testid="button-invite-friend"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              boxShadow: '0 0 20px hsl(270 60% 55% / 0.3)',
            }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Пригласить друга
          </Button>
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
              balance={`${((Number(user.btcBalanceSats) || 0) / 100000000).toFixed(8)} BTC`}
              label="BTC"
            />
            <CryptoCard 
              type="eth" 
              balance={`${((Number(user.ethBalanceWei) || 0) / 1000000000000000000).toFixed(9)} ETH`}
              label="ETH"
            />
            <CryptoCard 
              type="usdt" 
              balance={`$${(user.usdtBalance || 0).toFixed(4)}`}
              label="USDT"
            />
          </div>
        </motion.div>
      )}

      {/* Prize Fund block - temporarily disabled
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
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor: 'hsl(270 60% 55% / 0.3)' }}
            >
              <Trophy className="w-6 h-6" style={{ color: '#8b5cf6' }} />
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#f7931a', color: '#000' }}
              >
                47
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg" style={{ color: '#00d4ff' }}>$200</span>
                <span className="text-xs uppercase text-muted-foreground">Призовой фонд</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="tabular-nums">03:52:14</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(155 100% 50% / 0.2)', color: '#00ff88' }}>
                  Твой приз: 10 USDT
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </motion.div>
      */}

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
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-4 h-4" style={{ color: '#00d4ff' }} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Статистика</span>
                  </div>
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
                      <div className="text-xs text-muted-foreground">Лига</div>
                      <div className="font-bold tabular-nums text-xs" style={{ color: userLeague?.league.themeColor || '#f7931a' }} data-testid="stats-rank">
                        {userLeague ? `${userLeague.league.icon} ${userLeague.league.nameRu}` : 'Гость'}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
            
            <Card 
              className="p-3 border-muted/30 hover-elevate cursor-pointer"
              style={{ minWidth: '140px' }}
              onClick={() => setShowReferral(!showReferral)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <Users className="w-3 h-3" style={{ color: '#8b5cf6' }} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Друзья</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Ур.1</div>
                      <div className="text-sm font-bold" style={{ color: '#00ff88' }}>
                        {referralInfo?.directReferralsCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Ур.2</div>
                      <div className="text-sm font-bold" style={{ color: '#8b5cf6' }}>
                        {referralInfo?.level2ReferralsCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Beads</div>
                      <div className="text-sm font-bold" style={{ color: '#00d4ff' }}>
                        {(referralInfo?.totalEarnedBeads || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
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
        <div className="flex gap-2">
          <Button
            size="lg"
            className="flex-1 h-14 font-display text-xl font-bold border-0"
            onClick={handlePlay}
            disabled={isLoading}
            data-testid="button-play"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #00d4ff 100%)',
              boxShadow: '0 0 30px hsl(270 60% 55% / 0.4), 0 0 60px hsl(195 100% 50% / 0.2)',
            }}
          >
            <Play className="w-6 h-6 mr-2" />
            ИГРАТЬ
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 p-0"
            onClick={toggleSound}
            data-testid="button-toggle-sound"
          >
            {soundOn ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6 text-muted-foreground" />
            )}
          </Button>
        </div>

        {user && (
          <div className="flex gap-2 mt-3">
            <Card 
              className="flex-1 p-3 cursor-pointer hover-elevate active-elevate-2 border-0"
              onClick={onShop}
              data-testid="button-shop"
              style={{
                background: 'linear-gradient(135deg, #f7931a 0%, #ffcc00 100%)',
                boxShadow: '0 0 15px rgba(247, 147, 26, 0.3)',
              }}
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <Zap className="w-6 h-6" style={{ color: '#000' }} />
                <span className="font-display text-sm font-semibold" style={{ color: '#000' }}>Бусты</span>
              </div>
            </Card>
            
            {onAccessoryShop && (
              <Card 
                className="flex-1 p-3 cursor-pointer hover-elevate active-elevate-2 border-primary/30"
                onClick={onAccessoryShop}
                data-testid="button-accessory-shop"
                style={{
                  background: 'linear-gradient(135deg, hsl(270 60% 55% / 0.3) 0%, hsl(195 100% 50% / 0.2) 100%)',
                  boxShadow: '0 0 15px hsl(270 60% 55% / 0.2)',
                }}
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <Gift className="w-6 h-6" style={{ color: '#a855f7' }} />
                  <span className="font-display text-sm font-semibold" style={{ color: '#a855f7' }}>Аксессуары</span>
                </div>
              </Card>
            )}
            
            {onBeadsBox && (
              <Card 
                className="flex-1 p-3 cursor-pointer hover-elevate active-elevate-2 border-0 relative overflow-visible"
                onClick={onBeadsBox}
                data-testid="button-beads-box"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                }}
              >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="flex flex-col items-center gap-1 text-center">
                  <Gift className="w-6 h-6" style={{ color: '#000' }} />
                  <span className="font-display text-sm font-semibold" style={{ color: '#000' }}>BEADS BOX</span>
                </div>
              </Card>
            )}
          </div>
        )}

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
                  {referralConfig?.title || 'Реферальная программа'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {referralConfig?.description || 'Зови друзей — получай 10% их Beads!'}
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
                      onClick={() => setShowQRModal(true)}
                      data-testid="button-qr-code"
                    >
                      <QrCode className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                    </Button>
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

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Друзей</div>
                    <div className="font-display font-bold text-lg" data-testid="text-referrals-count">
                      {referralInfo.directReferralsCount}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Мой %</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#00ff88' }} data-testid="text-referral-rewards">
                      {referralInfo.totalEarnedBeads.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">Их Beads</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#00d4ff' }} data-testid="text-referrals-total-beads">
                      {referralInfo.referralsTotalBeads.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowReferralStats(true)}
                  data-testid="button-referral-stats"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Подробная статистика
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReferralStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setShowReferralStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <Card 
                className="p-4 border-primary/30 flex flex-col max-h-[80vh]"
                style={{ 
                  background: 'linear-gradient(180deg, #1a1a2e 0%, #16161a 100%)',
                  boxShadow: '0 0 40px hsl(155 100% 50% / 0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: '#00ff88' }} />
                    Статистика рефералов
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowReferralStats(false)}
                    data-testid="button-close-referral-stats"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Уровень 1</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#00ff88' }}>
                      {referralInfo?.directReferralsCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{referralConfig?.level1RewardPercent || 10}%
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Уровень 2</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#8b5cf6' }}>
                      {referralList?.level2Count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{referralConfig?.level2RewardPercent || 3}%
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Всего Beads</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#00d4ff' }}>
                      {referralInfo?.totalEarnedBeads?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Список рефералов 1-го уровня */}
                  {referralList?.referrals && referralList.referrals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" style={{ color: '#00ff88' }} />
                        Уровень 1 ({referralList.referrals.length})
                      </h4>
                      <div className="space-y-2 max-h-[120px] overflow-y-auto">
                        {referralList.referrals.map((ref) => (
                          <div
                            key={ref.id}
                            className="flex items-center justify-between bg-muted/20 rounded-lg p-2"
                            data-testid={`referral-item-${ref.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs" style={{ backgroundColor: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                                  {ref.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{ref.username}</div>
                                <div className="text-xs text-muted-foreground">
                                  {ref.gamesPlayed} игр
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold" style={{ color: '#00ff88' }}>
                                +{ref.earnedFromRef}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Список рефералов 2-го уровня */}
                  {referralList?.level2Referrals && referralList.level2Referrals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                        Уровень 2 ({referralList.level2Referrals.length})
                      </h4>
                      <div className="space-y-2 max-h-[120px] overflow-y-auto">
                        {referralList.level2Referrals.map((ref) => (
                          <div
                            key={ref.id}
                            className="flex items-center justify-between bg-muted/20 rounded-lg p-2"
                            data-testid={`referral-l2-item-${ref.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                                  {ref.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{ref.username}</div>
                                <div className="text-xs text-muted-foreground">
                                  от {ref.invitedBy} • {ref.gamesPlayed} игр
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold" style={{ color: '#8b5cf6' }}>
                                +{ref.earnedFromRef}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* История наград */}
                  {referralRewards?.rewards && referralRewards.rewards.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                        История наград
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {referralRewards.rewards.slice(0, 20).map((reward) => (
                          <div
                            key={reward.id}
                            className="flex items-center justify-between bg-muted/20 rounded-lg p-2"
                            data-testid={`reward-item-${reward.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ 
                                  backgroundColor: reward.level === 1 ? 'rgba(0, 255, 136, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                  color: reward.level === 1 ? '#00ff88' : '#8b5cf6'
                                }}
                              >
                                L{reward.level}
                              </div>
                              <div>
                                <div className="text-sm">{reward.refUsername}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(reward.createdAt).toLocaleDateString('ru-RU', { 
                                    day: 'numeric', 
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                            <div 
                              className="font-bold"
                              style={{ color: '#00ff88' }}
                            >
                              +{reward.beadsAmount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!referralList?.referrals || referralList.referrals.length === 0) && 
                   (!referralList?.level2Referrals || referralList.level2Referrals.length === 0) &&
                   (!referralRewards?.rewards || referralRewards.rewards.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>У вас пока нет рефералов</p>
                      <p className="text-sm mt-1">Поделитесь ссылкой с друзьями!</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && qrCodeDataUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card 
                className="p-6 border-primary/30"
                style={{ 
                  background: 'linear-gradient(180deg, #1a1a2e 0%, #16161a 100%)',
                  boxShadow: '0 0 40px hsl(270 60% 55% / 0.3)',
                }}
              >
                <div className="text-center mb-4">
                  <h3 className="font-display font-bold text-xl flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                    QR-код приглашения
                  </h3>
                </div>

                <div 
                  className="flex justify-center mb-4 rounded-lg overflow-hidden"
                  style={{ 
                    boxShadow: '0 0 30px hsl(270 60% 55% / 0.4)',
                  }}
                >
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Referral QR Code" 
                    className="w-[300px] h-[300px]"
                    data-testid="img-qr-code"
                  />
                </div>

                <p 
                  className="text-center text-sm mb-4"
                  style={{ color: '#8b5cf6' }}
                >
                  Дай отсканировать друзьям!
                </p>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 font-display"
                    onClick={saveQRCode}
                    data-testid="button-save-qr"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 font-display"
                    onClick={() => setShowQRModal(false)}
                    data-testid="button-close-qr"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Закрыть
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCharacterSetup && (
        <CharacterSetup onComplete={() => setShowCharacterSetup(false)} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-4 max-w-sm mx-auto">
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors relative"
            onClick={onLeaderboard}
            data-testid="nav-rankings"
          >
            <Trophy className="w-5 h-5" style={{ color: '#f7931a' }} />
            <span className="text-xs">Рейтинг</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors relative"
            onClick={() => navigate(userLeague ? `/league/${userLeague.league.slug}` : '/league/bronze')}
            data-testid="nav-leagues"
          >
            <div className="relative">
              {userLeague ? (
                <span className="text-xl" style={{ color: userLeague.league.themeColor }}>{userLeague.league.icon}</span>
              ) : (
                <>
                  <Award className="w-5 h-5" style={{ color: '#c0c0c0' }} />
                  <span 
                    className="absolute -top-1 -right-2 text-[10px] font-bold"
                    style={{ color: '#c0c0c0' }}
                  >
                    ?
                  </span>
                </>
              )}
            </div>
            <span className="text-xs">Лиги</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors relative"
            data-testid="nav-achievements"
          >
            <div className="relative">
              <Target className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              <span 
                className="absolute -top-1 -right-3 text-[10px] px-1 rounded-full font-bold"
                style={{ backgroundColor: '#00ff88', color: '#000' }}
              >
                2/5
              </span>
            </div>
            <span className="text-xs">Квесты</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => navigate('/withdraw')}
            data-testid="nav-withdraw"
          >
            <ArrowDownToLine className="w-5 h-5" style={{ color: '#00ff88' }} />
            <span className="text-xs">Вывод</span>
          </button>
        </div>
        <div className="text-center py-1 text-[10px] text-muted-foreground/50">
          v{APP_VERSION}
        </div>
      </div>
    </div>
  );
}
