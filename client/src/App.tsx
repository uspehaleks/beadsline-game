import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import LeagueLeaderboard from "@/pages/LeagueLeaderboard";
import Withdraw from "@/pages/Withdraw";
import NotFound from "@/pages/not-found";
import MaintenancePage from "@/components/MaintenancePage";
import { Loader2 } from "lucide-react";

interface MaintenanceConfig {
  enabled: boolean;
  endTime: string | null;
  message: string | null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/league/:slug" component={LeagueLeaderboard} />
      <Route path="/withdraw" component={Withdraw} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function TelegramRequiredScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-16 h-16 mx-auto">
          <linearGradient id="tgGrad" x1="9.858" y1="9.858" x2="38.142" y2="38.142" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#33bef0"/>
            <stop offset="1" stopColor="#0a85d9"/>
          </linearGradient>
          <path fill="url(#tgGrad)" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"/>
          <path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"/>
          <path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"/>
          <path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.022,18.679,30.066,18.417,29.897,18.196z"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-foreground">Beads Line</h1>
      <p className="text-muted-foreground mb-6">
        Игра доступна только в Telegram
      </p>
      <a 
        href="https://t.me/Beads_Line_Bot" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover-elevate"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="link-open-telegram"
      >
        Открыть в Telegram
      </a>
    </div>
  );
}

function MaintenanceWrapper() {
  const { user, isLoading: userLoading, error } = useUser();
  const [location] = useLocation();

  const {
    data: maintenance,
    isLoading: maintenanceLoading,
  } = useQuery<MaintenanceConfig>({
    queryKey: ["/api/maintenance"],
    refetchInterval: 15000,
    staleTime: 0,
  });

  // 1. ОПРЕДЕЛЯЕМ АДМИНКУ
  const isAdminPage = location.startsWith('/admin');

  // 2. ЕСЛИ ЭТО АДМИНКА - ПРОПУСКАЕМ ДАЛЬШЕ ДЛЯ ПРОВЕРКИ В КОМПОНЕНТЕ
  if (isAdminPage) {
    // Пропускаем проверку Telegram для админки, но проверяем права в компоненте Admin
    if (userLoading) {
      return <LoadingScreen />;
    }
    // Показываем компонент Admin, где будет проверка прав и форма входа
    return <Router />;
  }

  // 3. СТАНДАРТНЫЕ ПРОВЕРКИ ДЛЯ ИГРОКОВ
  if (maintenanceLoading || userLoading) {
    return <LoadingScreen />;
  }

  // Показываем экран Telegram только для определенных случаев, не для всех пользователей
  // Убираем проверку telegram_required, чтобы игра была доступна всем

  if (maintenance?.enabled && !user?.isAdmin) {
    return (
      <MaintenancePage
        endTime={maintenance.endTime}
        message={maintenance.message}
      />
    );
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <MaintenanceWrapper />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;