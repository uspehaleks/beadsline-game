// pages/api/character/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Get character status from storage
    const character = await storage.getCharacter(user.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Return character status
    const status = {
      energy: 100, // This might come from the character object eventually
      health: 'healthy',
      mood: 'happy',
      hunger: character.hunger,
      thirst: character.thirst,
      fatigue: character.fatigue,
      // другие параметры статуса
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('Error in /api/character/status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}