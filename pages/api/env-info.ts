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
      // Парсим URL базы данных для извлечения хоста и порта
      // Используем регулярное выражение, так как URL может быть в формате postgresql://
      const match = databaseUrl.match(/:\/\/[^:]+:[^@]+@([^:\/]+):(\d+)/);
      if (match) {
        databaseHost = match[1];
        databasePort = match[2];
      } else {
        // Если не удалось распарсить, используем сам URL как есть
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