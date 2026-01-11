import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Users, Crown, Medal, Award, Loader2, Sparkles, UserPlus, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";

interface LeagueData {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  minBeads: number;
  maxRank: number | null;
  themeColor: string;
  sortOrder: number;
  isActive: boolean;
}

interface LeaderboardEntry {
  rank: number;
  odoserId: string;
  name: string;
  ratingScore: number;
  beadsBalance: number;
  photoUrl: string | null;
  characterType: string | null;
  characterImageUrl: string | null;
}

interface LeagueLeaderboardData {
  league: LeagueData;
  leaderboard: LeaderboardEntry[];
  playerCount: number;
}

interface MyPositionData {
  inLeague: boolean;
  rank?: number;
  playerCount: number;
}

type FilterPeriod = 'all' | 'week' | 'today' | 'friends';

const FILTER_LABELS: Record<FilterPeriod, string> = {
  all: 'Всё время',
  week: 'Неделя',
  today: 'Сегодня',
  friends: 'Друзья',
};

export default function LeagueLeaderboard() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const slug = params.slug;
  const [filter, setFilter] = useState<FilterPeriod>('all');

  const { data, isLoading, isFetching } = useQuery<LeagueLeaderboardData>({
    queryKey: ["/api/leagues", slug, "leaderboard", filter],
    queryFn: async () => {
      if (filter === 'friends') {
        const res = await fetch(`/api/leagues/${slug}/leaderboard/friends?limit=100`);
        if (!res.ok) throw new Error("Failed to load friends leaderboard");
        return res.json();
      }
      const res = await fetch(`/api/leagues/${slug}/leaderboard?limit=100&period=${filter}`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: myPosition } = useQuery<MyPositionData>({
    queryKey: ["/api/leagues", slug, "my-position"],
    queryFn: async () => {
      const res = await fetch(`/api/leagues/${slug}/my-position`);
      if (!res.ok) throw new Error("Failed to load position");
      return res.json();
    },
    enabled: !!slug && !!user?.telegramId,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.league) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Лига не найдена</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { league, leaderboard, playerCount } = data;

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: league.themeColor }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{league.icon}</span>
              <h1 className="text-2xl font-bold">{league.nameRu}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/20 border-0 text-white">
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <div className="text-lg font-bold" data-testid="text-player-count">{playerCount}</div>
                <div className="text-xs opacity-80">Игроков</div>
              </div>
            </CardContent>
          </Card>
          {myPosition?.inLeague && (
            <Card className="bg-white/20 border-0 text-white">
              <CardContent className="p-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <div>
                  <div className="text-lg font-bold" data-testid="text-my-rank">#{myPosition.rank}</div>
                  <div className="text-xs opacity-80">Ваша позиция</div>
                </div>
              </CardContent>
            </Card>
          )}
          {!myPosition?.inLeague && user?.telegramId && (
            <Card className="bg-white/20 border-0 text-white">
              <CardContent className="p-3">
                <div className="text-sm opacity-80">Вы не в этой лиге</div>
              </CardContent>
            </Card>
          )}
          {!user?.telegramId && (
            <Card className="bg-white/20 border-0 text-white">
              <CardContent className="p-3">
                <div className="text-sm opacity-80">Войдите через Telegram</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-3 text-sm opacity-80">
          Требования: {league.minBeads.toLocaleString()} Beads
          {league.maxRank && ` и топ-${league.maxRank}`}
        </div>
      </div>

      <div className="p-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterPeriod)} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">
              {FILTER_LABELS.all}
            </TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-week">
              {FILTER_LABELS.week}
            </TabsTrigger>
            <TabsTrigger value="today" data-testid="tab-today">
              {FILTER_LABELS.today}
            </TabsTrigger>
            <TabsTrigger value="friends" data-testid="tab-friends" disabled={!user?.telegramId}>
              {FILTER_LABELS.friends}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {filter === 'friends' ? 'Рейтинг друзей' : `Топ-100 ${FILTER_LABELS[filter].toLowerCase()}`}
              {isFetching && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filter === 'friends' ? (
                  <div className="space-y-3">
                    <UserPlus className="w-12 h-12 mx-auto opacity-50" />
                    <p>У вас пока нет друзей</p>
                    <p className="text-sm">Пригласите друзей по реферальной ссылке</p>
                  </div>
                ) : filter === 'today' ? (
                  <p>Сегодня ещё никто не играл</p>
                ) : filter === 'week' ? (
                  <p>На этой неделе ещё нет игр</p>
                ) : (
                  <p>В этой лиге пока нет игроков</p>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.odoserId === user?.id;
                    const isTopThree = entry.rank <= 3;
                    
                    return (
                      <motion.div
                        key={entry.odoserId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isCurrentUser 
                            ? "bg-primary/10 border-primary shadow-md" 
                            : isTopThree 
                              ? "bg-gradient-to-r from-background to-muted/30 border-muted" 
                              : "hover:bg-muted/50"
                        }`}
                        data-testid={`leaderboard-entry-${entry.rank}`}
                      >
                        <div className="w-10 flex justify-center">
                          {getRankIcon(entry.rank) ? (
                            <div className="relative">
                              {getRankIcon(entry.rank)}
                              {isTopThree && (
                                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                              )}
                            </div>
                          ) : (
                            <span className={`font-bold text-lg ${
                              entry.rank <= 10 ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {entry.rank}
                            </span>
                          )}
                        </div>
                        
                        <div className="relative">
                          <Avatar 
                            className={`${isTopThree ? 'w-12 h-12 ring-2 ring-offset-2 ring-offset-background' : 'w-10 h-10'}`}
                            style={isTopThree ? { '--tw-ring-color': league.themeColor } as React.CSSProperties : undefined}
                          >
                            {entry.characterImageUrl ? (
                              <AvatarImage 
                                src={entry.characterImageUrl} 
                                alt=""
                                className="object-cover object-top"
                                data-testid={`img-character-${entry.rank}`}
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50">
                              <User className={`${isTopThree ? 'w-6 h-6' : 'w-5 h-5'} text-muted-foreground`} />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className={`font-semibold truncate ${isTopThree ? 'text-base' : 'text-sm'}`}
                              data-testid={`text-name-${entry.rank}`}
                            >
                              {entry.name}
                            </span>
                            {isCurrentUser && (
                              <Badge 
                                variant="default" 
                                className="text-[10px] px-1.5 py-0"
                                style={{ backgroundColor: league.themeColor }}
                              >
                                Вы
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>#{entry.rank} в рейтинге</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div 
                            className={`font-bold ${isTopThree ? 'text-lg' : 'text-base'}`}
                            style={{ color: league.themeColor }}
                            data-testid={`text-points-${entry.rank}`}
                          >
                            {entry.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            Beads
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
