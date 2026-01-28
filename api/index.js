// Vercel API Handler using next-connect
import { createRouter } from 'next-connect';

// Отложенная инициализация хранилища для serverless среды
let storageInstance = null;
let storageInitialized = false;

async function getStorage() {
  if (!storageInstance) {
    const storageModule = await import('../server/storage.js');
    storageInstance = storageModule.storage;
  }
  return storageInstance;
}

// Create a router
const router = createRouter();

// Add a middleware to wait for initialization if needed
router.use(async (req, res, next) => {
  // Не ждем инициализации при каждом запросе для serverless совместимости
  next();
});

// Define specific routes
router.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
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