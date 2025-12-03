import type { LeaderboardEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Medal, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
  onBack: () => void;
}

export function Leaderboard({ entries, currentUserId, isLoading, onBack }: LeaderboardProps) {
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
      </div>

      <div className="p-4 max-w-md mx-auto">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : entries.length === 0 ? (
          <EmptyLeaderboard />
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
        <AvatarImage src={entry.photoUrl || undefined} alt={entry.username} />
        <AvatarFallback className="bg-muted font-display">
          {entry.username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <h3 className="font-semibold text-sm mt-2 truncate">{entry.username}</h3>
      
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
          <AvatarImage src={entry.photoUrl || undefined} alt={entry.username} />
          <AvatarFallback className="bg-muted font-display text-sm">
            {entry.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{entry.username}</h3>
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

function EmptyLeaderboard() {
  return (
    <div className="text-center py-16">
      <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-display text-xl font-semibold mb-2">Пока нет игроков</h3>
      <p className="text-muted-foreground">
        Стань первым и займи топ!
      </p>
    </div>
  );
}
