// API route handler for /api/lives-config
// Returns default lives configuration as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return default lives configuration
  res.status(200).json({ 
    maxLives: 5, 
    recoveryTime: 1800 
  });
}