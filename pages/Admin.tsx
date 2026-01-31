import { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { User, GameEconomyConfig, Boost, HouseAccountConfig, RevenueSummary } from '@shared/schema';

// Lazy load tab components
const UsersTab = lazy(() => import('../components/admin/UsersTab'));
const EconomyTab = lazy(() => import('../components/admin/EconomyTab'));
const LevelConfigTab = lazy(() => import('../components/admin/LevelConfigTab'));
const WalletsTab = lazy(() => import('../components/admin/WalletsTab'));
const StatsTab = lazy(() => import('../components/admin/StatsTab'));

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Queries for different admin sections
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  const { data: economyConfig, isLoading: economyLoading, refetch: refetchEconomyConfig } = useQuery({
    queryKey: ['admin-economy-config'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/economy-config');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  const { data: boosts = [], isLoading: boostsLoading, refetch: refetchBoosts } = useQuery({
    queryKey: ['admin-boosts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/boosts');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  const { data: walletAddresses, isLoading: walletsLoading, refetch: refetchWalletAddresses } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/wallets');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  const { data: revenueSummary, isLoading: statsLoading, refetch: refetchRevenueSummary } = useQuery({
    queryKey: ['admin-revenue-summary'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/revenue-summary');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Loading component for lazy loaded tabs
  const renderLoader = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="economy">Экономика</TabsTrigger>
          <TabsTrigger value="levels">Уровни</TabsTrigger>
          <TabsTrigger value="wallets">Кошельки</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Suspense fallback={renderLoader()}>
            <UsersTab users={users} refetchUsers={refetchUsers} />
          </Suspense>
        </TabsContent>

        <TabsContent value="economy" className="mt-6">
          <Suspense fallback={renderLoader()}>
            <EconomyTab
              economyConfig={economyConfig || {
                btcPriceSats: 0,
                ethPriceWei: 0,
                usdtPrice: 0,
                levelMultiplier: 1
              }}
              refetchEconomyConfig={refetchEconomyConfig}
              boosts={boosts}
              refetchBoosts={refetchBoosts}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="levels" className="mt-6">
          <Suspense fallback={renderLoader()}>
            <LevelConfigTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="wallets" className="mt-6">
          <Suspense fallback={renderLoader()}>
            <WalletsTab 
              walletAddresses={walletAddresses || {
                btc_address: '',
                eth_address: '',
                usdt_trc20_address: '',
                usdt_ton_address: ''
              }} 
              refetchWalletAddresses={refetchWalletAddresses} 
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Suspense fallback={renderLoader()}>
            <StatsTab 
              revenueSummary={revenueSummary || {
                totalRevenue: 0,
                btcRevenue: 0,
                ethRevenue: 0,
                usdtRevenue: 0
              }} 
              refetchRevenueSummary={refetchRevenueSummary} 
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}