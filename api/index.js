// Vercel API Handler using next-connect
import { createRouter } from 'next-connect';

// Create a router
const router = createRouter();

// Define specific routes
router.get('/api/health-check', (req, res) => {
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
});

// Telegram webhook setup route
router.post('/api/telegram/setup-webhook', async (req, res) => {
  // In a real implementation, you would check admin authentication here
  // For now, we'll return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Webhook setup endpoint - requires admin authentication'
  });
});

// Catch-all for other API routes
router.all('/api/(.*)', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export the handler
export default router.handler({
  onError: (err, req, res) => {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  },
});

export const config = {
  api: {
    bodyParser: false, // We'll handle body parsing as needed
  },
};