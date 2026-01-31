// API route handler for /api/user/boosts
// Returns empty array as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return empty array for user boosts
  res.status(200).json([]);
}