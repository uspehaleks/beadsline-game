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
  XCircle
} from "lucide-react";
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

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-lg">
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

function UsersTab({ users, total }: { users: User[]; total: number }) {
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Игроки ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
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
                      <span>{user.totalPoints} очков</span>
                      <span>•</span>
                      <span>{user.gamesPlayed} игр</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.isAdmin && <Badge variant="secondary">Админ</Badge>}
                  <Switch
                    checked={user.isAdmin}
                    onCheckedChange={(isAdmin) =>
                      toggleAdminMutation.mutate({ userId: user.id, isAdmin })
                    }
                    disabled={toggleAdminMutation.isPending}
                    data-testid={`toggle-admin-${user.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
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
