// pages/api/game/start.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from headers, query params, or cookies (similar to auth/me.ts)
    let telegramId = req.headers['x-user-id'] as string ||
                     req.headers['user-id'] as string ||
                     req.query.userId as string ||
                     req.cookies?.userId;

    if (!telegramId) {
      // In development, use consistent test user ID
      if (process.env.NODE_ENV === 'development') {
        telegramId = 'test-user-default';
      } else {
        return res.status(401).json({ error: 'User not authenticated' });
      }
    }

    // Find user by telegramId
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { levelId } = req.body;
    // Use default levelId of 1 if not provided or invalid
    const validatedLevelId = (typeof levelId === 'number' && levelId >= 1) ? levelId : 1;

    // Fetch current configs from storage
    const { gameplayConfig, gameEconomyConfig, livesConfig } = await storage.getGameConfigsForLevel(validatedLevelId);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Note: In a real implementation, you'd store session data in a database or Redis
    // For now, we'll just return the session ID without storing it in memory
    // since Next.js API routes run in a serverless environment

    res.status(200).json({ sessionId, activePlayers: 1 }); // Just return 1 for now
  } catch (error) {
    console.error('Start game session error:', error);
    console.error('Full error details:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error);
    res.status(500).json({
      error: 'Failed to start session',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}