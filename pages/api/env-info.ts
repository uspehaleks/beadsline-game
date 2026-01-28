import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Environment info endpoint called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Простая проверка наличия переменных окружения без сложного парсинга
  const databaseUrlStatus = process.env.DATABASE_URL ? "Found" : "Not Found";
  const sessionSecretStatus = process.env.SESSION_SECRET ? "Set" : "Not Set";
  const nodeEnv = process.env.NODE_ENV || "development";

  console.log("Environment variables check:");
  console.log("- DATABASE_URL Status:", databaseUrlStatus);
  console.log("- SESSION_SECRET Status:", sessionSecretStatus);
  console.log("- NODE_ENV:", nodeEnv);

  // Возвращаем простую информацию об окружении
  res.status(200).json({
    databaseHost: databaseUrlStatus,
    databasePort: databaseUrlStatus,
    sessionSecretStatus,
    nodeEnv,
    timestamp: new Date().toISOString(),
  });
}