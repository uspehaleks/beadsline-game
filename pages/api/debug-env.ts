import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Возвращаем все переменные окружения для диагностики (без чувствительных данных)
  const envVars = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlExists: typeof process.env.DATABASE_URL !== 'undefined',
    sessionSecretExists: typeof process.env.SESSION_SECRET !== 'undefined',
  };

  console.log('Environment variables check:', envVars);

  res.status(200).json(envVars);
}