import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

interface LeagueBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
  className?: string;
}

export function LeagueBadge({ size = 'md', showRank = true, className = '' }: LeagueBadgeProps) {
  const { data: userLeague, isLoading } = useQuery<UserLeagueResponse>({
    queryKey: ['/api/user/league'],
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userLeague) {
    return null;
  }

  const { league, rank } = userLeague;
  
  const sizeClasses = {
    sm: { container: 'px-2 py-0.5 text-xs', icon: 'text-sm' },
    md: { container: 'px-2.5 py-1 text-sm', icon: 'text-base' },
    lg: { container: 'px-3 py-1.5 text-base', icon: 'text-lg' },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizes.container} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${league.themeColor}20 0%, ${league.themeColor}40 100%)`,
        border: `1px solid ${league.themeColor}60`,
        color: league.themeColor,
        textShadow: `0 0 10px ${league.themeColor}50`,
      }}
      data-testid="badge-user-league"
    >
      <span className={sizes.icon}>{league.icon}</span>
      <span>{league.nameRu}</span>
      {showRank && (
        <span 
          className="opacity-70 text-xs"
          style={{ color: league.themeColor }}
        >
          #{rank}
        </span>
      )}
    </motion.div>
  );
}

export function LeagueCard({ className = '' }: { className?: string }) {
  const { data: userLeague, isLoading } = useQuery<UserLeagueResponse>({
    queryKey: ['/api/user/league'],
    staleTime: 30000,
  });

  const { data: allLeagues = [] } = useQuery<League[]>({
    queryKey: ['/api/leagues'],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg bg-card animate-pulse ${className}`}>
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  if (!userLeague) {
    return null;
  }

  const { league, rank } = userLeague;
  const currentIndex = allLeagues.findIndex(l => l.slug === league.slug);
  const nextLeague = currentIndex < allLeagues.length - 1 ? allLeagues[currentIndex + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${className}`}
      style={{
        background: `linear-gradient(135deg, ${league.themeColor}15 0%, ${league.themeColor}05 100%)`,
        border: `1px solid ${league.themeColor}30`,
      }}
      data-testid="card-league-info"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, ${league.themeColor}30 0%, ${league.themeColor}10 100%)`,
              border: `2px solid ${league.themeColor}`,
              boxShadow: `0 0 20px ${league.themeColor}40`,
            }}
          >
            {league.icon}
          </div>
          <div>
            <h3 
              className="font-bold text-lg"
              style={{ color: league.themeColor }}
            >
              {league.nameRu} лига
            </h3>
            <p className="text-sm text-muted-foreground">
              Ранг: #{rank} {league.maxRank ? `из топ-${league.maxRank}` : ''}
            </p>
          </div>
        </div>
      </div>

      {nextLeague && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Следующая лига:</span>
            <span 
              className="font-medium flex items-center gap-1"
              style={{ color: nextLeague.themeColor }}
            >
              {nextLeague.icon} {nextLeague.nameRu}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Требуется: {nextLeague.minBeads.toLocaleString()} Beads
            {nextLeague.maxRank ? ` и топ-${nextLeague.maxRank}` : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
