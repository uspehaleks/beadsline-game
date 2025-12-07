import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
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

function MaintenanceWrapper() {
  const { user, isLoading: userLoading } = useUser();
  
  const { data: maintenance, isLoading: maintenanceLoading, isFetching: maintenanceFetching } = useQuery<MaintenanceConfig>({
    queryKey: ["/api/maintenance"],
    refetchInterval: 15000,
    staleTime: 0,
  });

  const isInitialLoading = maintenanceLoading || userLoading;
  
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

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
