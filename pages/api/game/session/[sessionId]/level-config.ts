// API route handler for /api/session/[sessionId]/level-config
// Returns empty object as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

// Define a custom type for the request to include query parameters
type SessionLevelConfigRequest = NextApiRequest & {
  query: {
    sessionId: string;
  };
};

export default function handler(req: SessionLevelConfigRequest, res: NextApiResponse) {
  const { sessionId } = req.query;

  // Validate sessionId if needed
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Return empty object as a stub
  res.status(200).json({});
}