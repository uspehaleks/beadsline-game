// API route handler for /api/game-economy
// Returns default economy configuration as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return default game economy configuration
  res.status(200).json({
    prices: {
      life: 50,
      boost: 25,
    },
    multipliers: {
      score: 1.0,
      crypto: 1.0,
    },
    cryptoAvailable: {
      btc: false,
      eth: false,
      usdt: false,
    },
    cryptoPrices: {
      btcPerThousand: 0.0001,
      ethPerThousand: 0.001,
      usdtPerThousand: 1,
    },
    cryptoRewardsEnabled: false,
    usdtFundEnabled: false,
  });
}