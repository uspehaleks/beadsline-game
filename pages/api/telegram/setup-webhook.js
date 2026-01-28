// Next.js API route for Telegram webhook setup
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real implementation, you would check admin authentication here
  // For now, we'll return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Webhook setup endpoint - requires admin authentication'
  });
}

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for POST requests
  },
};