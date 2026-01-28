import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Получаем информацию об окружении
  const databaseUrl = process.env.DATABASE_URL;
  let databaseHost = 'Not Set';
  let databasePort = 'Not Set';

  if (databaseUrl) {
    try {
      // Создаем вспомогательную функцию для парсинга URL базы данных
      const parseDbUrl = (url: string) => {
        // Для URL в формате postgresql://user:pass@host:port/database?params
        const match = url.match(/:\/\/[^:]+:[^@]+@([^:\/]+):(\d+)/);
        if (match) {
          return { host: match[1], port: match[2] };
        }
        // Если не удалось распарсить с помощью регулярного выражения,
        // пробуем использовать URL объект (преобразуем сначала к http://)
        try {
          // Заменяем postgresql:// на http:// для парсинга
          const httpUrl = url.replace(/^([a-zA-Z]+):\/\//, 'http://');
          const parsed = new URL(httpUrl);
          // Извлекаем порт (если не указан, используем 5432 по умолчанию для PostgreSQL)
          const port = parsed.port || '5432';
          // Извлекаем хост
          const host = parsed.hostname;
          return { host, port };
        } catch (urlError) {
          console.error('URL parsing failed:', urlError);
          return null;
        }
      };

      const parsed = parseDbUrl(databaseUrl);
      if (parsed) {
        databaseHost = parsed.host;
        databasePort = parsed.port;
      } else {
        console.log("Could not parse DATABASE_URL:", databaseUrl);
      }
    } catch (parseError) {
      console.error('Error parsing DATABASE_URL:', parseError);
      databaseHost = 'Parse Error';
      databasePort = 'Parse Error';
    }
  }

  const sessionSecretStatus = process.env.SESSION_SECRET ? 'Set' : 'Not Set';
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log("Environment info response:", {
    databaseHost,
    databasePort,
    sessionSecretStatus,
    nodeEnv
  });

  res.status(200).json({
    databaseHost,
    databasePort,
    sessionSecretStatus,
    nodeEnv,
    timestamp: new Date().toISOString(),
  });
}