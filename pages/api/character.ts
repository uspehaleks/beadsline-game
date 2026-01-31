// pages/api/character.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

      const character = await storage.getCharacter(user.id);

      let responseData;

      if (character) {
        // If character exists, get it with accessories
        const characterWithAccessories = await storage.getCharacterWithAccessories(user.id);

        // Ensure character has all required properties
        if (characterWithAccessories && characterWithAccessories.character) {
          responseData = characterWithAccessories;
        } else {
          // Fallback: return character data without accessories if there's an issue
          responseData = {
            character: character,
            baseBody: null,
            equippedAccessories: []
          };
        }
      } else {
        // If no character exists, return null
        responseData = null;
      }

      res.status(200).json(responseData);
    } catch (error) {
      console.error('Error in /api/character GET:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
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

      const { name, gender } = req.body;
      if (!name || !gender) {
        return res.status(400).json({ error: 'name and gender are required' });
      }
      if (gender !== 'male' && gender !== 'female') {
        return res.status(400).json({ error: "gender must be 'male' or 'female'" });
      }

      // Check if character already exists
      const existingCharacter = await storage.getCharacter(user.id);
      if (existingCharacter) {
        return res.status(400).json({ error: 'Character already exists' });
      }

      console.log("API: Create character request received", { userId: user.id, name, gender }); // Logging for debugging

      const character = await storage.createCharacter({ userId: user.id, name, gender });
      res.status(200).json(character);
    } catch (error) {
      console.error('Error in /api/character POST:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH' || req.method === 'PUT') {
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

      // Update character with provided data
      const updates = req.body;
      const updatedCharacter = await storage.updateCharacter(user.id, updates);

      if (!updatedCharacter) {
        return res.status(404).json({ error: 'Character not found' });
      }

      res.status(200).json(updatedCharacter);
    } catch (error) {
      console.error('Error in /api/character UPDATE:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}