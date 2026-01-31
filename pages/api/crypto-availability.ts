// API route handler for /api/crypto-availability
// Returns default crypto availability status as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return default crypto availability status
  res.status(200).json({
    btcEnabled: false,
    ethEnabled: false,
    usdtEnabled: false,
  });
}