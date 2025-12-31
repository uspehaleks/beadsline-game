import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Users, Crown, Medal, Award, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

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
  totalPoints: number;
  photoUrl: string | null;
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

export default function LeagueLeaderboard() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const slug = params.slug;

  const { data, isLoading } = useQuery<LeagueLeaderboardData>({
    queryKey: ["/api/leagues", slug, "leaderboard"],
    queryFn: async () => {
      const res = await fetch(`/api/leagues/${slug}/leaderboard?limit=100`);
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
                <div className="text-lg font-bold">{playerCount}</div>
                <div className="text-xs opacity-80">Игроков</div>
              </div>
            </CardContent>
          </Card>
          {myPosition?.inLeague && (
            <Card className="bg-white/20 border-0 text-white">
              <CardContent className="p-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <div>
                  <div className="text-lg font-bold">#{myPosition.rank}</div>
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
          Требования: {league.minBeads.toLocaleString()} бидов
          {league.maxRank && ` и топ-${league.maxRank}`}
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Топ-100 лиги
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                В этой лиге пока нет игроков
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.odoserId === user?.id;
                    return (
                      <div
                        key={entry.odoserId}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCurrentUser ? "bg-primary/10 border-primary" : ""
                        }`}
                        data-testid={`leaderboard-entry-${entry.rank}`}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(entry.rank) || (
                            <span className="text-muted-foreground font-medium">
                              {entry.rank}
                            </span>
                          )}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.photoUrl || undefined} />
                          <AvatarFallback>
                            {entry.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {entry.name}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Вы
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold" style={{ color: league.themeColor }}>
                            {entry.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">бидов</div>
                        </div>
                      </div>
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
