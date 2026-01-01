import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import type { User, GameConfig, PrizePool, GameScore, GameEconomyConfig, ReferralConfig, ReferralUserStats, Boost, HouseAccountConfig, RevenueSummary } from "@shared/schema";
import { 
  Users, 
  Users2,
  Trophy, 
  Settings, 
  Gift, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Shield,
  Gamepad2,
  TrendingUp,
  KeyRound,
  Loader2,
  Bot,
  RefreshCw,
  Link,
  CheckCircle,
  XCircle,
  Pencil,
  RotateCcw,
  Wallet,
  Bitcoin,
  Activity,
  UserPlus,
  Coins,
  Target,
  Wrench,
  Clock,
  Power,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Upload,
  ShoppingCart
} from "lucide-react";
import { SiEthereum, SiTether } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  activePrizePool: PrizePool | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

interface ScoresResponse {
  scores: GameScore[];
  total: number;
  limit: number;
  offset: number;
}

interface AdminCryptoBalances {
  btc: number;
  eth: number;
  usdt: number;
}

interface FundToggles {
  cryptoFundEnabled: boolean;
  usdtFundEnabled: boolean;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.isAdmin === true;

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: configs } = useQuery<GameConfig[]>({
    queryKey: ["/api/admin/configs"],
    enabled: isAdmin,
  });

  const { data: prizePools } = useQuery<PrizePool[]>({
    queryKey: ["/api/admin/prize-pools"],
    enabled: isAdmin,
  });

  const { data: scoresData } = useQuery<ScoresResponse>({
    queryKey: ["/api/admin/scores"],
    enabled: isAdmin,
  });

  const { data: cryptoBalances } = useQuery<AdminCryptoBalances>({
    queryKey: ["/api/admin/balances"],
    enabled: isAdmin,
  });

  const { data: activePlayers } = useQuery<{ count: number }>({
    queryKey: ["/api/active-players"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const { data: fundToggles } = useQuery<FundToggles>({
    queryKey: ["/api/admin/fund-toggles"],
    enabled: isAdmin,
  });

  const { data: houseAccount } = useQuery<HouseAccountConfig>({
    queryKey: ["/api/admin/house-account"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const { data: revenueSummary } = useQuery<RevenueSummary>({
    queryKey: ["/api/admin/revenue-summary"],
    enabled: isAdmin,
    refetchInterval: 10000,
  });

  const toggleFundMutation = useMutation({
    mutationFn: async (updates: Partial<FundToggles>) => {
      return apiRequest("PUT", "/api/admin/fund-toggles", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fund-toggles"] });
      toast({ title: "Сохранено", description: "Настройки фондов обновлены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить настройки", variant: "destructive" });
    },
  });

  const [loginUsername, setLoginUsername] = useState("alex851466");
  const [loginCode, setLoginCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const requestCodeMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/auth/admin/request-code", { username });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка запроса кода");
      }
      return res.json();
    },
    onSuccess: () => {
      setCodeSent(true);
      toast({
        title: "Запрос отправлен",
        description: "Если аккаунт существует, код будет доступен",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ username, code }: { username: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/admin/verify-code", { username, code });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка проверки кода");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в админ-панель",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <CardTitle>Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                disabled={codeSent}
                data-testid="input-admin-username"
              />
            </div>

            {!codeSent ? (
              <Button
                className="w-full"
                onClick={() => requestCodeMutation.mutate(loginUsername)}
                disabled={!loginUsername || requestCodeMutation.isPending}
                data-testid="button-request-code"
              >
                {requestCodeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                Получить код
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Код подтверждения</Label>
                  <Input
                    id="code"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="Введите 6-значный код"
                    maxLength={6}
                    data-testid="input-admin-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Код действителен 5 минут. Проверьте консоль сервера.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCodeSent(false);
                      setLoginCode("");
                    }}
                    data-testid="button-back-to-username"
                  >
                    Назад
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => verifyCodeMutation.mutate({ username: loginUsername, code: loginCode })}
                    disabled={loginCode.length !== 6 || verifyCodeMutation.isPending}
                    data-testid="button-verify-code"
                  >
                    {verifyCodeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Войти
                  </Button>
                </div>
              </>
            )}

            <Separator />

            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <p className="text-muted-foreground">Управление игрой</p>
          </div>
        </header>

        {statsLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <Activity className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Сейчас играют</p>
                    <p className="text-2xl font-bold" data-testid="text-active-players">
                      {activePlayers?.count ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего игроков</p>
                    <p className="text-2xl font-bold" data-testid="text-total-users">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего доход</p>
                    <div className="flex flex-col" data-testid="text-total-income">
                      <span className="text-lg font-bold flex items-center gap-1">
                        {revenueSummary?.totalSalesStars || 0} <span className="text-yellow-400">⭐</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${(revenueSummary?.totalSalesUsd || 0).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <Wallet className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">House Account</p>
                    <p className="text-2xl font-bold" data-testid="text-house-balance" style={{ color: '#00ff88' }}>
                      {(houseAccount?.balance || 0).toLocaleString()} <span className="text-base">Beads</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Доход от продаж Beads</p>
                    <p className="text-2xl font-bold text-green-500" data-testid="text-sales-income-top">
                      +{(houseAccount?.salesIncome || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Gift className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Выдано игрокам</p>
                    <p className="text-2xl font-bold text-orange-500" data-testid="text-distributed-top">
                      {(houseAccount?.totalDistributed || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего продаж</p>
                    <p className="text-2xl font-bold" data-testid="text-total-sales-top">
                      {revenueSummary?.salesCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stars: {revenueSummary?.starsSalesCount || 0} | Crypto: {revenueSummary?.cryptoSalesCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fund Toggle Controls */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium">Крипто-фонд</span>
                  </div>
                  <Switch
                    checked={fundToggles?.cryptoFundEnabled ?? false}
                    onCheckedChange={(checked) => toggleFundMutation.mutate({ cryptoFundEnabled: checked })}
                    disabled={toggleFundMutation.isPending}
                    data-testid="toggle-crypto-fund"
                  />
                  <Badge variant={fundToggles?.cryptoFundEnabled ? "default" : "secondary"}>
                    {fundToggles?.cryptoFundEnabled ? "ВКЛ" : "ВЫКЛ"}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <SiTether className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">USDT-фонд</span>
                  </div>
                  <Switch
                    checked={fundToggles?.usdtFundEnabled ?? false}
                    onCheckedChange={(checked) => toggleFundMutation.mutate({ usdtFundEnabled: checked })}
                    disabled={toggleFundMutation.isPending}
                    data-testid="toggle-usdt-fund"
                  />
                  <Badge variant={fundToggles?.usdtFundEnabled ? "default" : "secondary"}>
                    {fundToggles?.usdtFundEnabled ? "ВКЛ" : "ВЫКЛ"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Управление выдачей наград
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users" className="flex flex-col md:flex-row gap-4" orientation="vertical">
          <div className="md:w-48 flex-shrink-0">
            <TabsList className="flex flex-col h-auto w-full bg-muted/50 p-1 gap-1">
              <TabsTrigger value="users" data-testid="tab-users" className="w-full justify-start">
                <Users className="w-4 h-4 mr-1.5" />
                Игроки
              </TabsTrigger>
              <TabsTrigger value="balances" data-testid="tab-balances" className="w-full justify-start">
                <Wallet className="w-4 h-4 mr-1.5" />
                Фонд
              </TabsTrigger>
              <TabsTrigger value="usdt-fund" data-testid="tab-usdt-fund" className="w-full justify-start">
                <SiTether className="w-4 h-4 mr-1.5" />
                USDT
              </TabsTrigger>
              <TabsTrigger value="pools" data-testid="tab-pools" className="w-full justify-start">
                <Gift className="w-4 h-4 mr-1.5" />
                Призы
              </TabsTrigger>
              <TabsTrigger value="config" data-testid="tab-config" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-1.5" />
                Настройки
              </TabsTrigger>
              <TabsTrigger value="scores" data-testid="tab-scores" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-1.5" />
                Очки
              </TabsTrigger>
              <TabsTrigger value="telegram" data-testid="tab-telegram" className="w-full justify-start">
                <Bot className="w-4 h-4 mr-1.5" />
                Бот
              </TabsTrigger>
              <TabsTrigger value="beads-house" data-testid="tab-beads-house" className="w-full justify-start">
                <Coins className="w-4 h-4 mr-1.5" />
                Beads
              </TabsTrigger>
              <TabsTrigger value="transactions" data-testid="tab-transactions" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-1.5" />
                Транзакции
              </TabsTrigger>
              <TabsTrigger value="crypto-rewards" data-testid="tab-crypto-rewards" className="w-full justify-start">
                <Bitcoin className="w-4 h-4 mr-1.5" />
                Криптошарики
              </TabsTrigger>
              <TabsTrigger value="economy" data-testid="tab-economy" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Экономика
              </TabsTrigger>
              <TabsTrigger value="referrals" data-testid="tab-referrals" className="w-full justify-start">
                <Users2 className="w-4 h-4 mr-1.5" />
                Рефералы
              </TabsTrigger>
              <TabsTrigger value="maintenance" data-testid="tab-maintenance" className="w-full justify-start">
                <Wrench className="w-4 h-4 mr-1.5" />
                Обслуживание
              </TabsTrigger>
              <TabsTrigger value="gameplay" data-testid="tab-gameplay" className="w-full justify-start">
                <Gamepad2 className="w-4 h-4 mr-1.5" />
                Геймплей
              </TabsTrigger>
              <TabsTrigger value="debug-logs" data-testid="tab-debug-logs" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-1.5" />
                Логи
              </TabsTrigger>
              <TabsTrigger value="boosts" data-testid="tab-boosts" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Бусты
              </TabsTrigger>
              <TabsTrigger value="boost-packages" data-testid="tab-boost-packages" className="w-full justify-start">
                <Gift className="w-4 h-4 mr-1.5" />
                Пакеты бустов
              </TabsTrigger>
              <TabsTrigger value="accounting" data-testid="tab-accounting" className="w-full justify-start">
                <Coins className="w-4 h-4 mr-1.5" />
                Бухгалтерия
              </TabsTrigger>
              <TabsTrigger value="characters" data-testid="tab-characters" className="w-full justify-start">
                <Users className="w-4 h-4 mr-1.5" />
                Персонажи
              </TabsTrigger>
              <TabsTrigger value="leagues" data-testid="tab-leagues" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-1.5" />
                Лиги
              </TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications" className="w-full justify-start">
                <Bot className="w-4 h-4 mr-1.5" />
                Уведомления
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1">

          <TabsContent value="users">
            <UsersTab users={usersData?.users || []} total={usersData?.total || 0} />
          </TabsContent>

          <TabsContent value="balances">
            <CryptoBalancesTab balances={cryptoBalances || { btc: 0, eth: 0, usdt: 0 }} />
          </TabsContent>

          <TabsContent value="usdt-fund">
            <UsdtFundTab />
          </TabsContent>

          <TabsContent value="pools">
            <PrizePoolsTab pools={prizePools || []} />
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab configs={configs || []} />
          </TabsContent>

          <TabsContent value="scores">
            <ScoresTab scores={scoresData?.scores || []} total={scoresData?.total || 0} />
          </TabsContent>

          <TabsContent value="telegram">
            <TelegramTab />
          </TabsContent>

          <TabsContent value="beads-house">
            <BeadsHouseTab />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="crypto-rewards">
            <CryptoRewardsTab />
          </TabsContent>

          <TabsContent value="economy">
            <EconomyTab />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceTab />
          </TabsContent>

          <TabsContent value="gameplay">
            <GameplayTab />
          </TabsContent>
          <TabsContent value="debug-logs">
            <DebugLogsTab />
          </TabsContent>
          <TabsContent value="boosts">
            <BoostsTab />
          </TabsContent>
          <TabsContent value="boost-packages">
            <BoostPackagesTab />
          </TabsContent>
          <TabsContent value="accounting">
            <AccountingTab />
          </TabsContent>
          <TabsContent value="characters">
            <CharactersTab />
          </TabsContent>
          <TabsContent value="leagues">
            <LeaguesTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function CryptoBalancesTab({ balances }: { balances: AdminCryptoBalances }) {
  const { toast } = useToast();
  const [editBalances, setEditBalances] = useState(balances);

  const updateBalancesMutation = useMutation({
    mutationFn: async (newBalances: AdminCryptoBalances) => {
      return apiRequest("PUT", "/api/admin/balances", newBalances);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/balances"] });
      toast({ title: "Сохранено", description: "Балансы крипто-фонда обновлены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить балансы", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Крипто-фонд администратора
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Крипто-шарики в игре появляются только если баланс соответствующей монеты больше 0
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-amber-500" />
              BTC баланс
            </Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={editBalances.btc}
              onChange={(e) => setEditBalances({ ...editBalances, btc: parseFloat(e.target.value) || 0 })}
              data-testid="input-btc-balance"
            />
            <p className="text-xs text-muted-foreground">
              {balances.btc > 0 ? "BTC-шарики активны" : "BTC-шарики отключены"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <SiEthereum className="w-5 h-5 text-blue-500" />
              ETH баланс
            </Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={editBalances.eth}
              onChange={(e) => setEditBalances({ ...editBalances, eth: parseFloat(e.target.value) || 0 })}
              data-testid="input-eth-balance"
            />
            <p className="text-xs text-muted-foreground">
              {balances.eth > 0 ? "ETH-шарики активны" : "ETH-шарики отключены"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <SiTether className="w-5 h-5 text-green-500" />
              USDT баланс
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editBalances.usdt}
              onChange={(e) => setEditBalances({ ...editBalances, usdt: parseFloat(e.target.value) || 0 })}
              data-testid="input-usdt-balance"
            />
            <p className="text-xs text-muted-foreground">
              {balances.usdt > 0 ? "USDT-шарики активны" : "USDT-шарики отключены"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => updateBalancesMutation.mutate(editBalances)}
          disabled={updateBalancesMutation.isPending}
          data-testid="button-save-balances"
        >
          {updateBalancesMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Сохранить балансы
        </Button>
      </CardContent>
    </Card>
  );
}

interface UsdtFundSettingsData {
  usdtTotalFund: number;
  usdtAvailable: number;
  usdtDailyLimit: number;
  usdtPerDrop: number;
  usdtMaxPerUserPerDay: number;
  usdtDistributedToday: number;
  lastResetDate: string;
}

interface UsdtFundStatsResponse {
  settings: UsdtFundSettingsData | null;
  totalDistributed: number;
  distributedToday: number;
}

function UsdtFundTab() {
  const { toast } = useToast();
  const [editSettings, setEditSettings] = useState({
    usdtTotalFund: 0,
    usdtAvailable: 0,
    usdtDailyLimit: 1.0,
    usdtPerDrop: 0.02,
    usdtMaxPerUserPerDay: 0.1,
  });

  const { data: fundStats, isLoading } = useQuery<UsdtFundStatsResponse>({
    queryKey: ["/api/admin/usdt-fund/stats"],
  });

  const { data: fundResponse } = useQuery<UsdtFundStatsResponse>({
    queryKey: ["/api/admin/usdt-fund"],
  });

  useEffect(() => {
    const settings = fundResponse?.settings || fundStats?.settings;
    if (settings) {
      setEditSettings({
        usdtTotalFund: settings.usdtTotalFund ?? 0,
        usdtAvailable: settings.usdtAvailable ?? 0,
        usdtDailyLimit: settings.usdtDailyLimit ?? 1.0,
        usdtPerDrop: settings.usdtPerDrop ?? 0.02,
        usdtMaxPerUserPerDay: settings.usdtMaxPerUserPerDay ?? 0.1,
      });
    }
  }, [fundResponse, fundStats]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: typeof editSettings) => {
      return apiRequest("PUT", "/api/admin/usdt-fund", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/usdt-fund"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/usdt-fund/stats"] });
      toast({ title: "Сохранено", description: "Настройки USDT-фонда обновлены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить настройки", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const settings = fundResponse?.settings || fundStats?.settings;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SiTether className="w-5 h-5 text-green-500" />
            Статистика USDT-фонда
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Общий фонд</p>
              <p className="text-2xl font-bold" data-testid="text-usdt-total">
                ${(settings?.usdtTotalFund ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Доступно</p>
              <p className="text-2xl font-bold text-green-500" data-testid="text-usdt-available">
                ${(settings?.usdtAvailable ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Выдано сегодня</p>
              <p className="text-2xl font-bold text-amber-500" data-testid="text-usdt-today">
                ${(fundStats?.distributedToday ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                лимит: ${(settings?.usdtDailyLimit ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Всего выдано</p>
              <p className="text-2xl font-bold text-blue-500" data-testid="text-usdt-total-distributed">
                ${(fundStats?.totalDistributed ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки USDT-фонда
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройте параметры выдачи реальных USDT-наград игрокам
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="usdt-total">Общий фонд (USDT)</Label>
              <Input
                id="usdt-total"
                type="number"
                min="0"
                step="1"
                value={editSettings.usdtTotalFund}
                onChange={(e) => setEditSettings({ ...editSettings, usdtTotalFund: parseFloat(e.target.value) || 0 })}
                data-testid="input-usdt-total-fund"
              />
              <p className="text-xs text-muted-foreground">Общая сумма фонда для выдачи наград</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdt-available">Доступно (USDT)</Label>
              <Input
                id="usdt-available"
                type="number"
                min="0"
                step="0.01"
                value={editSettings.usdtAvailable}
                onChange={(e) => setEditSettings({ ...editSettings, usdtAvailable: parseFloat(e.target.value) || 0 })}
                data-testid="input-usdt-available"
              />
              <p className="text-xs text-muted-foreground">Остаток для распределения</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdt-daily">Дневной лимит (USDT)</Label>
              <Input
                id="usdt-daily"
                type="number"
                min="0"
                step="0.1"
                value={editSettings.usdtDailyLimit}
                onChange={(e) => setEditSettings({ ...editSettings, usdtDailyLimit: parseFloat(e.target.value) || 0 })}
                data-testid="input-usdt-daily-limit"
              />
              <p className="text-xs text-muted-foreground">Максимум USDT в день для всех игроков</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdt-per-drop">Награда за шарик (USDT)</Label>
              <Input
                id="usdt-per-drop"
                type="number"
                min="0"
                step="0.001"
                value={editSettings.usdtPerDrop}
                onChange={(e) => setEditSettings({ ...editSettings, usdtPerDrop: parseFloat(e.target.value) || 0 })}
                data-testid="input-usdt-per-drop"
              />
              <p className="text-xs text-muted-foreground">USDT за каждый собранный USDT-шарик</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdt-per-user">Лимит на игрока/день (USDT)</Label>
              <Input
                id="usdt-per-user"
                type="number"
                min="0"
                step="0.01"
                value={editSettings.usdtMaxPerUserPerDay}
                onChange={(e) => setEditSettings({ ...editSettings, usdtMaxPerUserPerDay: parseFloat(e.target.value) || 0 })}
                data-testid="input-usdt-per-user"
              />
              <p className="text-xs text-muted-foreground">Максимум USDT в день для одного игрока</p>
            </div>
          </div>
          <Button
            onClick={() => updateSettingsMutation.mutate(editSettings)}
            disabled={updateSettingsMutation.isPending}
            data-testid="button-save-usdt-settings"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Сохранить настройки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab({ users, total }: { users: User[]; total: number }) {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ 
    username: "", 
    totalPoints: 0, 
    gamesPlayed: 0, 
    bestScore: 0,
    btcBalanceSats: 0,
    ethBalanceWei: 0,
    usdtBalance: 0,
    referredBy: "",
  });

  const { data: userTransactions, isLoading: txLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/admin/transactions", "user", editingUser?.username],
    queryFn: async () => {
      if (!editingUser) return { transactions: [], total: 0, limit: 10, offset: 0 };
      const params = new URLSearchParams({
        limit: "10",
        offset: "0",
        search: editingUser.username,
      });
      const res = await fetch(`/api/admin/transactions?${params}`);
      return res.json();
    },
    enabled: !!editingUser,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Обновлено", description: "Статус администратора изменён" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, unknown> }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}`, updates);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Обновлено", description: "Данные пользователя сохранены" });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не удалось удалить пользователя");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Удалено", description: "Пользователь полностью удалён из базы данных" });
    },
    onError: (error: Error) => {
      toast({ title: "Защита от удаления", description: error.message, variant: "destructive" });
    },
  });

  const resetLevelsMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/reset-levels`);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Готово", description: "Уровни пользователя сброшены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сбросить уровни", variant: "destructive" });
    },
  });

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      totalPoints: user.totalPoints,
      gamesPlayed: user.gamesPlayed,
      bestScore: user.bestScore,
      btcBalanceSats: (user as User & { btcBalanceSats?: number }).btcBalanceSats || 0,
      ethBalanceWei: (user as User & { ethBalanceWei?: number }).ethBalanceWei || 0,
      usdtBalance: (user as User & { usdtBalance?: number }).usdtBalance || 0,
      referredBy: (user as User & { referredBy?: string | null }).referredBy || "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Игроки ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                data-testid={`user-row-${user.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{user.totalPoints} Beads</span>
                      <span>•</span>
                      <span>{user.gamesPlayed} игр</span>
                      <span>•</span>
                      <span>Лучший: {user.bestScore}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                        <Bitcoin className="w-3 h-3" />
                        {((user as User & { btcBalanceSats?: number }).btcBalanceSats ?? 0).toLocaleString()} sat
                      </span>
                      <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                        <SiEthereum className="w-3 h-3" />
                        {((user as User & { ethBalanceWei?: number }).ethBalanceWei ?? 0).toLocaleString()} gwei
                      </span>
                      <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                        <SiTether className="w-3 h-3" />
                        ${Number((user as User & { usdtBalance?: number }).usdtBalance ?? 0).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin && <Badge variant="secondary">Админ</Badge>}
                  <Switch
                    checked={user.isAdmin}
                    onCheckedChange={(isAdmin) =>
                      toggleAdminMutation.mutate({ userId: user.id, isAdmin })
                    }
                    disabled={toggleAdminMutation.isPending}
                    data-testid={`toggle-admin-${user.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(user)}
                    data-testid={`edit-user-${user.id}`}
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Сбросить уровни для ${user.username}?`)) {
                        resetLevelsMutation.mutate(user.id);
                      }
                    }}
                    disabled={resetLevelsMutation.isPending}
                    data-testid={`reset-levels-${user.id}`}
                    title="Сбросить уровни"
                  >
                    <RotateCcw className="w-4 h-4 text-orange-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUserMutation.mutate(user.id)}
                    disabled={deleteUserMutation.isPending}
                    data-testid={`delete-user-${user.id}`}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-username">Имя пользователя</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                data-testid="input-edit-username"
              />
            </div>
            <div>
              <Label htmlFor="edit-points">Очки</Label>
              <Input
                id="edit-points"
                type="number"
                value={editForm.totalPoints}
                onChange={(e) => setEditForm({ ...editForm, totalPoints: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-points"
              />
            </div>
            <div>
              <Label htmlFor="edit-games">Игр сыграно</Label>
              <Input
                id="edit-games"
                type="number"
                value={editForm.gamesPlayed}
                onChange={(e) => setEditForm({ ...editForm, gamesPlayed: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-games"
              />
            </div>
            <div>
              <Label htmlFor="edit-best">Лучший результат</Label>
              <Input
                id="edit-best"
                type="number"
                value={editForm.bestScore}
                onChange={(e) => setEditForm({ ...editForm, bestScore: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-best"
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="edit-sponsor" className="flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                Спонсор (реферальный код)
              </Label>
              <Input
                id="edit-sponsor"
                value={editForm.referredBy}
                onChange={(e) => setEditForm({ ...editForm, referredBy: e.target.value })}
                placeholder="Введите реферальный код спонсора"
                data-testid="input-edit-sponsor"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Оставьте пустым для удаления спонсора
              </p>
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Крипто-балансы игрока</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="edit-btc" className="flex items-center gap-1 text-xs">
                  <Bitcoin className="w-3 h-3 text-amber-500" />
                  BTC (sat)
                </Label>
                <Input
                  id="edit-btc"
                  type="number"
                  step="1"
                  value={editForm.btcBalanceSats}
                  onChange={(e) => setEditForm({ ...editForm, btcBalanceSats: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-btc"
                />
              </div>
              <div>
                <Label htmlFor="edit-eth" className="flex items-center gap-1 text-xs">
                  <SiEthereum className="w-3 h-3 text-blue-500" />
                  ETH (gwei)
                </Label>
                <Input
                  id="edit-eth"
                  type="number"
                  step="1"
                  value={editForm.ethBalanceWei}
                  onChange={(e) => setEditForm({ ...editForm, ethBalanceWei: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-eth"
                />
              </div>
              <div>
                <Label htmlFor="edit-usdt" className="flex items-center gap-1 text-xs">
                  <SiTether className="w-3 h-3 text-green-500" />
                  USDT
                </Label>
                <Input
                  id="edit-usdt"
                  type="number"
                  step="0.01"
                  value={editForm.usdtBalance}
                  onChange={(e) => setEditForm({ ...editForm, usdtBalance: parseFloat(e.target.value) || 0 })}
                  data-testid="input-edit-usdt"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (editingUser) {
                  updateUserMutation.mutate({ userId: editingUser.id, updates: editForm });
                }
              }}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить
            </Button>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Последние транзакции ({userTransactions?.total || 0})
              </p>
              {txLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : userTransactions?.transactions && userTransactions.transactions.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {userTransactions.transactions.map((tx) => {
                      const typeLabels: Record<string, { label: string; color: string }> = {
                        game_win_reward: { label: "Победа", color: "bg-green-500/20 text-green-500" },
                        buy_extra_life: { label: "Жизнь", color: "bg-blue-500/20 text-blue-500" },
                        referral_reward: { label: "Реферал", color: "bg-purple-500/20 text-purple-500" },
                        admin_adjustment: { label: "Админ", color: "bg-amber-500/20 text-amber-500" },
                        house_deposit: { label: "Пополнение", color: "bg-cyan-500/20 text-cyan-500" },
                      };
                      const typeInfo = typeLabels[tx.type] || { label: tx.type, color: "bg-muted" };
                      return (
                        <div key={tx.id} className="p-2 border rounded text-xs">
                          <div className="flex items-center justify-between">
                            <Badge className={`${typeInfo.color} text-[10px]`}>{typeInfo.label}</Badge>
                            <span className={tx.amount >= 0 ? "text-green-500" : "text-red-500"}>
                              {tx.amount >= 0 ? "+" : ""}{tx.amount}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-1 truncate">
                            {tx.description || "—"}
                          </div>
                          <div className="text-muted-foreground mt-0.5">
                            {new Date(tx.createdAt).toLocaleString("ru-RU", {
                              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Транзакции не найдены
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PrizePoolsTab({ pools }: { pools: PrizePool[] }) {
  const { toast } = useToast();
  const [newPool, setNewPool] = useState({ name: "", totalAmount: 0, isActive: false });
  const [dialogOpen, setDialogOpen] = useState(false);

  const createPoolMutation = useMutation({
    mutationFn: async (pool: { name: string; totalAmount: number; isActive: boolean }) => {
      return apiRequest("POST", "/api/admin/prize-pools", pool);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Создано", description: "Призовой фонд успешно создан" });
      setDialogOpen(false);
      setNewPool({ name: "", totalAmount: 0, isActive: false });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать фонд", variant: "destructive" });
    },
  });

  const updatePoolMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; isActive?: boolean; totalAmount?: number }) => {
      return apiRequest("PATCH", `/api/admin/prize-pools/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Обновлено", description: "Призовой фонд успешно обновлён" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить фонд", variant: "destructive" });
    },
  });

  const deletePoolMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/prize-pools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Удалено", description: "Призовой фонд успешно удалён" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить фонд", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Призовые фонды ({pools.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-pool">
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать призовой фонд</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="pool-name">Название</Label>
                <Input
                  id="pool-name"
                  value={newPool.name}
                  onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                  placeholder="Недельный призовой фонд"
                  data-testid="input-pool-name"
                />
              </div>
              <div>
                <Label htmlFor="pool-amount">Сумма</Label>
                <Input
                  id="pool-amount"
                  type="number"
                  value={newPool.totalAmount}
                  onChange={(e) => setNewPool({ ...newPool, totalAmount: parseInt(e.target.value) || 0 })}
                  placeholder="1000"
                  data-testid="input-pool-amount"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pool-active">Активен</Label>
                <Switch
                  id="pool-active"
                  checked={newPool.isActive}
                  onCheckedChange={(isActive) => setNewPool({ ...newPool, isActive })}
                  data-testid="switch-pool-active"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createPoolMutation.mutate(newPool)}
                disabled={!newPool.name || createPoolMutation.isPending}
                data-testid="button-create-pool"
              >
                <Save className="w-4 h-4 mr-2" />
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {pools.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Пока нет призовых фондов</p>
            ) : (
              pools.map((pool) => (
                <div
                  key={pool.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`pool-row-${pool.id}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{pool.name}</p>
                      {pool.isActive && <Badge className="bg-green-500">Активен</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Сумма: {pool.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pool.isActive}
                      onCheckedChange={(isActive) =>
                        updatePoolMutation.mutate({ id: pool.id, isActive })
                      }
                      disabled={updatePoolMutation.isPending}
                      data-testid={`toggle-pool-${pool.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePoolMutation.mutate(pool.id)}
                      disabled={deletePoolMutation.isPending}
                      data-testid={`delete-pool-${pool.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SignupBonusCard({ configs }: { configs: GameConfig[] }) {
  const { toast } = useToast();
  const signupBonusConfig = configs.find(c => c.key === 'signup_bonus');
  const config = signupBonusConfig?.value as { enabled: boolean; amount: number; endDate: string } | undefined;
  
  const [enabled, setEnabled] = useState(config?.enabled ?? false);
  const [amount, setAmount] = useState(config?.amount?.toString() ?? '150');
  const [endDate, setEndDate] = useState(config?.endDate?.split('T')[0] ?? '');
  
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setAmount(config.amount.toString());
      setEndDate(config.endDate.split('T')[0]);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig: { enabled: boolean; amount: number; endDate: string }) => {
      return apiRequest("POST", "/api/admin/configs", {
        key: 'signup_bonus',
        value: newConfig,
        description: 'Бонус Beads при первой регистрации (акция)'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Сохранено", description: "Настройки акции обновлены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить настройки", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({ title: "Ошибка", description: "Укажите корректную сумму бонуса", variant: "destructive" });
      return;
    }
    if (!endDate) {
      toast({ title: "Ошибка", description: "Укажите дату окончания акции", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      enabled,
      amount: parsedAmount,
      endDate: `${endDate}T23:59:59.000Z`
    });
  };

  const isExpired = endDate && new Date(`${endDate}T23:59:59.000Z`) < new Date();
  const parsedAmount = parseInt(amount) || 0;
  const isValid = parsedAmount > 0 && endDate;

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          Приветственный бонус
          {enabled && !isExpired && isValid && (
            <Badge variant="default" className="bg-green-500">Активна</Badge>
          )}
          {enabled && !isValid && (
            <Badge variant="outline" className="border-amber-500 text-amber-500">Не настроена</Badge>
          )}
          {isExpired && (
            <Badge variant="destructive">Истекла</Badge>
          )}
        </CardTitle>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          data-testid="toggle-signup-bonus"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Новые пользователи получат бонус Beads при первой регистрации
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bonus-amount">Сумма бонуса *</Label>
            <Input
              id="bonus-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150"
              data-testid="input-bonus-amount"
            />
          </div>
          <div>
            <Label htmlFor="bonus-end-date">Дата окончания *</Label>
            <Input
              id="bonus-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-bonus-end-date"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || !isValid}
          className="w-full"
          data-testid="button-save-signup-bonus"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

function ConfigTab({ configs }: { configs: GameConfig[] }) {
  const { toast } = useToast();
  const [newConfig, setNewConfig] = useState({ key: "", value: "", description: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const createConfigMutation = useMutation({
    mutationFn: async (config: { key: string; value: string; description: string }) => {
      let parsedValue: unknown = config.value;
      try {
        parsedValue = JSON.parse(config.value);
      } catch {
        // Keep as string if not valid JSON
      }
      return apiRequest("POST", "/api/admin/configs", { ...config, value: parsedValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Сохранено", description: "Настройка успешно сохранена" });
      setDialogOpen(false);
      setNewConfig({ key: "", value: "", description: "" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить настройку", variant: "destructive" });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (key: string) => {
      return apiRequest("DELETE", `/api/admin/configs/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Удалено", description: "Настройка успешно удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить настройку", variant: "destructive" });
    },
  });

  // Filter out signup_bonus from general configs since it has its own card
  const otherConfigs = configs.filter(c => c.key !== 'signup_bonus');

  return (
    <div className="space-y-4">
      <SignupBonusCard configs={configs} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки игры ({otherConfigs.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-config">
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить настройку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="config-key">Ключ</Label>
                <Input
                  id="config-key"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                  placeholder="crypto_spawn_rate"
                  data-testid="input-config-key"
                />
              </div>
              <div>
                <Label htmlFor="config-value">Значение (JSON или строка)</Label>
                <Input
                  id="config-value"
                  value={newConfig.value}
                  onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                  placeholder='0.08 или {"rate": 0.08}'
                  data-testid="input-config-value"
                />
              </div>
              <div>
                <Label htmlFor="config-desc">Описание</Label>
                <Input
                  id="config-desc"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  placeholder="Частота появления крипто-шариков"
                  data-testid="input-config-desc"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createConfigMutation.mutate(newConfig)}
                disabled={!newConfig.key || !newConfig.value || createConfigMutation.isPending}
                data-testid="button-create-config"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {otherConfigs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Пока нет настроек</p>
            ) : (
              otherConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`config-row-${config.key}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium truncate">{config.key}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {JSON.stringify(config.value)}
                    </p>
                    {config.description && (
                      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteConfigMutation.mutate(config.key)}
                    disabled={deleteConfigMutation.isPending}
                    data-testid={`delete-config-${config.key}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      </Card>
    </div>
  );
}

function ScoresTab({ scores, total }: { scores: GameScore[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Последние результаты ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {scores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Пока нет результатов</p>
            ) : (
              scores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`score-row-${score.id}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{score.score}</span>
                      {score.won && <Badge className="bg-green-500">Победа</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Комбо: x{score.maxCombo}</span>
                      <span>Время: {score.duration}с</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline" className="text-amber-500 border-amber-500">
                        BTC: {score.cryptoBtc}
                      </Badge>
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        ETH: {score.cryptoEth}
                      </Badge>
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        USDT: {score.cryptoUsdt}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface TelegramBotInfo {
  bot: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
  webhook: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    allowed_updates?: string[];
  };
  appUrl: string;
}

function TelegramTab() {
  const { toast } = useToast();
  const [customWebhookUrl, setCustomWebhookUrl] = useState("");
  const [useCustomUrl, setUseCustomUrl] = useState(false);

  const { data: botInfo, isLoading: infoLoading, refetch: refetchInfo } = useQuery<TelegramBotInfo>({
    queryKey: ["/api/telegram/info"],
  });

  const setupWebhookMutation = useMutation({
    mutationFn: async (customUrl?: string) => {
      const res = await apiRequest("POST", "/api/telegram/setup-webhook", {
        customUrl: customUrl || undefined
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка настройки webhook");
      }
      return res.json();
    },
    onSuccess: (data) => {
      refetchInfo();
      if (data.success) {
        toast({
          title: "Webhook настроен",
          description: "Бот готов к работе!",
        });
      } else {
        toast({
          title: "Частичная настройка",
          description: "Некоторые настройки не применились",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isWebhookConfigured = botInfo?.webhook?.url && botInfo.webhook.url.includes("/api/telegram/webhook");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Telegram бот
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchInfo()}
          disabled={infoLoading}
          data-testid="button-refresh-bot-info"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${infoLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {infoLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : botInfo ? (
          <>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Информация о боте
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Имя:</span>
                    <span className="font-medium">{botInfo.bot?.first_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium">
                      {botInfo.bot?.username ? (
                        <a 
                          href={`https://t.me/${botInfo.bot.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          @{botInfo.bot.username}
                        </a>
                      ) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono">{botInfo.bot?.id || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Webhook
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Статус:</span>
                    <span className="flex items-center gap-1">
                      {isWebhookConfigured ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">Настроен</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-destructive">Не настроен</span>
                        </>
                      )}
                    </span>
                  </div>
                  {botInfo.webhook?.url && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {botInfo.webhook.url}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ожидающие:</span>
                    <span>{botInfo.webhook?.pending_update_count || 0}</span>
                  </div>
                  {botInfo.webhook?.last_error_message && (
                    <div className="p-2 bg-destructive/10 rounded text-destructive text-xs">
                      Ошибка: {botInfo.webhook.last_error_message}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50">
                <h3 className="font-medium mb-2">URL приложения</h3>
                <p className="text-sm font-mono break-all">{botInfo.appUrl}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Использовать свой URL
                </Label>
                <Switch
                  checked={useCustomUrl}
                  onCheckedChange={setUseCustomUrl}
                  data-testid="switch-custom-url"
                />
              </div>
              
              {useCustomUrl && (
                <div className="space-y-2 mb-3">
                  <Input
                    placeholder="https://your-app.replit.app"
                    value={customWebhookUrl}
                    onChange={(e) => setCustomWebhookUrl(e.target.value)}
                    data-testid="input-custom-webhook-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Укажите production URL вашего приложения (без /api/telegram/webhook)
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mb-3">
                {useCustomUrl 
                  ? `Webhook будет: ${customWebhookUrl || '...'}/api/telegram/webhook`
                  : `Webhook будет: ${botInfo?.appUrl || '...'}/api/telegram/webhook`
                }
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setupWebhookMutation.mutate(useCustomUrl ? customWebhookUrl : undefined)}
                disabled={setupWebhookMutation.isPending || (useCustomUrl && !customWebhookUrl.trim())}
                data-testid="button-setup-webhook"
              >
                {setupWebhookMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isWebhookConfigured ? "Переустановить Webhook" : "Настроить Webhook"}
              </Button>

              {botInfo.bot?.username && (
                <Button
                  variant="outline"
                  asChild
                  data-testid="button-open-bot"
                >
                  <a
                    href={`https://t.me/${botInfo.bot.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Открыть бота
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium">Инструкция по настройке</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Нажмите кнопку "Настроить Webhook" выше</li>
                <li>Откройте бота в Telegram и отправьте /start</li>
                <li>Бот будет отправлять кнопку для запуска Mini App</li>
                <li>
                  Для настройки Mini App в BotFather:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Отправьте /mybots в @BotFather</li>
                    <li>Выберите вашего бота</li>
                    <li>Bot Settings → Menu Button</li>
                    <li>Настройте URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">{botInfo.appUrl}</code></li>
                  </ul>
                </li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
            <p>Не удалось получить информацию о боте</p>
            <p className="text-sm">Проверьте настройки TELEGRAM_BOT_TOKEN</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface HouseAccountData {
  balance: number;
  salesIncome: number;
  totalDistributed: number;
  lastUpdated: string;
}

interface LivesConfigData {
  livesPerGame: number;
  extraLifeCost: number;
  extraLifeSeconds: number;
  maxExtraLives: number;
}

interface TransactionData {
  id: string;
  userId: string | null;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  houseBalanceBefore: number | null;
  houseBalanceAfter: number | null;
  description: string | null;
  gameScoreId: string | null;
  createdAt: string;
  username?: string;
  cryptoBtc?: number;
  cryptoEth?: number;
  cryptoUsdt?: number;
}

interface TransactionsResponse {
  transactions: TransactionData[];
  total: number;
  limit: number;
  offset: number;
}

interface CryptoRewardData {
  id: string;
  userId: string;
  cryptoType: string;
  amount: number;
  gameScoreId: string | null;
  createdAt: string;
  username?: string;
  cryptoBtc?: number;
  cryptoEth?: number;
  cryptoUsdt?: number;
}

interface CryptoRewardsResponse {
  rewards: CryptoRewardData[];
  total: number;
  limit: number;
  offset: number;
}

const TRANSACTION_TYPES = [
  { value: "all", label: "Все типы" },
  { value: "game_win_reward", label: "Победа" },
  { value: "buy_extra_life", label: "Покупка жизни" },
  { value: "referral_reward", label: "Реферал" },
  { value: "admin_adjustment", label: "Админ" },
  { value: "house_deposit", label: "Пополнение" },
];

function TransactionsTab() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);
  const perPage = 20;

  const { data, isLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/admin/transactions", page, type, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: perPage.toString(),
        offset: (page * perPage).toString(),
      });
      if (type !== "all") params.set("type", type);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/transactions?${params}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({ title: "Готово", description: "Транзакция удалена" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить транзакцию", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setPage(0);
  };

  const totalPages = data ? Math.ceil(data.total / perPage) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (txType: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      game_win_reward: { label: "Победа", color: "bg-green-500/20 text-green-500" },
      buy_extra_life: { label: "Покупка жизни", color: "bg-blue-500/20 text-blue-500" },
      referral_reward: { label: "Реферал", color: "bg-purple-500/20 text-purple-500" },
      admin_adjustment: { label: "Админ", color: "bg-amber-500/20 text-amber-500" },
      house_deposit: { label: "Пополнение", color: "bg-cyan-500/20 text-cyan-500" },
    };
    return labels[txType] || { label: txType, color: "bg-muted text-muted-foreground" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Журнал транзакций Beads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Поиск по логину..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
              data-testid="input-tx-search"
            />
            <Button onClick={handleSearch} size="icon" data-testid="button-tx-search">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-tx-type">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Найдено: {data?.total || 0} транзакций
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {data?.transactions.map((tx) => {
                  const typeInfo = getTypeLabel(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="p-3 border rounded-lg space-y-2"
                      data-testid={`row-tx-${tx.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          <span className="font-medium">
                            @{tx.username || "—"}
                          </span>
                        </div>
                        <span className={`font-bold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {tx.amount >= 0 ? "+" : ""}{tx.amount} Beads
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tx.description || "Без описания"}
                      </div>
                      {tx.gameScoreId && (tx.cryptoBtc || tx.cryptoEth || tx.cryptoUsdt) ? (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-muted-foreground">Шарики:</span>
                          {tx.cryptoBtc ? (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                              <Bitcoin className="w-3 h-3 mr-1" />
                              {tx.cryptoBtc}
                            </Badge>
                          ) : null}
                          {tx.cryptoEth ? (
                            <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                              <SiEthereum className="w-3 h-3 mr-1" />
                              {tx.cryptoEth}
                            </Badge>
                          ) : null}
                          {tx.cryptoUsdt ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30">
                              <SiTether className="w-3 h-3 mr-1" />
                              {tx.cryptoUsdt}
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Баланс: {tx.balanceBefore} → {tx.balanceAfter}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatDate(tx.createdAt)}</span>
                          {!(tx as any).deletedAt && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => setDeleteTarget({ id: tx.id, desc: tx.description || tx.type })}
                              data-testid={`button-delete-tx-${tx.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                          {(tx as any).deletedAt && (
                            <Badge variant="outline" className="text-red-500 border-red-500/30">
                              Удалено
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!data?.transactions || data.transactions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Транзакции не найдены
                  </div>
                )}
              </div>
            </ScrollArea>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  data-testid="button-tx-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  data-testid="button-tx-next"
                >
                  Далее
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить транзакцию?</DialogTitle>
              <DialogDescription>
                {deleteTarget?.desc}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Отмена
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete-tx"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Удалить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

const CRYPTO_TYPES = [
  { value: "all", label: "Все типы" },
  { value: "btc", label: "BTC" },
  { value: "eth", label: "ETH" },
  { value: "usdt", label: "USDT" },
];

function CryptoRewardsTab() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [cryptoType, setCryptoType] = useState("all");
  const perPage = 20;

  const { data, isLoading } = useQuery<CryptoRewardsResponse>({
    queryKey: ["/api/admin/crypto-rewards", page, cryptoType, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: perPage.toString(),
        offset: (page * perPage).toString(),
      });
      if (cryptoType !== "all") params.set("cryptoType", cryptoType);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/crypto-rewards?${params}`);
      return res.json();
    },
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setCryptoType(value);
    setPage(0);
  };

  const totalPages = data ? Math.ceil(data.total / perPage) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCryptoLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string; icon: any }> = {
      btc: { label: "BTC", color: "bg-amber-500/20 text-amber-500", icon: Bitcoin },
      eth: { label: "ETH", color: "bg-blue-500/20 text-blue-500", icon: SiEthereum },
      usdt: { label: "USDT", color: "bg-green-500/20 text-green-500", icon: SiTether },
    };
    return labels[type.toLowerCase()] || { label: type, color: "bg-muted text-muted-foreground", icon: Coins };
  };

  const formatAmount = (type: string, amount: number) => {
    switch (type.toLowerCase()) {
      case "btc":
        return `${(amount * 100000000).toFixed(2)} sat`;
      case "eth":
        return `${(amount * 1000000000).toFixed(2)} gwei`;
      case "usdt":
        return `$${amount.toFixed(4)}`;
      default:
        return amount.toString();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Крипто-награды
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Поиск по логину..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
              data-testid="input-crypto-search"
            />
            <Button onClick={handleSearch} size="icon" data-testid="button-crypto-search">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Select value={cryptoType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-crypto-type">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              {CRYPTO_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Найдено: {data?.total || 0} наград
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {data?.rewards.map((reward) => {
                  const typeInfo = getCryptoLabel(reward.cryptoType);
                  const Icon = typeInfo.icon;
                  return (
                    <div
                      key={reward.id}
                      className="p-3 border rounded-lg"
                      data-testid={`row-crypto-${reward.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={typeInfo.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                          <span className="font-medium">
                            @{reward.username || "—"}
                          </span>
                        </div>
                        <span className="font-bold text-green-500">
                          +{formatAmount(reward.cryptoType, reward.amount)}
                        </span>
                      </div>
                      {reward.gameScoreId && (reward.cryptoBtc || reward.cryptoEth || reward.cryptoUsdt) ? (
                        <div className="flex items-center gap-2 text-xs mt-2">
                          <span className="text-muted-foreground">Шарики в игре:</span>
                          {reward.cryptoBtc ? (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                              <Bitcoin className="w-3 h-3 mr-1" />
                              {reward.cryptoBtc}
                            </Badge>
                          ) : null}
                          {reward.cryptoEth ? (
                            <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                              <SiEthereum className="w-3 h-3 mr-1" />
                              {reward.cryptoEth}
                            </Badge>
                          ) : null}
                          {reward.cryptoUsdt ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30">
                              <SiTether className="w-3 h-3 mr-1" />
                              {reward.cryptoUsdt}
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>Game: {reward.gameScoreId?.slice(0, 8) || "—"}...</span>
                        <span>{formatDate(reward.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                {(!data?.rewards || data.rewards.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Крипто-награды не найдены
                  </div>
                )}
              </div>
            </ScrollArea>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  data-testid="button-crypto-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  data-testid="button-crypto-next"
                >
                  Далее
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BeadsHouseTab() {
  const { toast } = useToast();
  const [txPage, setTxPage] = useState(0);
  const [txSearch, setTxSearch] = useState("");
  const [txSearchInput, setTxSearchInput] = useState("");
  const [txType, setTxType] = useState("all");
  const txPerPage = 15;

  const { data: houseAccount, isLoading: houseLoading } = useQuery<HouseAccountData>({
    queryKey: ["/api/admin/house-account"],
  });

  const { data: livesConfig, isLoading: livesLoading } = useQuery<LivesConfigData>({
    queryKey: ["/api/lives-config"],
  });

  const { data: transactionsData, isLoading: txLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/admin/transactions", txPage, txType, txSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: txPerPage.toString(),
        offset: (txPage * txPerPage).toString(),
      });
      if (txType !== "all") params.set("type", txType);
      if (txSearch) params.set("search", txSearch);
      const res = await fetch(`/api/admin/transactions?${params}`);
      return res.json();
    },
  });

  const handleSearch = () => {
    setTxSearch(txSearchInput);
    setTxPage(0);
  };

  const handleTypeChange = (value: string) => {
    setTxType(value);
    setTxPage(0);
  };

  const totalPages = transactionsData ? Math.ceil(transactionsData.total / txPerPage) : 0;

  const [editHouse, setEditHouse] = useState({ balance: 1000000, salesIncome: 0, totalDistributed: 0 });
  const [editLives, setEditLives] = useState<LivesConfigData>({
    livesPerGame: 3,
    extraLifeCost: 50,
    extraLifeSeconds: 30,
    maxExtraLives: 5,
  });

  useEffect(() => {
    if (houseAccount) {
      setEditHouse({ 
        balance: houseAccount.balance, 
        salesIncome: houseAccount.salesIncome || 0,
        totalDistributed: houseAccount.totalDistributed || 0
      });
    }
  }, [houseAccount]);

  useEffect(() => {
    if (livesConfig) {
      setEditLives(livesConfig);
    }
  }, [livesConfig]);

  const updateHouseMutation = useMutation({
    mutationFn: async (data: { balance: number; salesIncome: number; totalDistributed: number }) => {
      return apiRequest("PUT", "/api/admin/house-account", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/house-account"] });
      toast({ title: "House Account обновлён" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить House Account", variant: "destructive" });
    },
  });

  const updateLivesMutation = useMutation({
    mutationFn: async (data: Partial<LivesConfigData>) => {
      return apiRequest("PUT", "/api/admin/lives-config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lives-config"] });
      toast({ title: "Настройки жизней сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить настройки", variant: "destructive" });
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      game_win_reward: { label: "Победа", color: "bg-green-500/20 text-green-500" },
      buy_extra_life: { label: "Покупка жизни", color: "bg-blue-500/20 text-blue-500" },
      referral_reward: { label: "Реферал", color: "bg-purple-500/20 text-purple-500" },
      admin_adjustment: { label: "Админ", color: "bg-amber-500/20 text-amber-500" },
      house_deposit: { label: "Пополнение", color: "bg-cyan-500/20 text-cyan-500" },
    };
    return labels[type] || { label: type, color: "bg-muted text-muted-foreground" };
  };

  if (houseLoading || livesLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4" />
              House Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-house-balance">
              {houseAccount?.balance.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Beads в фонде</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Доход от продаж
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500" data-testid="text-sales-income">
              +{houseAccount?.salesIncome.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Beads от покупок</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Выдано игрокам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500" data-testid="text-total-distributed">
              {houseAccount?.totalDistributed.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Beads наград</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Управление House Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Баланс Beads</Label>
              <Input
                type="number"
                value={editHouse.balance}
                onChange={(e) => setEditHouse({ ...editHouse, balance: parseInt(e.target.value) || 0 })}
                data-testid="input-house-balance"
              />
            </div>
            <div className="space-y-2">
              <Label>Доход от продаж</Label>
              <Input
                type="number"
                value={editHouse.salesIncome}
                onChange={(e) => setEditHouse({ ...editHouse, salesIncome: parseInt(e.target.value) || 0 })}
                data-testid="input-sales-income"
              />
            </div>
            <div className="space-y-2">
              <Label>Выдано игрокам</Label>
              <Input
                type="number"
                value={editHouse.totalDistributed}
                onChange={(e) => setEditHouse({ ...editHouse, totalDistributed: parseInt(e.target.value) || 0 })}
                data-testid="input-total-distributed"
              />
            </div>
          </div>
          <Button
            onClick={() => updateHouseMutation.mutate(editHouse)}
            disabled={updateHouseMutation.isPending}
            className="w-full"
            data-testid="button-save-house"
          >
            {updateHouseMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Сохранить
          </Button>
          <p className="text-xs text-muted-foreground">
            House Account - центральный фонд Beads. Награды за победы дебетуются из него, покупки - кредитуются.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Система жизней
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Игроки начинают с {editLives.livesPerGame} жизнями. При потере всех жизней - game over.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Жизней в игре</Label>
              <Input
                type="number"
                value={editLives.livesPerGame}
                onChange={(e) => setEditLives({ ...editLives, livesPerGame: parseInt(e.target.value) || 3 })}
                data-testid="input-lives-per-game"
              />
            </div>
            <div className="space-y-2">
              <Label>Цена жизни (Beads)</Label>
              <Input
                type="number"
                value={editLives.extraLifeCost}
                onChange={(e) => setEditLives({ ...editLives, extraLifeCost: parseInt(e.target.value) || 50 })}
                data-testid="input-extra-life-cost"
              />
            </div>
            <div className="space-y-2">
              <Label>Секунд за жизнь</Label>
              <Input
                type="number"
                value={editLives.extraLifeSeconds}
                onChange={(e) => setEditLives({ ...editLives, extraLifeSeconds: parseInt(e.target.value) || 30 })}
                data-testid="input-extra-life-seconds"
              />
            </div>
            <div className="space-y-2">
              <Label>Макс. покупок</Label>
              <Input
                type="number"
                value={editLives.maxExtraLives}
                onChange={(e) => setEditLives({ ...editLives, maxExtraLives: parseInt(e.target.value) || 5 })}
                data-testid="input-max-extra-lives"
              />
            </div>
          </div>
          <Button
            onClick={() => updateLivesMutation.mutate(editLives)}
            disabled={updateLivesMutation.isPending}
            data-testid="button-save-lives"
          >
            {updateLivesMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Сохранить настройки жизней
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Журнал транзакций
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Показано {transactionsData?.transactions.length || 0} из {transactionsData?.total || 0} транзакций
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Поиск по описанию или ID..."
                value={txSearchInput}
                onChange={(e) => setTxSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
                data-testid="input-tx-search"
              />
              <Button variant="outline" onClick={handleSearch} data-testid="button-tx-search">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Select value={txType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-tx-type">
                <SelectValue placeholder="Тип транзакции" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : transactionsData?.transactions.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">Нет транзакций</p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {transactionsData?.transactions.map((tx) => {
                  const typeInfo = getTypeLabel(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                      data-testid={`tx-row-${tx.id}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {tx.description || "—"}
                            {tx.username && (
                              <span className="text-muted-foreground ml-2">
                                ({tx.username})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`font-bold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.balanceBefore.toLocaleString()} → {tx.balanceAfter.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Страница {txPage + 1} из {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTxPage(Math.max(0, txPage - 1))}
                  disabled={txPage === 0}
                  data-testid="button-tx-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTxPage(Math.min(totalPages - 1, txPage + 1))}
                  disabled={txPage >= totalPages - 1}
                  data-testid="button-tx-next"
                >
                  Вперёд
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatNumber(val: number | string): string {
  if (typeof val === 'string') return val;
  if (val === 0) return '0';
  if (Math.abs(val) < 0.0001) {
    return val.toFixed(20).replace(/\.?0+$/, '');
  }
  return String(val);
}

function EconomyTab() {
  const { toast } = useToast();
  const [editConfig, setEditConfig] = useState<GameEconomyConfig>({
    points: { normal: 5, btc: 500, eth: 300, usdt: 200 },
    combo: { multiplier: 1.5, maxChain: 10 },
    crypto: { spawnChance: 0.08 },
    cryptoRewards: { btcPerBall: 0.00000005, ethPerBall: 0.0000001, usdtPerBall: 0.01 },
    dailyLimits: { btcMaxSatsPerDay: 300, ethMaxWeiPerDay: 3000000000000000, usdtMaxPerDay: 3.0 },
    pools: { btcBalanceSats: 100000, ethBalanceWei: 1000000000000000, usdtBalance: 100 },
    perGameLimits: { btcMaxBeadsPerGame: 15, ethMaxBeadsPerGame: 15, usdtMaxBeadsPerGame: 15 },
  });
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: economyConfig, isLoading, error, refetch } = useQuery<GameEconomyConfig>({
    queryKey: ["/api/admin/game-economy"],
  });

  useEffect(() => {
    if (economyConfig && !hasInitialized) {
      const parseConfig = (config: any): GameEconomyConfig => ({
        points: {
          normal: parseFloat(String(config.points?.normal ?? 5)),
          btc: parseFloat(String(config.points?.btc ?? 500)),
          eth: parseFloat(String(config.points?.eth ?? 300)),
          usdt: parseFloat(String(config.points?.usdt ?? 200)),
        },
        combo: {
          multiplier: parseFloat(String(config.combo?.multiplier ?? 1.5)),
          maxChain: parseInt(String(config.combo?.maxChain ?? 10)),
        },
        crypto: {
          spawnChance: parseFloat(String(config.crypto?.spawnChance ?? 0.08)),
        },
        cryptoRewards: {
          btcPerBall: parseFloat(String(config.cryptoRewards?.btcPerBall ?? 0.00000005)),
          ethPerBall: parseFloat(String(config.cryptoRewards?.ethPerBall ?? 0.0000001)),
          usdtPerBall: parseFloat(String(config.cryptoRewards?.usdtPerBall ?? 0.01)),
        },
        dailyLimits: {
          btcMaxSatsPerDay: parseInt(String(config.dailyLimits?.btcMaxSatsPerDay ?? 300)),
          ethMaxWeiPerDay: parseFloat(String(config.dailyLimits?.ethMaxWeiPerDay ?? 3000000000000000)),
          usdtMaxPerDay: parseFloat(String(config.dailyLimits?.usdtMaxPerDay ?? 3.0)),
        },
        pools: {
          btcBalanceSats: parseInt(String(config.pools?.btcBalanceSats ?? 100000)),
          ethBalanceWei: parseFloat(String(config.pools?.ethBalanceWei ?? 1000000000000000)),
          usdtBalance: parseFloat(String(config.pools?.usdtBalance ?? 100)),
        },
        perGameLimits: {
          btcMaxBeadsPerGame: parseInt(String(config.perGameLimits?.btcMaxBeadsPerGame ?? 15)),
          ethMaxBeadsPerGame: parseInt(String(config.perGameLimits?.ethMaxBeadsPerGame ?? 15)),
          usdtMaxBeadsPerGame: parseInt(String(config.perGameLimits?.usdtMaxBeadsPerGame ?? 15)),
        },
      });
      setEditConfig(parseConfig(economyConfig));
      setHasInitialized(true);
    }
  }, [economyConfig, hasInitialized]);

  const updateConfigMutation = useMutation({
    mutationFn: async (config: GameEconomyConfig) => {
      return apiRequest("PUT", "/api/admin/game-economy", config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/game-economy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game-economy"] });
      toast({ title: "Сохранено", description: "Настройки экономики обновлены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить настройки", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
            <p className="text-muted-foreground">Не удалось загрузить настройки экономики</p>
            <Button onClick={() => refetch()} data-testid="button-retry-economy">
              <RefreshCw className="w-4 h-4 mr-2" />
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Экономика игры
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройка очков, комбо и вероятности появления крипто-шариков
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Очки за шарики
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Обычный шарик</Label>
                <Input
                  type="text"
                  value={rawInputs['normal'] ?? formatNumber(editConfig.points.normal)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, normal: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        points: { ...editConfig.points, normal: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, normal: undefined as any }))}
                  data-testid="input-points-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-amber-500" />
                  BTC шарик
                </Label>
                <Input
                  type="text"
                  value={rawInputs['btc'] ?? formatNumber(editConfig.points.btc)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, btc: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        points: { ...editConfig.points, btc: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, btc: undefined as any }))}
                  data-testid="input-points-btc"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <SiEthereum className="w-4 h-4 text-blue-500" />
                  ETH шарик
                </Label>
                <Input
                  type="text"
                  value={rawInputs['eth'] ?? formatNumber(editConfig.points.eth)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, eth: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        points: { ...editConfig.points, eth: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, eth: undefined as any }))}
                  data-testid="input-points-eth"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <SiTether className="w-4 h-4 text-green-500" />
                  USDT шарик
                </Label>
                <Input
                  type="text"
                  value={rawInputs['usdt'] ?? formatNumber(editConfig.points.usdt)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, usdt: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        points: { ...editConfig.points, usdt: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, usdt: undefined as any }))}
                  data-testid="input-points-usdt"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Комбо система
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Множитель комбо</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={rawInputs['comboMultiplier'] ?? formatNumber(editConfig.combo.multiplier)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, comboMultiplier: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 1 && num <= 5) {
                      setEditConfig({
                        ...editConfig,
                        combo: { ...editConfig.combo, multiplier: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, comboMultiplier: undefined as any }))}
                  data-testid="input-combo-multiplier"
                />
                <p className="text-xs text-muted-foreground">
                  Множитель применяется за каждое комбо
                </p>
              </div>
              <div className="space-y-2">
                <Label>Макс. цепочка комбо</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['comboMaxChain'] ?? String(editConfig.combo.maxChain)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, comboMaxChain: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 1 && num <= 20) {
                      setEditConfig({
                        ...editConfig,
                        combo: { ...editConfig.combo, maxChain: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, comboMaxChain: undefined as any }))}
                  data-testid="input-combo-max"
                />
                <p className="text-xs text-muted-foreground">
                  Максимальное кол-во комбо подряд
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              Крипто-шарики
            </h3>
            <div className="space-y-2">
              <Label>Вероятность появления (0-1)</Label>
              <Input
                type="text"
                value={rawInputs['spawnChance'] ?? formatNumber(editConfig.crypto.spawnChance)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawInputs(prev => ({ ...prev, spawnChance: val }));
                  const num = parseFloat(val);
                  if (!isNaN(num) && num >= 0 && num <= 1) {
                    setEditConfig({
                      ...editConfig,
                      crypto: { spawnChance: num }
                    });
                  }
                }}
                onBlur={() => setRawInputs(prev => ({ ...prev, spawnChance: undefined as any }))}
                data-testid="input-crypto-spawn"
              />
              <p className="text-xs text-muted-foreground">
                Шанс появления крипто-шарика (0.08 = 8%, 0.0001 = 0.01%)
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Крипто-награды за шарик
            </h3>
            <p className="text-sm text-muted-foreground">
              Сколько реальной криптовалюты начисляется игроку за каждый собранный крипто-шарик
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>BTC за шарик</Label>
                <Input
                  type="text"
                  value={rawInputs['btcPerBall'] ?? formatNumber(editConfig.cryptoRewards.btcPerBall)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, btcPerBall: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        cryptoRewards: { ...editConfig.cryptoRewards, btcPerBall: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, btcPerBall: undefined as any }))}
                  data-testid="input-btc-per-ball"
                />
                <p className="text-xs text-muted-foreground">
                  0.00000005 = 5 сатош
                </p>
              </div>
              <div className="space-y-2">
                <Label>ETH за шарик</Label>
                <Input
                  type="text"
                  value={rawInputs['ethPerBall'] ?? formatNumber(editConfig.cryptoRewards.ethPerBall)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, ethPerBall: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        cryptoRewards: { ...editConfig.cryptoRewards, ethPerBall: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, ethPerBall: undefined as any }))}
                  data-testid="input-eth-per-ball"
                />
                <p className="text-xs text-muted-foreground">
                  0.0000001 = 100 gwei
                </p>
              </div>
              <div className="space-y-2">
                <Label>USDT за шарик</Label>
                <Input
                  type="text"
                  value={rawInputs['usdtPerBall'] ?? formatNumber(editConfig.cryptoRewards.usdtPerBall)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, usdtPerBall: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        cryptoRewards: { ...editConfig.cryptoRewards, usdtPerBall: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, usdtPerBall: undefined as any }))}
                  data-testid="input-usdt-per-ball"
                />
                <p className="text-xs text-muted-foreground">
                  0.01 = 1 цент
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Дневные лимиты</h3>
            <p className="text-sm text-muted-foreground">Максимальное количество крипто-наград в день для каждого пользователя</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>BTC макс сатоши/день</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['btcDailyLimit'] ?? String(editConfig.dailyLimits.btcMaxSatsPerDay)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, btcDailyLimit: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        dailyLimits: { ...editConfig.dailyLimits, btcMaxSatsPerDay: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, btcDailyLimit: undefined as any }))}
                  data-testid="input-btc-daily-limit"
                />
                <p className="text-xs text-muted-foreground">
                  1000 сат = 0.00001 BTC
                </p>
              </div>
              <div className="space-y-2">
                <Label>ETH макс gwei/день</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['ethDailyLimit'] ?? formatNumber(editConfig.dailyLimits.ethMaxWeiPerDay)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, ethDailyLimit: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        dailyLimits: { ...editConfig.dailyLimits, ethMaxWeiPerDay: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, ethDailyLimit: undefined as any }))}
                  data-testid="input-eth-daily-limit"
                />
                <p className="text-xs text-muted-foreground">
                  10M gwei = 0.01 ETH
                </p>
              </div>
              <div className="space-y-2">
                <Label>USDT макс/день</Label>
                <Input
                  type="text"
                  value={rawInputs['usdtMaxPerDay'] ?? formatNumber(editConfig.dailyLimits.usdtMaxPerDay)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, usdtMaxPerDay: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        dailyLimits: { ...editConfig.dailyLimits, usdtMaxPerDay: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, usdtMaxPerDay: undefined as any }))}
                  data-testid="input-usdt-daily-limit"
                />
                <p className="text-xs text-muted-foreground">
                  1.0 = 1 USDT/день
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              Пул крипто-фонда
            </h3>
            <p className="text-sm text-muted-foreground">
              Общий баланс криптовалюты для раздачи игрокам. При нулевом балансе крипто-шарики не появляются.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>BTC пул (сатоши)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['btcPool'] ?? String(editConfig.pools.btcBalanceSats)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, btcPool: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        pools: { ...editConfig.pools, btcBalanceSats: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, btcPool: undefined as any }))}
                  data-testid="input-btc-pool"
                />
                <p className="text-xs text-muted-foreground">
                  100000 сат = 0.001 BTC
                </p>
              </div>
              <div className="space-y-2">
                <Label>ETH пул (wei/gwei)</Label>
                <Input
                  type="text"
                  value={rawInputs['ethPool'] ?? formatNumber(editConfig.pools.ethBalanceWei)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, ethPool: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        pools: { ...editConfig.pools, ethBalanceWei: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, ethPool: undefined as any }))}
                  data-testid="input-eth-pool"
                />
                <p className="text-xs text-muted-foreground">
                  1e15 wei = 0.001 ETH
                </p>
              </div>
              <div className="space-y-2">
                <Label>USDT пул ($)</Label>
                <Input
                  type="text"
                  value={rawInputs['usdtPool'] ?? formatNumber(editConfig.pools.usdtBalance)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, usdtPool: val }));
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      setEditConfig({
                        ...editConfig,
                        pools: { ...editConfig.pools, usdtBalance: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, usdtPool: undefined as any }))}
                  data-testid="input-usdt-pool"
                />
                <p className="text-xs text-muted-foreground">
                  100 = $100 USDT
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Лимиты за игру
            </h3>
            <p className="text-sm text-muted-foreground">
              Максимальное количество крипто-шариков каждого типа, которое может появиться в одной игре
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>BTC шариков/игра</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['btcPerGame'] ?? String(editConfig.perGameLimits.btcMaxBeadsPerGame)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, btcPerGame: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setEditConfig({
                        ...editConfig,
                        perGameLimits: { ...editConfig.perGameLimits, btcMaxBeadsPerGame: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, btcPerGame: undefined as any }))}
                  data-testid="input-btc-per-game"
                />
              </div>
              <div className="space-y-2">
                <Label>ETH шариков/игра</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['ethPerGame'] ?? String(editConfig.perGameLimits.ethMaxBeadsPerGame)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, ethPerGame: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setEditConfig({
                        ...editConfig,
                        perGameLimits: { ...editConfig.perGameLimits, ethMaxBeadsPerGame: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, ethPerGame: undefined as any }))}
                  data-testid="input-eth-per-game"
                />
              </div>
              <div className="space-y-2">
                <Label>USDT шариков/игра</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={rawInputs['usdtPerGame'] ?? String(editConfig.perGameLimits.usdtMaxBeadsPerGame)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawInputs(prev => ({ ...prev, usdtPerGame: val }));
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setEditConfig({
                        ...editConfig,
                        perGameLimits: { ...editConfig.perGameLimits, usdtMaxBeadsPerGame: num }
                      });
                    }
                  }}
                  onBlur={() => setRawInputs(prev => ({ ...prev, usdtPerGame: undefined as any }))}
                  data-testid="input-usdt-per-game"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={() => updateConfigMutation.mutate(editConfig)}
              disabled={updateConfigMutation.isPending}
              data-testid="button-save-economy"
            >
              {updateConfigMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить настройки
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (economyConfig) {
                  const parseConfig = (config: any): GameEconomyConfig => ({
                    points: {
                      normal: parseFloat(String(config.points?.normal ?? 5)),
                      btc: parseFloat(String(config.points?.btc ?? 500)),
                      eth: parseFloat(String(config.points?.eth ?? 300)),
                      usdt: parseFloat(String(config.points?.usdt ?? 200)),
                    },
                    combo: {
                      multiplier: parseFloat(String(config.combo?.multiplier ?? 1.5)),
                      maxChain: parseInt(String(config.combo?.maxChain ?? 10)),
                    },
                    crypto: {
                      spawnChance: parseFloat(String(config.crypto?.spawnChance ?? 0.08)),
                    },
                    cryptoRewards: {
                      btcPerBall: parseFloat(String(config.cryptoRewards?.btcPerBall ?? 0.00000005)),
                      ethPerBall: parseFloat(String(config.cryptoRewards?.ethPerBall ?? 0.0000001)),
                      usdtPerBall: parseFloat(String(config.cryptoRewards?.usdtPerBall ?? 0.01)),
                    },
                    dailyLimits: {
                      btcMaxSatsPerDay: parseInt(String(config.dailyLimits?.btcMaxSatsPerDay ?? 300)),
                      ethMaxWeiPerDay: parseFloat(String(config.dailyLimits?.ethMaxWeiPerDay ?? 3000000000000000)),
                      usdtMaxPerDay: parseFloat(String(config.dailyLimits?.usdtMaxPerDay ?? 3.0)),
                    },
                    pools: {
                      btcBalanceSats: parseInt(String(config.pools?.btcBalanceSats ?? 100000)),
                      ethBalanceWei: parseFloat(String(config.pools?.ethBalanceWei ?? 1000000000000000)),
                      usdtBalance: parseFloat(String(config.pools?.usdtBalance ?? 100)),
                    },
                    perGameLimits: {
                      btcMaxBeadsPerGame: parseInt(String(config.perGameLimits?.btcMaxBeadsPerGame ?? 15)),
                      ethMaxBeadsPerGame: parseInt(String(config.perGameLimits?.ethMaxBeadsPerGame ?? 15)),
                      usdtMaxBeadsPerGame: parseInt(String(config.perGameLimits?.usdtMaxBeadsPerGame ?? 15)),
                    },
                  });
                  setEditConfig(parseConfig(economyConfig));
                }
              }}
              disabled={!economyConfig}
              data-testid="button-reset-economy"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить изменения
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Подсказка</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Изменения вступают в силу сразу для новых игр</li>
            <li>Крипто-шарики появляются только если их баланс в "Фонде" больше 0</li>
            <li>Бонусные очки за крипто-шарики начисляются только при сборе 3+ шариков одного цвета</li>
            <li><strong>Дневные лимиты защищают экономику:</strong> криптошары не появляются, если лимит юзера или фонд исчерпаны</li>
            <li><strong>Комбо-множитель не влияет на BTC/ETH/USDT награды,</strong> только на Beads</li>
            <li>При текущих настройках: 5 сатош за BTC-шар, лимит 300 сатош/день = до 4 игр с 15 BTC-шарами</li>
            <li>BTC считается в сатоши (int), ETH в wei (bigint), USDT в центах/decimal</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralsTab() {
  const { toast } = useToast();
  
  const { data: referralConfig, isLoading: configLoading } = useQuery<ReferralConfig>({
    queryKey: ["/api/referral/config"],
  });

  const { data: referralStats, isLoading: statsLoading } = useQuery<ReferralUserStats[]>({
    queryKey: ["/api/admin/referral/stats"],
  });

  const [editConfig, setEditConfig] = useState<ReferralConfig>({
    maxDirectReferralsPerUser: 1000,
    level1RewardPercent: 10,
    level2RewardPercent: 3,
    maxReferralBeadsPerRefPerDay: 1000000,
    maxReferralBeadsPerUserPerDay: 10000000,
    title: 'Реферальная программа',
    description: 'Зови друзей — получай 10% их Beads!',
  });

  useEffect(() => {
    if (referralConfig) {
      setEditConfig(referralConfig);
    }
  }, [referralConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<ReferralConfig>) => {
      return apiRequest("PUT", "/api/admin/referral/config", config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral/config"] });
      toast({ title: "Настройки рефералов сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    },
  });

  if (configLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки реферальной системы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Тексты в приложении
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={editConfig.title || ''}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    title: e.target.value
                  })}
                  placeholder="Реферальная программа"
                  data-testid="input-referral-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input
                  value={editConfig.description || ''}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    description: e.target.value
                  })}
                  placeholder="Зови друзей — получай 10% их Beads!"
                  data-testid="input-referral-description"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Бонусы</h3>
              <div className="space-y-2">
                <Label>Бонус 1-го уровня (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editConfig.level1RewardPercent}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    level1RewardPercent: parseInt(e.target.value) || 0
                  })}
                  data-testid="input-level1-percent"
                />
                <p className="text-xs text-muted-foreground">
                  % от Beads прямого реферала
                </p>
              </div>
              <div className="space-y-2">
                <Label>Бонус 2-го уровня (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editConfig.level2RewardPercent}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    level2RewardPercent: parseInt(e.target.value) || 0
                  })}
                  data-testid="input-level2-percent"
                />
                <p className="text-xs text-muted-foreground">
                  % от Beads реферала 2-го уровня
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Лимиты</h3>
              <div className="space-y-2">
                <Label>Макс. рефералов на пользователя</Label>
                <Input
                  type="number"
                  min={1}
                  value={editConfig.maxDirectReferralsPerUser}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    maxDirectReferralsPerUser: parseInt(e.target.value) || 1
                  })}
                  data-testid="input-max-referrals"
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. Beads от одного реферала в день</Label>
                <Input
                  type="number"
                  min={1}
                  value={editConfig.maxReferralBeadsPerRefPerDay}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    maxReferralBeadsPerRefPerDay: parseInt(e.target.value) || 1
                  })}
                  data-testid="input-max-beads-per-ref"
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. Beads от всех рефералов в день</Label>
                <Input
                  type="number"
                  min={1}
                  value={editConfig.maxReferralBeadsPerUserPerDay}
                  onChange={(e) => setEditConfig({
                    ...editConfig,
                    maxReferralBeadsPerUserPerDay: parseInt(e.target.value) || 1
                  })}
                  data-testid="input-max-beads-per-day"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => updateConfigMutation.mutate(editConfig)}
              disabled={updateConfigMutation.isPending}
              data-testid="button-save-referral-config"
            >
              {updateConfigMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить настройки
            </Button>
            <Button
              variant="outline"
              onClick={() => referralConfig && setEditConfig(referralConfig)}
              disabled={!referralConfig}
              data-testid="button-reset-referral-config"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить изменения
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Статистика рефералов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2 py-1 border-b">
                <div>Имя</div>
                <div>Код</div>
                <div>Приглашён</div>
                <div className="text-center">L1</div>
                <div className="text-center">L2</div>
                <div className="text-right">Заработано</div>
                <div></div>
              </div>
              
              {referralStats?.map((stat) => (
                <div 
                  key={stat.userId} 
                  className="grid grid-cols-7 gap-2 text-sm items-center px-2 py-2 rounded hover-elevate"
                  data-testid={`row-referral-${stat.userId}`}
                >
                  <div className="truncate font-medium">{stat.username}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {stat.referralCode || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {stat.referredByUsername || '-'}
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary">{stat.level1ReferralsCount}</Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{stat.level2ReferralsCount}</Badge>
                  </div>
                  <div className="text-right font-medium text-primary">
                    {stat.totalReferralBeads.toLocaleString()}
                  </div>
                  <div></div>
                </div>
              ))}

              {(!referralStats || referralStats.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных о рефералах
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Подсказка</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>L1 — количество прямых рефералов (приглашённых напрямую)</li>
            <li>L2 — количество рефералов 2-го уровня (приглашённых рефералами)</li>
            <li>Бонус начисляется автоматически при каждой игре реферала</li>
            <li>Реф-бонусы увеличивают только виртуальные Beads, не USDT</li>
            <li>Лимиты "в день" — мягкие ограничения для защиты от злоупотреблений</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface MaintenanceConfig {
  enabled: boolean;
  endTime: string | null;
  message: string | null;
}

function MaintenanceTab() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: maintenanceConfig, isLoading } = useQuery<MaintenanceConfig>({
    queryKey: ["/api/maintenance"],
  });

  useEffect(() => {
    if (maintenanceConfig) {
      setEnabled(maintenanceConfig.enabled);
      if (maintenanceConfig.endTime) {
        const date = new Date(maintenanceConfig.endTime);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEndTime(localDateTime);
      } else {
        setEndTime("");
      }
      setMessage(maintenanceConfig.message || "");
      setHasChanges(false);
    }
  }, [maintenanceConfig]);

  const updateMaintenanceMutation = useMutation({
    mutationFn: async (config: { enabled: boolean; endTime: string | null; message: string | null }) => {
      return apiRequest("PUT", "/api/admin/maintenance", config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      setHasChanges(false);
      toast({
        title: enabled ? "Режим обслуживания включён" : "Режим обслуживания выключен",
        description: enabled 
          ? "Пользователи увидят страницу ожидания"
          : "Приложение доступно для всех"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    let isoEndTime: string | null = null;
    if (endTime) {
      try {
        const date = new Date(endTime);
        if (!isNaN(date.getTime())) {
          isoEndTime = date.toISOString();
        }
      } catch {
      }
    }
    
    updateMaintenanceMutation.mutate({
      enabled,
      endTime: isoEndTime,
      message: message.trim() || null
    });
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setHasChanges(true);
  };

  const handleReset = () => {
    if (maintenanceConfig) {
      setEnabled(maintenanceConfig.enabled);
      if (maintenanceConfig.endTime) {
        const date = new Date(maintenanceConfig.endTime);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEndTime(localDateTime);
      } else {
        setEndTime("");
      }
      setMessage(maintenanceConfig.message || "");
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-5 h-5" />
            Режим обслуживания
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Включите режим обслуживания для проведения технических работ. 
            Пользователи увидят страницу ожидания с таймером.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Статус приложения</div>
                <div className="text-sm text-muted-foreground">
                  {enabled ? "Технические работы" : "Работает нормально"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                data-testid="switch-maintenance"
              />
              <Badge variant={enabled ? "destructive" : "default"}>
                {enabled ? "ВЫКЛ для пользователей" : "ВКЛЮЧЕНО"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Время окончания работ
              </Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setHasChanges(true);
                }}
                className="max-w-xs"
                data-testid="input-maintenance-end-time"
              />
              <p className="text-xs text-muted-foreground">
                Укажите дату и время, когда приложение снова заработает. 
                Пользователи увидят обратный отсчёт.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Сообщение для пользователей (необязательно)</Label>
              <Input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Мы обновляем приложение..."
                data-testid="input-maintenance-message"
              />
              <p className="text-xs text-muted-foreground">
                Кастомное сообщение для страницы ожидания
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={updateMaintenanceMutation.isPending || !hasChanges}
              data-testid="button-save-maintenance"
            >
              {updateMaintenanceMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить
            </Button>
            <Button 
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              data-testid="button-reset-maintenance"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Подсказка</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>При включении режима все пользователи (кроме админов) увидят страницу ожидания</li>
            <li>Укажите время окончания работ, чтобы показать таймер обратного отсчёта</li>
            <li>После истечения таймера страница автоматически обновится</li>
            <li>Не забудьте выключить режим обслуживания после завершения работ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface GameplayConfigType {
  balls: {
    initialCount: number;
    targetCount: number;
    maxTotalBalls: number;
  };
  spawn: {
    period: number;
    resumeThreshold: number;
  };
  speed: {
    base: number;
    max: number;
    accelerationStart: number;
  };
  colors: {
    count: number;
    activeColors?: string[];
  };
}

function GameplayTab() {
  const { toast } = useToast();
  const [editConfig, setEditConfig] = useState<GameplayConfigType | null>(null);
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});

  const { data: config, isLoading } = useQuery<GameplayConfigType>({
    queryKey: ["/api/admin/gameplay-config"],
  });

  useEffect(() => {
    if (config && !editConfig) {
      setEditConfig(config);
    }
  }, [config, editConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: GameplayConfigType) => {
      return apiRequest("PUT", "/api/admin/gameplay-config", newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gameplay-config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gameplay-config"] });
      toast({ title: "Сохранено", description: "Настройки геймплея обновлены" });
      setRawInputs({});
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить настройки", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editConfig) return;
    updateConfigMutation.mutate(editConfig);
  };

  const handleReset = () => {
    if (config) {
      setEditConfig(config);
      setRawInputs({});
    }
  };

  const handleInputChange = (key: string, value: string, setter: (val: number) => void) => {
    setRawInputs(prev => ({ ...prev, [key]: value }));
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setter(num);
    }
  };

  if (isLoading || !editConfig) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = JSON.stringify(editConfig) !== JSON.stringify(config);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Настройки геймплея
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Управление сложностью игры: количество шариков, скорость, спавн
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Шарики</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Начальное количество</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={rawInputs['initialCount'] ?? String(editConfig.balls.initialCount)}
                  onChange={(e) => handleInputChange('initialCount', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, balls: { ...prev.balls, initialCount: Math.floor(num) } } : null)
                  )}
                  data-testid="input-initial-count"
                />
                <p className="text-xs text-muted-foreground">Шариков при старте игры</p>
              </div>
              <div className="space-y-2">
                <Label>Целевое количество</Label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={rawInputs['targetCount'] ?? String(editConfig.balls.targetCount)}
                  onChange={(e) => handleInputChange('targetCount', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, balls: { ...prev.balls, targetCount: Math.floor(num) } } : null)
                  )}
                  data-testid="input-target-count"
                />
                <p className="text-xs text-muted-foreground">Спавн продолжается до этого числа</p>
              </div>
              <div className="space-y-2">
                <Label>Максимум шариков</Label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={rawInputs['maxTotalBalls'] ?? String(editConfig.balls.maxTotalBalls)}
                  onChange={(e) => handleInputChange('maxTotalBalls', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, balls: { ...prev.balls, maxTotalBalls: Math.floor(num) } } : null)
                  )}
                  data-testid="input-max-balls"
                />
                <p className="text-xs text-muted-foreground">Абсолютный лимит шариков</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Спавн</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Период спавна (мс)</Label>
                <Input
                  type="number"
                  min={100}
                  max={10000}
                  value={rawInputs['spawnPeriod'] ?? String(editConfig.spawn.period)}
                  onChange={(e) => handleInputChange('spawnPeriod', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, spawn: { ...prev.spawn, period: Math.floor(num) } } : null)
                  )}
                  data-testid="input-spawn-period"
                />
                <p className="text-xs text-muted-foreground">Интервал между спавном новых шариков</p>
              </div>
              <div className="space-y-2">
                <Label>Порог возобновления</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={rawInputs['resumeThreshold'] ?? String(editConfig.spawn.resumeThreshold)}
                  onChange={(e) => handleInputChange('resumeThreshold', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, spawn: { ...prev.spawn, resumeThreshold: Math.floor(num) } } : null)
                  )}
                  data-testid="input-resume-threshold"
                />
                <p className="text-xs text-muted-foreground">Спавн возобновляется если шариков меньше</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Скорость</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Базовая скорость</Label>
                <Input
                  type="number"
                  step={0.001}
                  min={0.001}
                  max={0.1}
                  value={rawInputs['speedBase'] ?? String(editConfig.speed.base)}
                  onChange={(e) => handleInputChange('speedBase', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, speed: { ...prev.speed, base: num } } : null)
                  )}
                  data-testid="input-speed-base"
                />
                <p className="text-xs text-muted-foreground">Начальная скорость движения</p>
              </div>
              <div className="space-y-2">
                <Label>Максимальная скорость</Label>
                <Input
                  type="number"
                  step={0.001}
                  min={0.001}
                  max={0.1}
                  value={rawInputs['speedMax'] ?? String(editConfig.speed.max)}
                  onChange={(e) => handleInputChange('speedMax', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, speed: { ...prev.speed, max: num } } : null)
                  )}
                  data-testid="input-speed-max"
                />
                <p className="text-xs text-muted-foreground">Скорость в конце пути</p>
              </div>
              <div className="space-y-2">
                <Label>Точка ускорения (0-1)</Label>
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  max={1}
                  value={rawInputs['accelerationStart'] ?? String(editConfig.speed.accelerationStart)}
                  onChange={(e) => handleInputChange('accelerationStart', e.target.value, (num) => 
                    setEditConfig(prev => prev ? { ...prev, speed: { ...prev.speed, accelerationStart: num } } : null)
                  )}
                  data-testid="input-acceleration-start"
                />
                <p className="text-xs text-muted-foreground">Где начинается ускорение (0.8 = 80% пути)</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Цвета</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Активные цвета (выберите 2-10)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'red', name: 'Красный', color: '#ff4757' },
                    { id: 'blue', name: 'Синий', color: '#3b82f6' },
                    { id: 'green', name: 'Зелёный', color: '#22c55e' },
                    { id: 'yellow', name: 'Жёлтый', color: '#eab308' },
                    { id: 'purple', name: 'Пурпурный', color: '#8b5cf6' },
                    { id: 'cyan', name: 'Голубой', color: '#00e5ff' },
                    { id: 'magenta', name: 'Розовый', color: '#ff2bf2' },
                    { id: 'amber', name: 'Янтарный', color: '#ffc400' },
                    { id: 'lime', name: 'Лайм', color: '#b6ff00' },
                    { id: 'violet', name: 'Фиолет', color: '#8c3bff' },
                  ].map(({ id, name, color }) => {
                    const allColorIds = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'amber', 'lime', 'violet'];
                    const rawActiveColors = editConfig.colors.activeColors;
                    const activeColors = (rawActiveColors && rawActiveColors.length >= 2) 
                      ? rawActiveColors 
                      : allColorIds.slice(0, Math.max(2, editConfig.colors.count));
                    const isActive = activeColors.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          const current = (rawActiveColors && rawActiveColors.length >= 2) 
                            ? rawActiveColors 
                            : allColorIds.slice(0, Math.max(2, editConfig.colors.count));
                          let newColors: string[];
                          if (isActive) {
                            if (current.length <= 2) return;
                            newColors = current.filter((c: string) => c !== id);
                          } else {
                            if (current.length >= 10) return;
                            newColors = [...current, id];
                          }
                          setEditConfig(prev => prev ? { 
                            ...prev, 
                            colors: { 
                              ...prev.colors,
                              count: newColors.length,
                              activeColors: newColors 
                            } 
                          } : null);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                          isActive ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        data-testid={`button-color-${id}`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs">{name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Активно: {editConfig.colors.activeColors?.length || editConfig.colors.count} цветов. Меньше цветов = проще игра
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave}
              disabled={updateConfigMutation.isPending || !hasChanges}
              data-testid="button-save-gameplay"
            >
              {updateConfigMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить
            </Button>
            <Button 
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              data-testid="button-reset-gameplay"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BoostPackageForm {
  name: string;
  nameRu: string;
  boostsPerType: number;
  priceStars: number;
  priceUsd: number | null;
  originalPriceStars: number | null;
  badge: string;
  badgeText: string;
  bonusLives: number;
  sortOrder: number;
  isActive: boolean;
}

function BoostPackagesTab() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<BoostPackageForm>({
    name: '',
    nameRu: '',
    boostsPerType: 10,
    priceStars: 50,
    priceUsd: null,
    originalPriceStars: null,
    badge: '',
    badgeText: '',
    bonusLives: 0,
    sortOrder: 0,
    isActive: true,
  });

  const { data: packages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/boost-packages'],
  });

  const { data: boosts = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/boosts'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BoostPackageForm) => {
      return apiRequest('POST', '/api/admin/boost-packages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/boost-packages'] });
      toast({ title: 'Создано', description: 'Пакет бустов добавлен' });
      setShowCreate(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось создать пакет', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BoostPackageForm> }) => {
      return apiRequest('PATCH', `/api/admin/boost-packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/boost-packages'] });
      toast({ title: 'Сохранено', description: 'Пакет бустов обновлён' });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось обновить пакет', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/boost-packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/boost-packages'] });
      toast({ title: 'Удалено', description: 'Пакет бустов удалён' });
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось удалить пакет', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      nameRu: '',
      boostsPerType: 10,
      priceStars: 50,
      priceUsd: null,
      originalPriceStars: null,
      badge: '',
      badgeText: '',
      bonusLives: 0,
      sortOrder: 0,
      isActive: true,
    });
  };

  const startEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      nameRu: pkg.nameRu,
      boostsPerType: pkg.boostsPerType,
      priceStars: pkg.priceStars,
      priceUsd: pkg.priceUsd ? parseFloat(pkg.priceUsd) : null,
      originalPriceStars: pkg.originalPriceStars,
      badge: pkg.badge || '',
      badgeText: pkg.badgeText || '',
      bonusLives: pkg.bonusLives || 0,
      sortOrder: pkg.sortOrder || 0,
      isActive: pkg.isActive,
    });
  };

  const totalBoostsInPackage = boosts.length * form.boostsPerType;
  const pricePerBoost = form.priceStars > 0 ? (form.priceStars / totalBoostsInPackage).toFixed(4) : '0';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Пакеты бустов
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Наборы бустов для покупки за Telegram Stars. Всего типов бустов: {boosts.length}
            </p>
          </div>
          <Button onClick={() => { setShowCreate(true); resetForm(); }} data-testid="button-create-package">
            <Plus className="w-4 h-4 mr-2" />
            Добавить пакет
          </Button>
        </CardHeader>
        <CardContent>
          {packages.length === 0 && !showCreate ? (
            <div className="text-center py-8 text-muted-foreground">
              Пакеты ещё не созданы. Нажмите "Добавить пакет" для создания.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Create form */}
              {showCreate && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Новый пакет</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Название (EN)</Label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="starter"
                          data-testid="input-pkg-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Название (RU)</Label>
                        <Input
                          value={form.nameRu}
                          onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                          placeholder="СТАРТОВЫЙ"
                          data-testid="input-pkg-name-ru"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Бустов каждого типа</Label>
                        <Input
                          type="number"
                          min={1}
                          value={form.boostsPerType}
                          onChange={(e) => setForm({ ...form, boostsPerType: parseInt(e.target.value) || 1 })}
                          data-testid="input-pkg-boosts"
                        />
                        <p className="text-xs text-muted-foreground">Всего: {totalBoostsInPackage} бустов</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Цена (Stars)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={form.priceStars}
                          onChange={(e) => setForm({ ...form, priceStars: parseInt(e.target.value) || 1 })}
                          data-testid="input-pkg-price"
                        />
                        <p className="text-xs text-muted-foreground">{pricePerBoost} Stars/буст</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Цена (USDT)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={form.priceUsd || ''}
                          onChange={(e) => setForm({ ...form, priceUsd: parseFloat(e.target.value) || null })}
                          placeholder="Для крипто-платежей"
                          data-testid="input-pkg-price-usd"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Старая цена (если скидка)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.originalPriceStars || ''}
                          onChange={(e) => setForm({ ...form, originalPriceStars: parseInt(e.target.value) || null })}
                          placeholder="Пусто = нет скидки"
                          data-testid="input-pkg-original-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Бейдж</Label>
                        <Select value={form.badge || "none"} onValueChange={(v) => setForm({ ...form, badge: v === "none" ? "" : v })}>
                          <SelectTrigger data-testid="select-pkg-badge">
                            <SelectValue placeholder="Без бейджа" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Без бейджа</SelectItem>
                            <SelectItem value="hot">Хит продаж</SelectItem>
                            <SelectItem value="best_value">Лучшая цена</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Текст бейджа</Label>
                        <Input
                          value={form.badgeText}
                          onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                          placeholder="ХИТ ПРОДАЖ!"
                          data-testid="input-pkg-badge-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Бонус жизней</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.bonusLives}
                          onChange={(e) => setForm({ ...form, bonusLives: parseInt(e.target.value) || 0 })}
                          data-testid="input-pkg-bonus-lives"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Порядок сортировки</Label>
                        <Input
                          type="number"
                          value={form.sortOrder}
                          onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                          data-testid="input-pkg-sort"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          checked={form.isActive}
                          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                          data-testid="toggle-pkg-active"
                        />
                        <Label>Активен</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        onClick={() => createMutation.mutate(form)}
                        disabled={!form.name || !form.nameRu || createMutation.isPending}
                        data-testid="button-save-new-package"
                      >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Создать
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Packages list */}
              {packages.map((pkg: any) => (
                <Card key={pkg.id} className={!pkg.isActive ? 'opacity-50' : ''}>
                  <CardContent className="pt-4">
                    {editingId === pkg.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Название (EN)</Label>
                            <Input
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              data-testid={`input-edit-name-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Название (RU)</Label>
                            <Input
                              value={form.nameRu}
                              onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                              data-testid={`input-edit-name-ru-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Бустов каждого типа</Label>
                            <Input
                              type="number"
                              min={1}
                              value={form.boostsPerType}
                              onChange={(e) => setForm({ ...form, boostsPerType: parseInt(e.target.value) || 1 })}
                              data-testid={`input-edit-boosts-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Цена (Stars)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={form.priceStars}
                              onChange={(e) => setForm({ ...form, priceStars: parseInt(e.target.value) || 1 })}
                              data-testid={`input-edit-price-${pkg.id}`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Цена (USDT)</Label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={form.priceUsd || ''}
                              onChange={(e) => setForm({ ...form, priceUsd: parseFloat(e.target.value) || null })}
                              placeholder="Для крипто-платежей"
                              data-testid={`input-edit-price-usd-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Старая цена</Label>
                            <Input
                              type="number"
                              min={0}
                              value={form.originalPriceStars || ''}
                              onChange={(e) => setForm({ ...form, originalPriceStars: parseInt(e.target.value) || null })}
                              data-testid={`input-edit-original-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Бейдж</Label>
                            <Select value={form.badge || "none"} onValueChange={(v) => setForm({ ...form, badge: v === "none" ? "" : v })}>
                              <SelectTrigger data-testid={`select-edit-badge-${pkg.id}`}>
                                <SelectValue placeholder="Без бейджа" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Без бейджа</SelectItem>
                                <SelectItem value="hot">Хит продаж</SelectItem>
                                <SelectItem value="best_value">Лучшая цена</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Текст бейджа</Label>
                            <Input
                              value={form.badgeText}
                              onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                              data-testid={`input-edit-badge-text-${pkg.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Бонус жизней</Label>
                            <Input
                              type="number"
                              min={0}
                              value={form.bonusLives}
                              onChange={(e) => setForm({ ...form, bonusLives: parseInt(e.target.value) || 0 })}
                              data-testid={`input-edit-lives-${pkg.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={form.isActive}
                              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                              data-testid={`toggle-edit-active-${pkg.id}`}
                            />
                            <Label>Активен</Label>
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <Button 
                              type="button"
                              onClick={() => updateMutation.mutate({ id: pkg.id, data: form })}
                              disabled={updateMutation.isPending}
                              data-testid={`button-save-${pkg.id}`}
                            >
                              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">
                            {pkg.badge === 'hot' ? '🔥' : pkg.badge === 'best_value' ? '👑' : '📦'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{pkg.nameRu}</span>
                              <span className="text-muted-foreground text-sm">({pkg.name})</span>
                              {pkg.badge && (
                                <Badge variant={pkg.badge === 'hot' ? 'destructive' : 'default'}>
                                  {pkg.badgeText || (pkg.badge === 'hot' ? 'ХИТ' : 'VIP')}
                                </Badge>
                              )}
                              {!pkg.isActive && <Badge variant="outline">Неактивен</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.boostsPerType} x {boosts.length} типов = {pkg.boostsPerType * boosts.length} бустов | 
                              {pkg.originalPriceStars && (
                                <span className="line-through mx-1">{pkg.originalPriceStars} ⭐</span>
                              )}
                              <span className="font-medium text-foreground"> {pkg.priceStars} ⭐</span>
                              {pkg.priceUsd && <span className="font-medium text-green-500 ml-1">/ ${parseFloat(pkg.priceUsd).toFixed(2)}</span>}
                              {pkg.bonusLives > 0 && <span className="ml-2">+{pkg.bonusLives} жизней</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="icon"
                            onClick={() => startEdit(pkg)}
                            data-testid={`button-edit-${pkg.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="icon"
                            onClick={() => deleteMutation.mutate(pkg.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${pkg.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Types for Accounting
interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  sharePercent: number;
  totalEarnedStars: number;
  totalEarnedUsd: string;
  isActive: boolean;
  createdAt: string;
}


function AccountingTab() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/admin/team-members'],
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery<RevenueSummary>({
    queryKey: ['/api/admin/revenue-summary'],
  });

  const { data: houseAccount } = useQuery<{ balance: number; salesIncome: number; totalDistributed: number }>({
    queryKey: ['/api/admin/house-account'],
    refetchInterval: 10000,
  });

  const beadsIncome = houseAccount?.salesIncome || 0;
  const beadsDevelopment = Math.floor(beadsIncome * 0.1);
  const beadsAdvertising = Math.floor(beadsIncome * 0.15);
  const beadsTeamPool = beadsIncome - beadsDevelopment - beadsAdvertising;
  const beadsPerMember = Math.floor(beadsTeamPool / 5);

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, name, role }: { id: string; name: string; role: string }) => {
      return apiRequest('PUT', `/api/admin/team-members/${id}`, { name, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      toast({ title: 'Сохранено', description: 'Член команды обновлён' });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    },
  });

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role || '');
  };

  const saveEdit = () => {
    if (editingId) {
      updateMemberMutation.mutate({ id: editingId, name: editName, role: editRole });
    }
  };

  const formatStars = (stars: number) => {
    return `${stars.toLocaleString()} ⭐`;
  };

  const formatUsd = (usd: number | string) => {
    const num = typeof usd === 'string' ? parseFloat(usd) : usd;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Статистика продаж
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : revenue ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Всего продаж</div>
                  <div className="text-2xl font-bold">{revenue.salesCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stars: {revenue.starsSalesCount} | Crypto: {revenue.cryptoSalesCount}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10">
                  <div className="text-sm text-muted-foreground">Доход (Stars)</div>
                  <div className="text-2xl font-bold text-yellow-500">{formatStars(revenue.totalSalesStars)}</div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="text-sm text-muted-foreground">Доход (USD)</div>
                  <div className="text-2xl font-bold text-green-500">{formatUsd(revenue.totalSalesUsd)}</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <div className="text-sm text-muted-foreground">Всего доход</div>
                  <div className="text-xl font-bold text-blue-500">
                    {formatStars(revenue.totalSalesStars)} + {formatUsd(revenue.totalSalesUsd)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Распределение дохода</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span className="font-medium">Разработка (10%)</span>
                    </div>
                    <div className="text-lg">{formatStars(revenue.developmentStars)} + {formatUsd(revenue.developmentUsd)}</div>
                    <div className="text-sm text-green-500 mt-1">+ {beadsDevelopment.toLocaleString()} Beads</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Реклама (15%)</span>
                    </div>
                    <div className="text-lg">{formatStars(revenue.advertisingStars)} + {formatUsd(revenue.advertisingUsd)}</div>
                    <div className="text-sm text-green-500 mt-1">+ {beadsAdvertising.toLocaleString()} Beads</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Команда (75%)</span>
                    </div>
                    <div className="text-lg">{formatStars(Math.floor(revenue.totalSalesStars * 0.75))} + {formatUsd(revenue.totalSalesUsd * 0.75)}</div>
                    <div className="text-sm text-green-500 mt-1">+ {beadsTeamPool.toLocaleString()} Beads ({beadsPerMember.toLocaleString()}/чел)</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Нет данных о продажах</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Команда (5 членов, по 15% каждому)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={member.id} className="p-4 rounded-lg border flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    {editingId === member.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Имя"
                          data-testid={`input-member-name-${member.id}`}
                        />
                        <Input
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          placeholder="Роль"
                          data-testid={`input-member-role-${member.id}`}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          {member.name}
                        </div>
                        {member.role && (
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Заработано</div>
                      <div className="font-medium">
                        {formatStars(member.totalEarnedStars)}
                      </div>
                      <div className="text-sm text-green-500">
                        {formatUsd(member.totalEarnedUsd)}
                      </div>
                    </div>
                    
                    <div>
                      {editingId === member.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={updateMemberMutation.isPending}
                            data-testid={`button-save-member-${member.id}`}
                          >
                            {updateMemberMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            data-testid={`button-cancel-member-${member.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(member)}
                          data-testid={`button-edit-member-${member.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет членов команды. Добавьте их в базу данных.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Распределение дохода по членам команды</CardTitle>
        </CardHeader>
        <CardContent>
          {revenue && revenue.teamShares.length > 0 ? (
            <div className="space-y-2">
              {revenue.teamShares.map((share) => (
                <div key={share.memberId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium">{share.name}</span>
                  <div className="text-right">
                    <span className="text-yellow-500">{formatStars(share.stars)}</span>
                    <span className="mx-2">+</span>
                    <span className="text-green-500">{formatUsd(share.usd)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Пока нет продаж для распределения
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CharactersTab() {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'bodies' | 'accessories' | 'editor'>('categories');
  
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/accessory-categories'],
  });
  
  const { data: baseBodies = [], isLoading: bodiesLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/base-bodies'],
  });
  
  const { data: accessories = [], isLoading: accessoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/accessories'],
  });

  const [editorGender, setEditorGender] = useState<'male' | 'female'>('male');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editedPositions, setEditedPositions] = useState<Record<string, { x: number; y: number; z: number; scale: number }>>({});

  const updateAccessoryPositionMutation = useMutation({
    mutationFn: async ({ id, positionX, positionY, zIndex, scale }: { id: string; positionX: number; positionY: number; zIndex: number; scale: number }) => {
      return apiRequest('PATCH', `/api/admin/accessories/${id}`, { positionX, positionY, zIndex, scale: String(scale) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessories'] });
      toast({ title: 'Позиция сохранена' });
    },
    onError: () => {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    },
  });

  const getDefaultBody = (gender: 'male' | 'female') => {
    return baseBodies.find((b: any) => b.gender === gender && b.isDefault) || baseBodies.find((b: any) => b.gender === gender);
  };

  const filteredAccessories = accessories.filter((acc: any) => 
    acc.gender === 'both' || acc.gender === editorGender
  );

  const selectedAccessory = accessories.find((a: any) => a.id === selectedAccessoryId);
  const currentPosition = selectedAccessoryId ? editedPositions[selectedAccessoryId] || {
    x: selectedAccessory?.positionX || 0,
    y: selectedAccessory?.positionY || 0,
    z: selectedAccessory?.zIndex || 1,
    scale: parseFloat(selectedAccessory?.scale || '1'),
  } : null;

  const handleEditorMouseDown = (e: React.MouseEvent, accessory: any) => {
    e.preventDefault();
    setSelectedAccessoryId(accessory.id);
    setIsDragging(true);
    
    const rect = (e.target as HTMLElement).closest('.editor-preview')?.getBoundingClientRect();
    if (rect) {
      const pos = editedPositions[accessory.id] || { x: accessory.positionX, y: accessory.positionY, z: accessory.zIndex, scale: parseFloat(accessory.scale || '1') };
      setDragOffset({
        x: e.clientX - rect.left - pos.x,
        y: e.clientY - rect.top - pos.y,
      });
    }
  };

  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedAccessoryId) return;
    
    const rect = (e.target as HTMLElement).closest('.editor-preview')?.getBoundingClientRect();
    if (rect) {
      const x = Math.round(e.clientX - rect.left - dragOffset.x);
      const y = Math.round(e.clientY - rect.top - dragOffset.y);
      const current = editedPositions[selectedAccessoryId] || {
        x: selectedAccessory?.positionX || 0,
        y: selectedAccessory?.positionY || 0,
        z: selectedAccessory?.zIndex || 1,
        scale: parseFloat(selectedAccessory?.scale || '1'),
      };
      setEditedPositions({
        ...editedPositions,
        [selectedAccessoryId]: { ...current, x, y },
      });
    }
  };

  const handleEditorMouseUp = () => {
    setIsDragging(false);
  };

  const saveAccessoryPosition = (accId: string) => {
    const pos = editedPositions[accId];
    if (pos) {
      updateAccessoryPositionMutation.mutate({ id: accId, positionX: pos.x, positionY: pos.y, zIndex: pos.z, scale: pos.scale });
    }
  };

  const [newCategory, setNewCategory] = useState({ name: '', nameRu: '', slot: 'head', sortOrder: 0 });
  const [newBody, setNewBody] = useState({ gender: 'male', imageUrl: '', isDefault: false });
  const [uploadingBody, setUploadingBody] = useState(false);
  const [uploadingAccessory, setUploadingAccessory] = useState(false);
  const [newAccessory, setNewAccessory] = useState({
    categoryId: '',
    name: '',
    nameRu: '',
    descriptionRu: '',
    imageUrl: '',
    gender: 'both',
    positionX: 0,
    positionY: 0,
    zIndex: 1,
    price: 100,
    maxQuantity: null as number | null,
    isActive: true,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof newCategory) => {
      return apiRequest('POST', '/api/admin/accessory-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessory-categories'] });
      toast({ title: 'Категория создана' });
      setNewCategory({ name: '', nameRu: '', slot: 'head', sortOrder: 0 });
    },
    onError: () => {
      toast({ title: 'Ошибка создания категории', variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/accessory-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessory-categories'] });
      toast({ title: 'Категория удалена' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления категории', variant: 'destructive' });
    },
  });

  const createBodyMutation = useMutation({
    mutationFn: async (data: typeof newBody) => {
      return apiRequest('POST', '/api/admin/base-bodies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-bodies'] });
      toast({ title: 'Базовое тело создано' });
      setNewBody({ gender: 'male', imageUrl: '', isDefault: false });
    },
    onError: () => {
      toast({ title: 'Ошибка создания базового тела', variant: 'destructive' });
    },
  });

  const deleteBodyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/base-bodies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-bodies'] });
      toast({ title: 'Базовое тело удалено' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    },
  });

  const setDefaultBodyMutation = useMutation({
    mutationFn: async ({ id, gender }: { id: string; gender: string }) => {
      return apiRequest('PATCH', `/api/admin/base-bodies/${id}/default`, { gender });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-bodies'] });
      toast({ title: 'Базовое тело по умолчанию обновлено' });
    },
  });

  const createAccessoryMutation = useMutation({
    mutationFn: async (data: typeof newAccessory) => {
      return apiRequest('POST', '/api/admin/accessories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessories'] });
      toast({ title: 'Аксессуар создан' });
      setNewAccessory({
        categoryId: '',
        name: '',
        nameRu: '',
        descriptionRu: '',
        imageUrl: '',
        gender: 'both',
        positionX: 0,
        positionY: 0,
        zIndex: 1,
        price: 100,
        maxQuantity: null,
        isActive: true,
      });
    },
    onError: () => {
      toast({ title: 'Ошибка создания аксессуара', variant: 'destructive' });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/accessories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessories'] });
      toast({ title: 'Аксессуар удалён' });
    },
  });

  const toggleAccessoryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/accessories/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accessories'] });
    },
  });

  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingBody(true);
    try {
      // Step 1: Request presigned URL from backend
      const urlRes = await fetch('/api/admin/upload/request-url', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          contentType: file.type,
          uploadType: 'character'
        }),
      });
      
      if (!urlRes.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL, objectPath } = await urlRes.json();
      
      // Step 2: Upload file directly to Object Storage
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Step 3: Set ACL to public
      const aclRes = await fetch('/api/admin/upload/set-public', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectPath }),
      });
      
      if (aclRes.ok) {
        setNewBody({ ...newBody, imageUrl: objectPath });
        toast({ title: 'Изображение загружено' });
      } else {
        toast({ title: 'Ошибка настройки доступа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploadingBody(false);
    }
  };

  const handleAccessoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAccessory(true);
    try {
      // Step 1: Request presigned URL from backend
      const urlRes = await fetch('/api/admin/upload/request-url', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          contentType: file.type,
          uploadType: 'accessory'
        }),
      });
      
      if (!urlRes.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL, objectPath } = await urlRes.json();
      
      // Step 2: Upload file directly to Object Storage
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Step 3: Set ACL to public
      const aclRes = await fetch('/api/admin/upload/set-public', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectPath }),
      });
      
      if (aclRes.ok) {
        setNewAccessory({ ...newAccessory, imageUrl: objectPath });
        toast({ title: 'Изображение загружено' });
      } else {
        toast({ title: 'Ошибка настройки доступа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploadingAccessory(false);
    }
  };

  const slotOptions = [
    { value: 'head', label: 'Голова' },
    { value: 'eyes', label: 'Глаза' },
    { value: 'face', label: 'Лицо' },
    { value: 'body', label: 'Тело' },
    { value: 'background', label: 'Фон' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'both', label: 'Оба' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeSubTab === 'categories' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('categories')}
          data-testid="subtab-categories"
        >
          Категории
        </Button>
        <Button
          variant={activeSubTab === 'bodies' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('bodies')}
          data-testid="subtab-bodies"
        >
          Базовые тела
        </Button>
        <Button
          variant={activeSubTab === 'accessories' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('accessories')}
          data-testid="subtab-accessories"
        >
          Аксессуары
        </Button>
        <Button
          variant={activeSubTab === 'editor' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('editor')}
          data-testid="subtab-editor"
        >
          Редактор
        </Button>
      </div>

      {activeSubTab === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Категории аксессуаров</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Код (англ.)</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="head_wear"
                  data-testid="input-category-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Название (рус.)</Label>
                <Input
                  value={newCategory.nameRu}
                  onChange={(e) => setNewCategory({ ...newCategory, nameRu: e.target.value })}
                  placeholder="Головные уборы"
                  data-testid="input-category-nameRu"
                />
              </div>
              <div className="space-y-2">
                <Label>Слот</Label>
                <Select value={newCategory.slot} onValueChange={(v) => setNewCategory({ ...newCategory, slot: v })}>
                  <SelectTrigger data-testid="select-category-slot">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slotOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Порядок</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newCategory.sortOrder}
                    onChange={(e) => setNewCategory({ ...newCategory, sortOrder: parseInt(e.target.value) || 0 })}
                    data-testid="input-category-sort"
                  />
                  <Button
                    onClick={() => createCategoryMutation.mutate(newCategory)}
                    disabled={createCategoryMutation.isPending || !newCategory.name || !newCategory.nameRu}
                    data-testid="button-create-category"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`category-${cat.id}`}>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{cat.slot}</Badge>
                      <span className="font-medium">{cat.nameRu}</span>
                      <span className="text-muted-foreground text-sm">({cat.name})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCategoryMutation.mutate(cat.id)}
                      disabled={deleteCategoryMutation.isPending}
                      data-testid={`delete-category-${cat.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'bodies' && (
        <Card>
          <CardHeader>
            <CardTitle>Базовые тела персонажей</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Пол</Label>
                <Select value={newBody.gender} onValueChange={(v) => setNewBody({ ...newBody, gender: v })}>
                  <SelectTrigger data-testid="select-body-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Изображение</Label>
                <div className="flex gap-2">
                  <Input
                    value={newBody.imageUrl}
                    onChange={(e) => setNewBody({ ...newBody, imageUrl: e.target.value })}
                    placeholder="URL или загрузите файл"
                    data-testid="input-body-url"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleBodyImageUpload}
                      className="hidden"
                      data-testid="input-body-file"
                    />
                    <Button type="button" variant="outline" disabled={uploadingBody} asChild>
                      <span>
                        {uploadingBody ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </span>
                    </Button>
                  </label>
                </div>
                {newBody.imageUrl && (
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden mt-2">
                    <img src={newBody.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>По умолчанию</Label>
                <div className="flex gap-2 items-center">
                  <Switch
                    checked={newBody.isDefault}
                    onCheckedChange={(checked) => setNewBody({ ...newBody, isDefault: checked })}
                    data-testid="toggle-body-default"
                  />
                  <Button
                    onClick={() => createBodyMutation.mutate(newBody)}
                    disabled={createBodyMutation.isPending || !newBody.imageUrl}
                    data-testid="button-create-body"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {bodiesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {baseBodies.map((body: any) => (
                  <div key={body.id} className="border rounded-lg p-2 space-y-2" data-testid={`body-${body.id}`}>
                    <div className="aspect-square bg-muted rounded overflow-hidden">
                      <img src={body.imageUrl} alt="Body" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={body.gender === 'male' ? 'default' : 'secondary'}>
                          {body.gender === 'male' ? 'М' : 'Ж'}
                        </Badge>
                        {body.isDefault && <Badge variant="outline">По умолч.</Badge>}
                      </div>
                      <div className="flex gap-1">
                        {!body.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDefaultBodyMutation.mutate({ id: body.id, gender: body.gender })}
                            data-testid={`set-default-body-${body.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBodyMutation.mutate(body.id)}
                          data-testid={`delete-body-${body.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'accessories' && (
        <Card>
          <CardHeader>
            <CardTitle>Аксессуары</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select 
                  value={newAccessory.categoryId} 
                  onValueChange={(v) => setNewAccessory({ ...newAccessory, categoryId: v })}
                >
                  <SelectTrigger data-testid="select-accessory-category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nameRu}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Код (англ.)</Label>
                <Input
                  value={newAccessory.name}
                  onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
                  placeholder="cool_hat"
                  data-testid="input-accessory-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Название (рус.)</Label>
                <Input
                  value={newAccessory.nameRu}
                  onChange={(e) => setNewAccessory({ ...newAccessory, nameRu: e.target.value })}
                  placeholder="Крутая шляпа"
                  data-testid="input-accessory-nameRu"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Изображение</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAccessory.imageUrl}
                    onChange={(e) => setNewAccessory({ ...newAccessory, imageUrl: e.target.value })}
                    placeholder="URL или загрузите файл"
                    data-testid="input-accessory-url"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleAccessoryImageUpload}
                      className="hidden"
                      data-testid="input-accessory-file"
                    />
                    <Button type="button" variant="outline" disabled={uploadingAccessory} asChild>
                      <span>
                        {uploadingAccessory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </span>
                    </Button>
                  </label>
                </div>
                {newAccessory.imageUrl && (
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden mt-2">
                    <img src={newAccessory.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Пол</Label>
                <Select 
                  value={newAccessory.gender} 
                  onValueChange={(v) => setNewAccessory({ ...newAccessory, gender: v })}
                >
                  <SelectTrigger data-testid="select-accessory-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>X</Label>
                  <Input
                    type="number"
                    value={newAccessory.positionX}
                    onChange={(e) => setNewAccessory({ ...newAccessory, positionX: parseInt(e.target.value) || 0 })}
                    data-testid="input-accessory-x"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y</Label>
                  <Input
                    type="number"
                    value={newAccessory.positionY}
                    onChange={(e) => setNewAccessory({ ...newAccessory, positionY: parseInt(e.target.value) || 0 })}
                    data-testid="input-accessory-y"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Z</Label>
                  <Input
                    type="number"
                    value={newAccessory.zIndex}
                    onChange={(e) => setNewAccessory({ ...newAccessory, zIndex: parseInt(e.target.value) || 1 })}
                    data-testid="input-accessory-z"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цена (Beads)</Label>
                <Input
                  type="number"
                  value={newAccessory.price}
                  onChange={(e) => setNewAccessory({ ...newAccessory, price: parseInt(e.target.value) || 0 })}
                  data-testid="input-accessory-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Лимит (пусто = безлимит)</Label>
                <Input
                  type="number"
                  value={newAccessory.maxQuantity ?? ''}
                  onChange={(e) => setNewAccessory({ ...newAccessory, maxQuantity: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="∞"
                  data-testid="input-accessory-limit"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => createAccessoryMutation.mutate(newAccessory)}
                  disabled={createAccessoryMutation.isPending || !newAccessory.categoryId || !newAccessory.name || !newAccessory.nameRu || !newAccessory.imageUrl}
                  className="w-full"
                  data-testid="button-create-accessory"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать
                </Button>
              </div>
            </div>

            {accessoriesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {accessories.map((acc: any) => (
                  <div key={acc.id} className="flex items-center gap-4 p-3 border rounded-lg" data-testid={`accessory-${acc.id}`}>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img src={acc.imageUrl} alt={acc.nameRu} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{acc.nameRu}</span>
                        <Badge variant="outline">{acc.gender === 'both' ? 'Все' : acc.gender === 'male' ? 'М' : 'Ж'}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{acc.price} Beads</span>
                        {acc.maxQuantity && <span>• Лимит: {acc.soldCount}/{acc.maxQuantity}</span>}
                        <span>• Z: {acc.zIndex}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={acc.isActive}
                        onCheckedChange={(checked) => toggleAccessoryMutation.mutate({ id: acc.id, isActive: checked })}
                        data-testid={`toggle-accessory-${acc.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAccessoryMutation.mutate(acc.id)}
                        data-testid={`delete-accessory-${acc.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'editor' && (
        <Card>
          <CardHeader>
            <CardTitle>Визуальный редактор аксессуаров</CardTitle>
            <p className="text-sm text-muted-foreground">
              Перетаскивайте аксессуары мышью для настройки позиции
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <Label>Пол персонажа:</Label>
              <div className="flex gap-2">
                <Button
                  variant={editorGender === 'male' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditorGender('male')}
                  data-testid="button-editor-male"
                >
                  Мужской
                </Button>
                <Button
                  variant={editorGender === 'female' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditorGender('female')}
                  data-testid="button-editor-female"
                >
                  Женский
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div 
                className="editor-preview relative bg-muted rounded-lg overflow-hidden select-none"
                style={{ width: 300, height: 400 }}
                onMouseMove={handleEditorMouseMove}
                onMouseUp={handleEditorMouseUp}
                onMouseLeave={handleEditorMouseUp}
              >
                {getDefaultBody(editorGender) && (
                  <img 
                    src={getDefaultBody(editorGender).imageUrl}
                    alt="Base body"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ zIndex: 0 }}
                  />
                )}
                
                {filteredAccessories
                  .sort((a: any, b: any) => {
                    const posA = editedPositions[a.id] || { z: a.zIndex };
                    const posB = editedPositions[b.id] || { z: b.zIndex };
                    return posA.z - posB.z;
                  })
                  .map((acc: any) => {
                    const pos = editedPositions[acc.id] || { x: acc.positionX, y: acc.positionY, z: acc.zIndex, scale: parseFloat(acc.scale || '1') };
                    const isSelected = acc.id === selectedAccessoryId;
                    const imgSize = 80 * (pos.scale || 1);
                    return (
                      <img
                        key={acc.id}
                        src={acc.imageUrl}
                        alt={acc.nameRu}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: pos.x,
                          top: pos.y,
                          zIndex: pos.z + 1,
                          width: imgSize,
                          height: imgSize,
                          objectFit: 'contain',
                          opacity: isSelected ? 1 : 0.8,
                        }}
                        onMouseDown={(e) => handleEditorMouseDown(e, acc)}
                        draggable={false}
                        data-testid={`editor-accessory-${acc.id}`}
                      />
                    );
                  })}

                <div className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
                  {editorGender === 'male' ? 'М' : 'Ж'} | 300x400
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Выберите аксессуар для редактирования:</h3>
                <ScrollArea className="h-[350px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {filteredAccessories.map((acc: any) => {
                      const pos = editedPositions[acc.id] || { x: acc.positionX, y: acc.positionY, z: acc.zIndex, scale: parseFloat(acc.scale || '1') };
                      const hasChanges = editedPositions[acc.id] !== undefined;
                      const isSelected = acc.id === selectedAccessoryId;
                      
                      return (
                        <div 
                          key={acc.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedAccessoryId(acc.id)}
                          data-testid={`editor-select-${acc.id}`}
                        >
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img src={acc.imageUrl} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{acc.nameRu}</div>
                            <div className="text-xs text-muted-foreground">
                              X: {pos.x} | Y: {pos.y} | Z: {pos.z} | S: {pos.scale?.toFixed(1)}
                            </div>
                          </div>
                          {hasChanges && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); saveAccessoryPosition(acc.id); }}
                              disabled={updateAccessoryPositionMutation.isPending}
                              data-testid={`button-save-pos-${acc.id}`}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {selectedAccessoryId && currentPosition && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">{selectedAccessory?.nameRu}</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">X</Label>
                          <Input
                            type="number"
                            value={currentPosition.x}
                            onChange={(e) => setEditedPositions({
                              ...editedPositions,
                              [selectedAccessoryId]: { ...currentPosition, x: parseInt(e.target.value) || 0 }
                            })}
                            data-testid="input-editor-x"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Y</Label>
                          <Input
                            type="number"
                            value={currentPosition.y}
                            onChange={(e) => setEditedPositions({
                              ...editedPositions,
                              [selectedAccessoryId]: { ...currentPosition, y: parseInt(e.target.value) || 0 }
                            })}
                            data-testid="input-editor-y"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Z-index</Label>
                          <Input
                            type="number"
                            value={currentPosition.z}
                            onChange={(e) => setEditedPositions({
                              ...editedPositions,
                              [selectedAccessoryId]: { ...currentPosition, z: parseInt(e.target.value) || 1 }
                            })}
                            data-testid="input-editor-z"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Масштаб</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5"
                            value={currentPosition.scale}
                            onChange={(e) => setEditedPositions({
                              ...editedPositions,
                              [selectedAccessoryId]: { ...currentPosition, scale: parseFloat(e.target.value) || 1 }
                            })}
                            data-testid="input-editor-scale"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => saveAccessoryPosition(selectedAccessoryId)}
                        disabled={updateAccessoryPositionMutation.isPending || !editedPositions[selectedAccessoryId]}
                        data-testid="button-save-position"
                      >
                        {updateAccessoryPositionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Сохранить позицию
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DebugLogsTab() {
  const [logs, setLogs] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterSpawn, setFilterSpawn] = useState(true);
  
  const EXCLUDED_PATTERNS = [
    '[CRYPTO]',
    '[CRYPTO CONFIG]',
    '=== GAME STARTED ===',
    'initialBalls:',
    '[FRAME]',
    '[LOOP]',
    '[BOOST]',
    '[GAP-FOUND]',
    '[GAP]',
    '[CHECK]',
    '[MATCH]',
    '[LEFT]',
    '[RIGHT]',
    '[SHOOTER-SMART]',
  ];

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/debug-logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleClear = async () => {
    try {
      await fetch('/api/admin/debug-logs', { method: 'DELETE', credentials: 'include' });
      setLogs([]);
    } catch (e) {}
  };
  
  const filteredLogs = logs.filter(log => {
    for (const pattern of EXCLUDED_PATTERNS) {
      if (log.includes(pattern)) return false;
    }
    if (filterSpawn && (log.includes('[SPAWN]') || log.includes('[GAP-CLOSE]'))) {
      return true;
    }
    if (!filterSpawn) return true;
    return !filterSpawn;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Логи игровой механики
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Отладочные логи для анализа совпадений и удалений шаров
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                  data-testid="switch-auto-refresh"
                />
                <Label>Авто-обновление</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={filterSpawn} 
                  onCheckedChange={setFilterSpawn}
                  data-testid="switch-filter-spawn"
                />
                <Label>Только SPAWN/GAP</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLogs}
                data-testid="button-refresh-logs"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClear}
                data-testid="button-clear-logs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Записей: {filteredLogs.length} / {logs.length} (всего)
          </div>

          <ScrollArea className="h-[500px] border rounded-md p-3 bg-muted/30">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {logs.length === 0 ? 'Логов пока нет. Начните игру, чтобы увидеть логи.' : 'Нет логов с текущим фильтром.'}
              </div>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`p-1 rounded ${
                      log.includes('[SPAWN]') ? 'bg-emerald-500/30 text-emerald-300 font-bold' :
                      log.includes('[GAP-CLOSE]') ? 'bg-amber-500/30 text-amber-300 font-bold' :
                      log.includes('[CHAIN-REACT]') ? 'bg-purple-500/30 text-purple-300 font-bold' :
                      log.includes('[CHAIN-END]') ? 'bg-green-500/20 text-green-300' :
                      log.includes('[CHAIN-NOMATCH]') ? 'bg-yellow-500/20 text-yellow-300' :
                      log.includes('[CHAIN-BREAK]') ? 'bg-orange-500/20 text-orange-300' :
                      log.includes('[CHAIN-SHORT]') ? 'bg-orange-500/20 text-orange-300' :
                      log.includes('[SHOOTER-SMART]') ? 'bg-cyan-500/20 text-cyan-300' :
                      log.includes('[RESET]') ? 'bg-red-500/20 text-red-300' :
                      log.includes('removeBalls') ? 'bg-red-500/20 text-red-300' :
                      log.includes('MATCH') ? 'bg-green-500/20 text-green-300' :
                      log.includes('insertBall') ? 'bg-blue-500/20 text-blue-300' :
                      'text-foreground/80'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function BoostsTab() {
  const { toast } = useToast();
  const [editingBoost, setEditingBoost] = useState<Boost | null>(null);
  const [editForm, setEditForm] = useState({
    price: 0,
    durationSeconds: 0,
    effectValue: 0,
    isActive: true,
    sortOrder: 0,
  });

  const { data: boosts, isLoading } = useQuery<Boost[]>({
    queryKey: ["/api/admin/boosts"],
  });

  const updateBoostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Boost> }) => {
      return apiRequest("PATCH", `/api/admin/boosts/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boosts"] });
      toast({ title: "Сохранено", description: "Буст успешно обновлён" });
      setEditingBoost(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить буст", variant: "destructive" });
    },
  });

  const handleEdit = (boost: Boost) => {
    setEditingBoost(boost);
    setEditForm({
      price: boost.price,
      durationSeconds: boost.durationSeconds,
      effectValue: boost.effectValue,
      isActive: boost.isActive,
      sortOrder: boost.sortOrder,
    });
  };

  const handleSave = () => {
    if (!editingBoost) return;
    updateBoostMutation.mutate({
      id: editingBoost.id,
      updates: editForm,
    });
  };

  const handleToggleActive = (boost: Boost) => {
    updateBoostMutation.mutate({
      id: boost.id,
      updates: { isActive: !boost.isActive },
    });
  };

  const getBoostIcon = (type: string) => {
    switch (type) {
      case 'slowdown': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'bomb': return <Target className="w-5 h-5 text-red-400" />;
      case 'rainbow': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'rewind': return <RotateCcw className="w-5 h-5 text-green-400" />;
      case 'shield': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'magnet': return <Target className="w-5 h-5 text-orange-400" />;
      case 'laser': return <Target className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Управление бустами
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройте цены, эффекты и доступность бустов в магазине
          </p>
        </CardHeader>
        <CardContent>
          {!boosts || boosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Бусты не найдены. Добавьте их в базу данных.
            </div>
          ) : (
            <div className="space-y-4">
              {boosts.map((boost) => (
                <div
                  key={boost.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`boost-item-${boost.type}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getBoostIcon(boost.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{boost.nameRu}</span>
                        <Badge variant={boost.isActive ? "default" : "secondary"}>
                          {boost.isActive ? "Активен" : "Отключён"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{boost.descriptionRu}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Тип: <code>{boost.type}</code></span>
                        <span>Цена: <strong>{boost.price}</strong> Beads</span>
                        {boost.durationSeconds > 0 && (
                          <span>Длительность: <strong>{boost.durationSeconds}с</strong></span>
                        )}
                        {boost.effectValue > 0 && (
                          <span>Эффект: <strong>{boost.effectValue}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={boost.isActive}
                      onCheckedChange={() => handleToggleActive(boost)}
                      disabled={updateBoostMutation.isPending}
                      data-testid={`toggle-boost-${boost.type}`}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(boost)}
                          data-testid={`button-edit-boost-${boost.type}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getBoostIcon(boost.type)}
                            Редактировать: {boost.nameRu}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Цена (Beads)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                              data-testid="input-boost-price"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Длительность (секунды)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={editForm.durationSeconds}
                              onChange={(e) => setEditForm({ ...editForm, durationSeconds: parseInt(e.target.value) || 0 })}
                              data-testid="input-boost-duration"
                            />
                            <p className="text-xs text-muted-foreground">
                              Для бустов типа замедление. 0 = мгновенный эффект.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Значение эффекта</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={editForm.effectValue}
                              onChange={(e) => setEditForm({ ...editForm, effectValue: parseFloat(e.target.value) || 0 })}
                              data-testid="input-boost-effect"
                            />
                            <p className="text-xs text-muted-foreground">
                              Замедление: множитель скорости (0.5 = в 2 раза медленнее). Бомба: радиус. Откат: процент отката.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Порядок сортировки</Label>
                            <Input
                              type="number"
                              min="0"
                              value={editForm.sortOrder}
                              onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                              data-testid="input-boost-sort"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editForm.isActive}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                              data-testid="toggle-boost-active-edit"
                            />
                            <Label>Активен в магазине</Label>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              onClick={handleSave}
                              disabled={updateBoostMutation.isPending}
                              data-testid="button-save-boost"
                            >
                              {updateBoostMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Сохранить
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  createdAt: string;
}

function LeaguesTab() {
  const { toast } = useToast();
  const [editingLeague, setEditingLeague] = useState<LeagueData | null>(null);
  const [editForm, setEditForm] = useState({
    nameRu: '',
    nameEn: '',
    icon: '',
    minBeads: 0,
    maxRank: null as number | null,
    themeColor: '',
    sortOrder: 0,
    isActive: true,
  });

  const { data: leagues, isLoading } = useQuery<LeagueData[]>({
    queryKey: ["/api/admin/leagues"],
  });

  const updateLeagueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      return apiRequest("PUT", `/api/admin/leagues/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leagues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      toast({ title: "Сохранено", description: "Лига обновлена" });
      setEditingLeague(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить лигу", variant: "destructive" });
    },
  });

  const handleEdit = (league: LeagueData) => {
    setEditingLeague(league);
    setEditForm({
      nameRu: league.nameRu,
      nameEn: league.nameEn,
      icon: league.icon,
      minBeads: league.minBeads,
      maxRank: league.maxRank,
      themeColor: league.themeColor,
      sortOrder: league.sortOrder,
      isActive: league.isActive,
    });
  };

  const handleSave = () => {
    if (!editingLeague) return;
    updateLeagueMutation.mutate({ id: editingLeague.id, data: editForm });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Управление лигами
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройка требований для лиг. Гости не участвуют в лигах.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {leagues?.map((league) => (
                <div 
                  key={league.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                  style={{ borderLeftColor: league.themeColor, borderLeftWidth: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{league.icon}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {league.nameRu}
                        {!league.isActive && (
                          <Badge variant="secondary">Неактивна</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Мин. бидов: {league.minBeads.toLocaleString()} 
                        {league.maxRank && ` | Топ-${league.maxRank}`}
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(league)}
                        data-testid={`button-edit-league-${league.slug}`}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать лигу</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Название (RU)</Label>
                            <Input
                              value={editForm.nameRu}
                              onChange={(e) => setEditForm({ ...editForm, nameRu: e.target.value })}
                              data-testid="input-league-name-ru"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Название (EN)</Label>
                            <Input
                              value={editForm.nameEn}
                              onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                              data-testid="input-league-name-en"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Иконка</Label>
                            <Input
                              value={editForm.icon}
                              onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                              data-testid="input-league-icon"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Цвет темы</Label>
                            <Input
                              type="color"
                              value={editForm.themeColor}
                              onChange={(e) => setEditForm({ ...editForm, themeColor: e.target.value })}
                              data-testid="input-league-color"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Мин. бидов</Label>
                            <Input
                              type="number"
                              min="0"
                              value={editForm.minBeads}
                              onChange={(e) => setEditForm({ ...editForm, minBeads: parseInt(e.target.value) || 0 })}
                              data-testid="input-league-min-beads"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Макс. ранг (топ-N)</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Пусто = без ограничений"
                              value={editForm.maxRank || ''}
                              onChange={(e) => setEditForm({ ...editForm, maxRank: e.target.value ? parseInt(e.target.value) : null })}
                              data-testid="input-league-max-rank"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Порядок сортировки</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editForm.sortOrder}
                            onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 1 })}
                            data-testid="input-league-sort"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editForm.isActive}
                            onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                            data-testid="toggle-league-active"
                          />
                          <Label>Активна</Label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            onClick={handleSave}
                            disabled={updateLeagueMutation.isPending}
                            data-testid="button-save-league"
                          >
                            {updateLeagueMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Сохранить
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UsersWithoutCharactersResponse {
  users: Array<{ id: string; telegramId: string; firstName: string | null; username: string }>;
  count: number;
}

interface NotifyResponse {
  success: boolean;
  sentCount?: number;
  failedCount?: number;
  totalUsers?: number;
  message?: string;
}

function NotificationsTab() {
  const { toast } = useToast();
  
  const { data: usersWithoutChars, isLoading, refetch } = useQuery<UsersWithoutCharactersResponse>({
    queryKey: ['/api/admin/users-without-characters'],
  });

  const notifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/notify-character-creation');
      return response.json() as Promise<NotifyResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Уведомления отправлены',
          description: `Отправлено: ${data.sentCount}, Ошибок: ${data.failedCount}`,
        });
        refetch();
      }
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить уведомления',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Уведомления через Telegram
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Пользователи без персонажа</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Отправьте уведомление всем зарегистрированным пользователям, которые ещё не создали персонажа.
              Они получат сообщение с призывом создать персонажа и ссылкой на игру.
            </p>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {usersWithoutChars?.count || 0} пользователей
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    data-testid="button-refresh-users"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Обновить
                  </Button>
                </div>
                
                {(usersWithoutChars?.count || 0) > 0 && (
                  <>
                    <ScrollArea className="h-40 border rounded-md p-2">
                      <div className="space-y-1">
                        {usersWithoutChars?.users.map((u) => (
                          <div key={u.id} className="flex items-center gap-2 text-sm py-1">
                            <span className="text-muted-foreground">{u.telegramId}</span>
                            <span>—</span>
                            <span>{u.firstName || u.username}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Button
                      onClick={() => notifyMutation.mutate()}
                      disabled={notifyMutation.isPending}
                      data-testid="button-send-notifications"
                    >
                      {notifyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Отправить уведомления ({usersWithoutChars?.count})
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {(usersWithoutChars?.count || 0) === 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Все пользователи уже создали персонажей
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
