import { useState, useEffect } from 'react';
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
    details: null as string | null,
    errorCode: null as string | null,
    errorDetail: null as string | null,
    errorHint: null as string | null,
  });

  const [envInfo, setEnvInfo] = useState({
    databaseHost: 'Not Available (Server-side only)',
    databasePort: 'Not Available (Server-side only)',
    sessionSecretStatus: 'Not Available (Server-side only)',
    nodeEnv: typeof window !== 'undefined' ? process.env.NODE_ENV || 'development' : 'Not Available'
  });

  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const fetchEnvInfo = async () => {
    try {
      const response = await fetch('/api/env-info', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('Environment info received:', data);
        setEnvInfo({
          databaseHost: data.databaseHost || 'Not Available',
          databasePort: data.databasePort || 'Not Available',
          sessionSecretStatus: data.sessionSecretStatus || 'Not Available',
          nodeEnv: data.nodeEnv || 'Not Available'
        });
      } else {
        console.error('Failed to fetch environment info:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);

        // В случае ошибки, используем реальные значения из ответа, если они есть
        try {
          const errorData = JSON.parse(errorText);
          setEnvInfo({
            databaseHost: errorData.databaseHost || 'Not Available',
            databasePort: errorData.databasePort || 'Not Available',
            sessionSecretStatus: errorData.sessionSecretStatus || 'Not Available',
            nodeEnv: errorData.nodeEnv || (typeof window !== 'undefined' ? process.env.NODE_ENV || 'production' : 'production')
          });
        } catch {
          // Если не можем распарсить ошибку, используем значения по умолчанию
          setEnvInfo({
            databaseHost: 'Not Available (Check Vercel Logs)',
            databasePort: 'Not Available (Check Vercel Logs)',
            sessionSecretStatus: 'Not Available (Check Vercel Logs)',
            nodeEnv: typeof window !== 'undefined' ? process.env.NODE_ENV || 'production' : 'production'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching environment info:', error);
      // В случае сетевой ошибки, используем реальные данные, если возможно
      setEnvInfo({
        databaseHost: 'supabase.db', // Используем значение по умолчанию
        databasePort: '6543', // Используем значение по умолчанию
        sessionSecretStatus: process.env.SESSION_SECRET ? 'Set' : 'Not Set', // Проверяем переменную на клиенте
        nodeEnv: typeof window !== 'undefined' ? process.env.NODE_ENV || 'production' : 'production'
      });
    }
  };

  const refreshHealthCheck = async () => {
    setRefreshLoading(true);
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
          details: null,
          errorCode: null,
          errorDetail: null,
          errorHint: null,
        });
      } else {
        setStatus({
          isConnected: false,
          isDatabaseAccessible: false,
          isTablesAccessible: false,
          lastCheck: new Date().toLocaleString('ru-RU'),
          error: data.error || 'Неизвестная ошибка',
          details: data.stack || null,
          errorCode: data.code || null,
          errorDetail: data.detail || null,
          errorHint: data.hint || null,
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isDatabaseAccessible: false,
        isTablesAccessible: false,
        lastCheck: new Date().toLocaleString('ru-RU'),
        error: error instanceof Error ? error.message : 'Ошибка при проверке подключения',
        details: error instanceof Error ? error.stack : null,
        errorCode: null,
        errorDetail: null,
        errorHint: null,
      });
    } finally {
      setRefreshLoading(false);
    }
  };

  // Загружаем информацию об окружении при монтировании компонента
  useEffect(() => {
    fetchEnvInfo();
  }, []);

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
          details: null,
          errorCode: null,
          errorDetail: null,
          errorHint: null,
        });
      } else {
        setStatus({
          isConnected: false,
          isDatabaseAccessible: false,
          isTablesAccessible: false,
          lastCheck: new Date().toLocaleString('ru-RU'),
          error: data.error || 'Неизвестная ошибка',
          details: data.stack || null,
          errorCode: data.code || null,
          errorDetail: data.detail || null,
          errorHint: data.hint || null,
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isDatabaseAccessible: false,
        isTablesAccessible: false,
        lastCheck: new Date().toLocaleString('ru-RU'),
        error: error instanceof Error ? error.message : 'Ошибка при проверке подключения',
        details: error instanceof Error ? error.stack : null,
        errorCode: null,
        errorDetail: null,
        errorHint: null,
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
                {status.details && (
                  <details className="mt-2 text-xs text-destructive">
                    <summary>Подробнее</summary>
                    <pre className="whitespace-pre-wrap">{status.details}</pre>
                  </details>
                )}
                {(status.errorCode || status.errorDetail || status.errorHint) && (
                  <details className="mt-2 text-xs text-destructive">
                    <summary>Дополнительная информация об ошибке</summary>
                    {status.errorCode && <div><strong>Код ошибки:</strong> {status.errorCode}</div>}
                    {status.errorDetail && <div><strong>Детали:</strong> {status.errorDetail}</div>}
                    {status.errorHint && <div><strong>Подсказка:</strong> {status.errorHint}</div>}
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Информация о подключении</CardTitle>
            <Button
              onClick={refreshHealthCheck}
              disabled={refreshLoading}
              className="flex items-center gap-2"
            >
              {refreshLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Network className="w-4 h-4" />
              )}
              {refreshLoading ? 'Обновление...' : 'Обновить'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип базы данных:</span>
                <span>PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Хост базы данных:</span>
                <span>{envInfo.databaseHost || 'Загрузка...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Порт базы данных:</span>
                <span>{envInfo.databasePort || 'Загрузка...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус SESSION_SECRET:</span>
                <span>{envInfo.sessionSecretStatus || 'Загрузка...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Среда выполнения (NODE_ENV):</span>
                <span>{envInfo.nodeEnv || 'Загрузка...'}</span>
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