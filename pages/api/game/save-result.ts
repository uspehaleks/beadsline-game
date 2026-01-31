// pages/api/game/save-result.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';
import { z } from 'zod';

// Define validation schema for the request body
const SaveGameResultSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  score: z.number().min(0, 'Score must be non-negative'),
  beadsEarned: z.number().min(0, 'Beads earned must be non-negative').optional().default(0),
  levelId: z.number().int().positive('Level ID must be a positive integer'),
  duration: z.number().min(0, 'Duration must be non-negative').optional(),
  maxCombo: z.number().min(0, 'Max combo must be non-negative').optional(),
  cryptoBtc: z.number().min(0, 'BTC collected must be non-negative').optional().default(0),
  cryptoEth: z.number().min(0, 'ETH collected must be non-negative').optional().default(0),
  cryptoUsdt: z.number().min(0, 'USDT collected must be non-negative').optional().default(0),
  won: z.boolean().optional().default(false),
  accuracy: z.number().min(0).max(100).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate the request body
    const validationResult = SaveGameResultSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { 
      userId, 
      score, 
      beadsEarned, 
      levelId, 
      duration, 
      maxCombo, 
      cryptoBtc, 
      cryptoEth, 
      cryptoUsdt, 
      won, 
      accuracy 
    } = validationResult.data;

    // Create the game score record
    const gameScore = await storage.createGameScore({
      odUserId: userId,
      levelId,
      score,
      cryptoBtc: Math.floor(cryptoBtc),
      cryptoEth: Math.floor(cryptoEth),
      cryptoUsdt: cryptoUsdt,
      maxCombo: maxCombo || 0,
      accuracy: accuracy || 0,
      duration: duration || 0,
      won,
    });

    // Process crypto rewards if any were collected
    if (cryptoBtc > 0 || cryptoEth > 0 || cryptoUsdt > 0) {
      await storage.processCryptoRewards(
        userId,
        cryptoBtc,
        cryptoEth,
        cryptoUsdt,
        gameScore.id
      );
    }

    // Process referral rewards based on beads earned
    if (beadsEarned > 0) {
      await storage.processReferralRewards(
        gameScore.id,
        userId,
        beadsEarned
      );
    }

    // Update user stats
    await storage.updateUserStats(userId, score);

    res.status(200).json({
      success: true,
      message: 'Game result saved successfully',
      gameScoreId: gameScore.id,
      data: {
        gameScore,
        beadsEarned,
      },
    });
  } catch (error) {
    console.error('Save game result error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to save game result',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}