import { useState } from "react";
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
import type { User, GameConfig, PrizePool, GameScore } from "@shared/schema";
import { 
  Users, 
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
  Bitcoin
} from "lucide-react";
import { SiEthereum, SiTether } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
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
                    <Gamepad2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего игр</p>
                    <p className="text-2xl font-bold" data-testid="text-total-games">
                      {stats?.totalGames || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <Gift className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Активный призовой фонд</p>
                    <p className="text-2xl font-bold" data-testid="text-active-pool">
                      {stats?.activePrizePool?.name || "Нет"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="balances" data-testid="tab-balances">
              <Wallet className="w-4 h-4 mr-2" />
              Фонд
            </TabsTrigger>
            <TabsTrigger value="usdt-fund" data-testid="tab-usdt-fund">
              <SiTether className="w-4 h-4 mr-2" />
              USDT
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Игроки
            </TabsTrigger>
            <TabsTrigger value="pools" data-testid="tab-pools">
              <Gift className="w-4 h-4 mr-2" />
              Призы
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="scores" data-testid="tab-scores">
              <Trophy className="w-4 h-4 mr-2" />
              Очки
            </TabsTrigger>
            <TabsTrigger value="telegram" data-testid="tab-telegram">
              <Bot className="w-4 h-4 mr-2" />
              Бот
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balances">
            <CryptoBalancesTab balances={cryptoBalances || { btc: 0, eth: 0, usdt: 0 }} />
          </TabsContent>

          <TabsContent value="usdt-fund">
            <UsdtFundTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={usersData?.users || []} total={usersData?.total || 0} />
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
    usdtTotalFund: 50,
    usdtAvailable: 50,
    usdtDailyLimit: 1.0,
    usdtPerDrop: 0.02,
    usdtMaxPerUserPerDay: 0.1,
  });

  const { data: fundStats, isLoading } = useQuery<UsdtFundStatsResponse>({
    queryKey: ["/api/admin/usdt-fund/stats"],
  });

  const { data: fundSettings } = useQuery<UsdtFundSettingsData>({
    queryKey: ["/api/admin/usdt-fund"],
  });

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

  const settings = fundSettings || fundStats?.settings;

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
                ${settings?.usdtTotalFund?.toFixed(2) || '50.00'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Доступно</p>
              <p className="text-2xl font-bold text-green-500" data-testid="text-usdt-available">
                ${settings?.usdtAvailable?.toFixed(2) || '50.00'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Выдано сегодня</p>
              <p className="text-2xl font-bold text-amber-500" data-testid="text-usdt-today">
                ${fundStats?.distributedToday?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">
                лимит: ${settings?.usdtDailyLimit?.toFixed(2) || '1.00'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Всего выдано</p>
              <p className="text-2xl font-bold text-blue-500" data-testid="text-usdt-total-distributed">
                ${fundStats?.totalDistributed?.toFixed(2) || '0.00'}
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
    btcBalance: 0,
    ethBalance: 0,
    usdtBalance: 0,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Обновлено", description: "Данные пользователя сохранены" });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Удалено", description: "Пользователь удалён (мягкое удаление)" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить пользователя", variant: "destructive" });
    },
  });

  const restoreUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Восстановлено", description: "Пользователь восстановлен" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось восстановить пользователя", variant: "destructive" });
    },
  });

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      totalPoints: user.totalPoints,
      gamesPlayed: user.gamesPlayed,
      bestScore: user.bestScore,
      btcBalance: (user as User & { btcBalance?: number }).btcBalance || 0,
      ethBalance: (user as User & { ethBalance?: number }).ethBalance || 0,
      usdtBalance: (user as User & { usdtBalance?: number }).usdtBalance || 0,
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
            {users.map((user) => {
              const isDeleted = !!(user as User & { deletedAt?: Date }).deletedAt;
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isDeleted ? 'opacity-50 bg-muted' : ''}`}
                  data-testid={`user-row-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.username}</p>
                        {isDeleted && <Badge variant="destructive">Удалён</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.totalPoints} очков</span>
                        <span>•</span>
                        <span>{user.gamesPlayed} игр</span>
                        <span>•</span>
                        <span>Лучший: {user.bestScore}</span>
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
                      disabled={toggleAdminMutation.isPending || isDeleted}
                      data-testid={`toggle-admin-${user.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                      disabled={isDeleted}
                      data-testid={`edit-user-${user.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {isDeleted ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => restoreUserMutation.mutate(user.id)}
                        disabled={restoreUserMutation.isPending}
                        data-testid={`restore-user-${user.id}`}
                      >
                        <RotateCcw className="w-4 h-4 text-green-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                        disabled={deleteUserMutation.isPending}
                        data-testid={`delete-user-${user.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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
            <p className="text-sm font-medium text-muted-foreground">Крипто-балансы игрока</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="edit-btc" className="flex items-center gap-1 text-xs">
                  <Bitcoin className="w-3 h-3 text-amber-500" />
                  BTC
                </Label>
                <Input
                  id="edit-btc"
                  type="number"
                  step="0.0001"
                  value={editForm.btcBalance}
                  onChange={(e) => setEditForm({ ...editForm, btcBalance: parseFloat(e.target.value) || 0 })}
                  data-testid="input-edit-btc"
                />
              </div>
              <div>
                <Label htmlFor="edit-eth" className="flex items-center gap-1 text-xs">
                  <SiEthereum className="w-3 h-3 text-blue-500" />
                  ETH
                </Label>
                <Input
                  id="edit-eth"
                  type="number"
                  step="0.001"
                  value={editForm.ethBalance}
                  onChange={(e) => setEditForm({ ...editForm, ethBalance: parseFloat(e.target.value) || 0 })}
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Настройки игры ({configs.length})
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
            {configs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Пока нет настроек</p>
            ) : (
              configs.map((config) => (
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

  const { data: botInfo, isLoading: infoLoading, refetch: refetchInfo } = useQuery<TelegramBotInfo>({
    queryKey: ["/api/telegram/info"],
  });

  const setupWebhookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/telegram/setup-webhook", {});
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

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setupWebhookMutation.mutate()}
                disabled={setupWebhookMutation.isPending}
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
