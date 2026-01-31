// API route handler for /api/gameplay-config
// Returns default gameplay configuration as a stub

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return default gameplay configuration
  res.status(200).json({
    speed: {
      base: 100,
      max: 200,
      increment: 5,
    },
    spawn: {
      period: 2000,
      initialCount: 5,
    },
    balls: {
      maxTotalBalls: 100,
      targetCount: 20,
    },
    chain: {
      maxSpeed: 150,
      speedIncrement: 10,
    },
    crypto: {
      spawnChance: 0.05,
      maxSimultaneous: 3,
    },
    rewards: {
      basePointsPerBall: 10,
      comboMultiplier: 1.5,
    },
  });
}