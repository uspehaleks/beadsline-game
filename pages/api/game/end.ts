// pages/api/game/end.ts
import type { NextApiRequest, NextApiResponse } from 'next';

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

    // Note: In a real implementation, you'd verify the user owns the session
    // For now, we'll just return success without managing sessions in memory
    // since Next.js API routes run in a serverless environment

    const { sessionId } = req.body;
    // In a real implementation, you'd clean up session data here

    res.status(200).json({ success: true, activePlayers: 1 }); // Just return 1 for now
  } catch (error) {
    console.error('End game session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}