// Vercel API Route for Telegram Bot Webhook
import { createServer } from 'http';
import { parse } from 'url';
import nextConnect from 'next-connect';
import { registerRoutes } from '../../server/routes.js';
import { storage } from '../../server/storage.js';

// Create a handler for the API route
const handler = nextConnect();

// Initialize routes once when the module loads
let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    try {
      await storage.ensureDefaultBaseBodies();
      // Create a mock server to register routes
      const mockApp: any = {
        use: (path: string | Function, middleware?: any) => {
          if (typeof path === 'string') {
            // Register middleware for specific path
            handler.use(path, (req, res, next) => {
              if (typeof middleware === 'function') {
                return middleware(req, res, next);
              }
              next();
            });
          } else {
            // Register global middleware
            handler.use((req, res, next) => {
              return path(req, res, middleware);
            });
          }
        },
        get: (path: string, ...handlers: any[]) => {
          handler.get(path, ...handlers);
        },
        post: (path: string, ...handlers: any[]) => {
          handler.post(path, ...handlers);
        },
        put: (path: string, ...handlers: any[]) => {
          handler.put(path, ...handlers);
        },
        patch: (path: string, ...handlers: any[]) => {
          handler.patch(path, ...handlers);
        },
        delete: (path: string, ...handlers: any[]) => {
          handler.delete(path, ...handlers);
        },
        all: (path: string, ...handlers: any[]) => {
          handler.all(path, ...handlers);
        }
      };

      const httpServer = createServer();
      await registerRoutes(httpServer, mockApp);
      routesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize server:', error);
    }
  }
}

// Initialize routes on module load
initializeRoutes().catch(console.error);

// Handle all HTTP methods
export default async function apiRoute(req, res) {
  // Wait for routes to be initialized before handling requests
  if (!routesInitialized) {
    // Simple delay to ensure initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Pass the request to the handler
  return handler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};