import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, Network, Server } from 'lucide-react';

export default function DatabaseHealth() {
  const [status, setStatus] = useState({
    isConnected: false,
    isDatabaseAccessible: false,
    isTablesAccessible: false,
    lastCheck: null as string | null,
    error: null as string | null,
  });
  
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    setStatus({
      isConnected: false,
      isDatabaseAccessible: false,
      isTablesAccessible: false,
      lastCheck: null,
      error: null,
    });

    try {
      const response = await fetch('/api/health-check');
      const data = await response.json();

      if (response.ok) {
        setStatus({
          isConnected: true,
          isDatabaseAccessible: data.databaseConnected,
          isTablesAccessible: data.tablesAccessible,
          lastCheck: new Date().toLocaleString('ru-RU'),
          error: null,
        });
      } else {
        setStatus({
          isConnected: false,
          isDatabaseAccessible: false,
          isTablesAccessible: false,
          lastCheck: new Date().toLocaleString('ru-RU'),
          error: data.error || 'Неизвестная ошибка',
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isDatabaseAccessible: false,
        isTablesAccessible: false,
        lastCheck: new Date().toLocaleString('ru-RU'),
        error: error instanceof Error ? error.message : 'Ошибка при проверке подключения',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    if (status === null) return null;
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    if (status === null) return <Badge variant="secondary">Не проверено</Badge>;
    return status ? (
      <Badge variant="default" className="bg-green-600">ОК</Badge>
    ) : (
      <Badge variant="destructive">Ошибка</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Проверка подключения к базе данных</h1>
          <p className="text-muted-foreground">
            Страница для диагностики подключения к базе данных игры
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Состояние подключения</CardTitle>
            <Button 
              onClick={checkConnection} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Network className="w-4 h-4" />
              )}
              {loading ? 'Проверка...' : 'Проверить подключение'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Server className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Сервер</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.isConnected)}
                    <span>{status.isConnected ? 'Доступен' : 'Недоступен'}</span>
                    {getStatusBadge(status.isConnected)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Database className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">База данных</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.isDatabaseAccessible)}
                    <span>{status.isDatabaseAccessible ? 'Подключена' : 'Не подключена'}</span>
                    {getStatusBadge(status.isDatabaseAccessible)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Таблицы</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.isTablesAccessible)}
                    <span>{status.isTablesAccessible ? 'Доступны' : 'Недоступны'}</span>
                    {getStatusBadge(status.isTablesAccessible)}
                  </div>
                </div>
              </div>
            </div>

            {status.lastCheck && (
              <div className="mt-4 text-sm text-muted-foreground">
                Последняя проверка: {status.lastCheck}
              </div>
            )}

            {status.error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm font-medium text-destructive">Ошибка:</p>
                <p className="text-sm">{status.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация о подключении</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип базы данных:</span>
                <span>PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Среда выполнения:</span>
                <span>production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Серверная часть:</span>
                <span>Vercel Serverless</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Инструкция по устранению неполадок:</h4>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Если база данных не подключена, проверьте переменную DATABASE_URL в настройках Vercel</li>
                <li>Убедитесь, что Supabase проект активен и доступен</li>
                <li>Проверьте, что SSL настройки корректны (rejectUnauthorized: false)</li>
                <li>Убедитесь, что таблицы были созданы с помощью миграций</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}