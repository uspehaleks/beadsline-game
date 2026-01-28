import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceConfig {
  enabled: boolean;
  endTime: string | null;
  message: string | null;
}

interface MaintenancePageProps {
  endTime: string | null;
  message: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endTime: string | null): TimeLeft | null {
  if (!endTime) return null;
  
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const difference = end - now;
  
  if (difference <= 0) return null;
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
}

export default function MaintenancePage({ endTime: initialEndTime, message: initialMessage }: MaintenancePageProps) {
  const { data: maintenance } = useQuery<MaintenanceConfig>({
    queryKey: ["/api/maintenance"],
    refetchInterval: 10000,
  });

  const endTime = maintenance?.endTime ?? initialEndTime;
  const message = maintenance?.message ?? initialMessage;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(endTime));
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<string | null>(endTime);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    if (maintenance && !maintenance.enabled) {
      window.location.reload();
    }
  }, [maintenance]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(endTime));
    setIsExpired(false);
  }, [endTime]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const currentEndTime = endTimeRef.current;
      const newTimeLeft = calculateTimeLeft(currentEndTime);
      
      if (currentEndTime && !newTimeLeft) {
        setIsExpired(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Wrench className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">Технические работы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {message || "Мы обновляем приложение для улучшения вашего опыта. Пожалуйста, подождите."}
          </p>

          {isExpired ? (
            <div className="space-y-4">
              <p className="text-primary font-medium">Работы завершены!</p>
              <p className="text-sm text-muted-foreground">Страница обновится автоматически...</p>
            </div>
          ) : timeLeft ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                <span>Ожидаемое время запуска:</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2" data-testid="countdown-timer">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-foreground" data-testid="countdown-days">
                    {timeLeft.days}
                  </div>
                  <div className="text-xs text-muted-foreground">дней</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-foreground" data-testid="countdown-hours">
                    {timeLeft.hours}
                  </div>
                  <div className="text-xs text-muted-foreground">часов</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-foreground" data-testid="countdown-minutes">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-xs text-muted-foreground">минут</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-foreground" data-testid="countdown-seconds">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-xs text-muted-foreground">секунд</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Время окончания не указано
            </p>
          )}

          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="w-full"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить страницу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
