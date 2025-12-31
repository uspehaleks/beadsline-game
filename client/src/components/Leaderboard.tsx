import type { LeaderboardEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Medal, Crown, Star, Calendar, Clock, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardFilter = 'all' | 'week' | 'today' | 'friends';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  onBack: () => void;
  filter?: LeaderboardFilter;
  onFilterChange?: (filter: LeaderboardFilter) => void;
}

export function Leaderboard({ entries, currentUserId, isLoading, isFetching, onBack, filter = 'all', onFilterChange }: LeaderboardProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Рейтинг</h1>
          </div>
        </div>
        
        {onFilterChange && (
          <div className="px-4 pb-3">
            <Tabs value={filter} onValueChange={(v) => onFilterChange(v as LeaderboardFilter)}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs" data-testid="tab-filter-all">
                  <Trophy className="w-3 h-3 mr-1" />
                  Всё
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs" data-testid="tab-filter-week">
                  <Calendar className="w-3 h-3 mr-1" />
                  Неделя
                </TabsTrigger>
                <TabsTrigger value="today" className="text-xs" data-testid="tab-filter-today">
                  <Clock className="w-3 h-3 mr-1" />
                  Сегодня
                </TabsTrigger>
                <TabsTrigger value="friends" className="text-xs" data-testid="tab-filter-friends">
                  <Users className="w-3 h-3 mr-1" />
                  Друзья
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <div className="p-4 max-w-md mx-auto">
        {isLoading || isFetching ? (
          <LeaderboardSkeleton />
        ) : entries.length === 0 ? (
          <EmptyLeaderboard filter={filter} />
        ) : (
          <>
            <TopThreePodium entries={top3} currentUserId={currentUserId} />

            <div className="mt-6 space-y-2">
              {rest.map((entry, index) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === currentUserId}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface TopThreePodiumProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function TopThreePodium({ entries, currentUserId }: TopThreePodiumProps) {
  const [first, second, third] = entries;

  return (
    <div className="flex items-end justify-center gap-2 pt-8 pb-4">
      {second && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <PodiumCard entry={second} rank={2} isCurrentUser={second.userId === currentUserId} />
        </motion.div>
      )}

      {first && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <PodiumCard entry={first} rank={1} isCurrentUser={first.userId === currentUserId} />
        </motion.div>
      )}

      {third && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <PodiumCard entry={third} rank={3} isCurrentUser={third.userId === currentUserId} />
        </motion.div>
      )}
    </div>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isCurrentUser?: boolean;
}

function PodiumCard({ entry, rank, isCurrentUser }: PodiumCardProps) {
  const heightClass = rank === 1 ? 'h-28' : rank === 2 ? 'h-20' : 'h-16';
  const bgClass = rank === 1 
    ? 'bg-gradient-to-t from-amber-500/20 to-amber-400/10 border-amber-500/30' 
    : rank === 2 
    ? 'bg-gradient-to-t from-slate-400/20 to-slate-300/10 border-slate-400/30'
    : 'bg-gradient-to-t from-orange-700/20 to-orange-600/10 border-orange-700/30';
  
  const iconColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : 'text-orange-600';
  const RankIcon = rank === 1 ? Crown : Medal;
  
  const displayName = entry.characterName || entry.username;
  const avatarImage = entry.characterImageUrl || entry.photoUrl;

  return (
    <Card 
      className={`relative p-3 text-center ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
      data-testid={`podium-rank-${rank}`}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgClass} border`}>
          <RankIcon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>

      <Avatar className="w-12 h-12 mx-auto mt-2 border-2 border-border">
        <AvatarImage src={avatarImage || undefined} alt={displayName} />
        <AvatarFallback className="bg-muted">
          <User className="w-6 h-6 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <h3 className="font-semibold text-sm mt-2 truncate">{displayName}</h3>
      
      <div className={`mt-2 rounded-lg border ${bgClass} ${heightClass} flex items-end justify-center pb-2`}>
        <div className="flex flex-col items-center">
          <Star className={`w-4 h-4 ${iconColor} mb-1`} />
          <span className="font-display font-bold text-sm tabular-nums">
            {entry.totalPoints.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  delay?: number;
}

function LeaderboardRow({ entry, isCurrentUser, delay = 0 }: LeaderboardRowProps) {
  const displayName = entry.characterName || entry.username;
  const avatarImage = entry.characterImageUrl || entry.photoUrl;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Card 
        className={`flex items-center gap-3 p-3 ${isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''}`}
        data-testid={`leaderboard-row-${entry.rank}`}
      >
        <div className="w-8 text-center font-display font-bold text-muted-foreground">
          #{entry.rank}
        </div>

        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={avatarImage || undefined} alt={displayName} />
          <AvatarFallback className="bg-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          <p className="text-xs text-muted-foreground">
            {entry.gamesPlayed} игр
          </p>
        </div>

        <div className="text-right">
          <div className="font-display font-bold text-primary tabular-nums">
            {entry.totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Beads</div>
        </div>
      </Card>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-2 pt-8 pb-4">
        {[2, 1, 3].map((rank) => (
          <div key={rank} className="flex-1">
            <Skeleton className={`h-40 rounded-lg ${rank === 1 ? 'h-48' : ''}`} />
          </div>
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

function EmptyLeaderboard({ filter }: { filter?: LeaderboardFilter }) {
  const messages: Record<LeaderboardFilter, { title: string; subtitle: string }> = {
    all: { title: 'Пока нет игроков', subtitle: 'Стань первым и займи топ!' },
    week: { title: 'Нет игр за неделю', subtitle: 'Сыграй первым на этой неделе!' },
    today: { title: 'Нет игр сегодня', subtitle: 'Сыграй первым сегодня!' },
    friends: { title: 'Нет друзей в рейтинге', subtitle: 'Пригласи друзей по реферальной ссылке!' },
  };
  
  const message = messages[filter || 'all'];
  
  return (
    <div className="text-center py-16">
      <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-display text-xl font-semibold mb-2">{message.title}</h3>
      <p className="text-muted-foreground">
        {message.subtitle}
      </p>
    </div>
  );
}
