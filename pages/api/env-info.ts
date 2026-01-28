import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment info endpoint called');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Извлекаем хост из DATABASE_URL, если возможно
    let databaseHost = 'Not Set';
    let databasePort = 'Not Set';

    if (process.env.DATABASE_URL) {
      try {
        // Парсим URL для получения хоста и порта
        const url = new URL(process.env.DATABASE_URL);
        databaseHost = url.hostname;
        databasePort = url.port || '5432'; // по умолчанию PostgreSQL использует 5432
      } catch (urlError) {
        console.error('Error parsing DATABASE_URL:', urlError);
        // Если не можем распарсить, используем общее описание
        databaseHost = 'supabase.db';
        databasePort = '6543'; // предполагаем pgbouncer
      }
    }

    // Возвращаем конкретные значения для каждого поля
    res.status(200).json({
      databaseHost,
      databasePort,
      sessionSecretStatus: process.env.SESSION_SECRET ? 'Set' : 'Not Set',
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in env-info endpoint:', error);
    // В случае ошибки, возвращаем минимально возможный ответ
    res.status(500).json({
      databaseHost: 'Error',
      databasePort: 'Error',
      sessionSecretStatus: 'Error',
      nodeEnv: 'Error',
      timestamp: new Date().toISOString(),
    });
  }
}