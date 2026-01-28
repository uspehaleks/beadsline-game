import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Environment info endpoint called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Возвращаем конкретные значения для каждого поля
  res.status(200).json({
    databaseHost: process.env.DATABASE_URL ? 'supabase.db' : 'Not Set',
    databasePort: process.env.DATABASE_URL ? '6543' : 'Not Set',
    sessionSecretStatus: process.env.SESSION_SECRET ? 'Set' : 'Not Set',
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}