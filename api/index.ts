// Vercel API handler for the Express server
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/static.js';
import { storage } from '../server/storage.js';

// Create an Express app instance
const app = express();

// Middleware to parse JSON
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Initialize the routes and middleware
let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    try {
      await storage.ensureDefaultBaseBodies();
      const httpServer = createServer(app);
      await registerRoutes(httpServer, app);

      // In production, serve static files
      if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
      }
      routesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize server:', error);
    }
  }
}

// Initialize routes on startup
initializeRoutes().catch(console.error);

// Export the app for Vercel
export default app;