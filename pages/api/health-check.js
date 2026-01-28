// Next.js API route for health check
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Простой тест: проверяем, видит ли сервер переменные окружения
  const databaseUrlStatus = process.env.DATABASE_URL ? "Found" : "Not Found";

  console.log("Environment variables check:");
  console.log("- DATABASE_URL Status:", databaseUrlStatus);
  console.log("- PORT:", process.env.PORT || 'Not Set');
  console.log("- NODE_ENV:", process.env.NODE_ENV || 'Not Set');

  res.status(200).json({
    test: "hello",
    databaseUrlStatus: databaseUrlStatus,
    timestamp: new Date().toISOString(),
    message: 'Health check endpoint is working',
    env: {
      databaseUrlExists: !!process.env.DATABASE_URL,
      port: process.env.PORT || 'Not Set',
      nodeEnv: process.env.NODE_ENV || 'Not Set'
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};