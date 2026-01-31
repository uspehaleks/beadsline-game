import type { Express } from 'express';
import { activeSessions } from '../game';
import { requireAuth } from '../middleware/auth';

export async function registerLevelRoutes(app: Express) {
  // Get level config for active session
  app.get('/api/session/:sessionId/level-config', requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = activeSessions.get(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Return the level config if it exists
      if (session.levelConfig) {
        res.json(session.levelConfig);
      } else {
        // Return null or default config if no custom config exists for this level
        res.json(null);
      }
    } catch (error) {
      console.error("Get level config error:", error);
      res.status(500).json({ error: "Failed to get level config" });
    }
  });
}