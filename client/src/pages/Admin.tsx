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
  TrendingUp
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

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users"],
  });

  const { data: configs } = useQuery<GameConfig[]>({
    queryKey: ["/api/admin/configs"],
  });

  const { data: prizePools } = useQuery<PrizePool[]>({
    queryKey: ["/api/admin/prize-pools"],
  });

  const { data: scoresData } = useQuery<ScoresResponse>({
    queryKey: ["/api/admin/scores"],
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
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
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your game</p>
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
                    <p className="text-sm text-muted-foreground">Total Users</p>
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
                    <p className="text-sm text-muted-foreground">Total Games</p>
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
                    <p className="text-sm text-muted-foreground">Active Prize Pool</p>
                    <p className="text-2xl font-bold" data-testid="text-active-pool">
                      {stats?.activePrizePool?.name || "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pools" data-testid="tab-pools">
              <Gift className="w-4 h-4 mr-2" />
              Pools
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="w-4 h-4 mr-2" />
              Config
            </TabsTrigger>
            <TabsTrigger value="scores" data-testid="tab-scores">
              <Trophy className="w-4 h-4 mr-2" />
              Scores
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
      toast({ title: "User updated", description: "Admin status changed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Users ({total})
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
                      <span>{user.totalPoints} pts</span>
                      <span>•</span>
                      <span>{user.gamesPlayed} games</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
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
      toast({ title: "Pool created", description: "Prize pool created successfully" });
      setDialogOpen(false);
      setNewPool({ name: "", totalAmount: 0, isActive: false });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create pool", variant: "destructive" });
    },
  });

  const updatePoolMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; isActive?: boolean; totalAmount?: number }) => {
      return apiRequest("PATCH", `/api/admin/prize-pools/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Pool updated", description: "Prize pool updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update pool", variant: "destructive" });
    },
  });

  const deletePoolMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/prize-pools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prize-pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Pool deleted", description: "Prize pool deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete pool", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Prize Pools ({pools.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-pool">
              <Plus className="w-4 h-4 mr-2" />
              Add Pool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Prize Pool</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="pool-name">Name</Label>
                <Input
                  id="pool-name"
                  value={newPool.name}
                  onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                  placeholder="Weekly Prize Pool"
                  data-testid="input-pool-name"
                />
              </div>
              <div>
                <Label htmlFor="pool-amount">Total Amount</Label>
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
                <Label htmlFor="pool-active">Active</Label>
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
                Create Pool
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {pools.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No prize pools yet</p>
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
                      {pool.isActive && <Badge className="bg-green-500">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amount: {pool.totalAmount.toLocaleString()}
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
      toast({ title: "Config saved", description: "Configuration saved successfully" });
      setDialogOpen(false);
      setNewConfig({ key: "", value: "", description: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save config", variant: "destructive" });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (key: string) => {
      return apiRequest("DELETE", `/api/admin/configs/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Config deleted", description: "Configuration deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete config", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Game Configuration ({configs.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-config">
              <Plus className="w-4 h-4 mr-2" />
              Add Config
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="config-key">Key</Label>
                <Input
                  id="config-key"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                  placeholder="crypto_spawn_rate"
                  data-testid="input-config-key"
                />
              </div>
              <div>
                <Label htmlFor="config-value">Value (JSON or string)</Label>
                <Input
                  id="config-value"
                  value={newConfig.value}
                  onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                  placeholder='0.08 or {"rate": 0.08}'
                  data-testid="input-config-value"
                />
              </div>
              <div>
                <Label htmlFor="config-desc">Description</Label>
                <Input
                  id="config-desc"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  placeholder="Spawn rate for crypto balls"
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
                Save Config
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No configurations yet</p>
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
          Recent Scores ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {scores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No scores yet</p>
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
                      {score.won && <Badge className="bg-green-500">Won</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Combo: x{score.maxCombo}</span>
                      <span>Duration: {score.duration}s</span>
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
