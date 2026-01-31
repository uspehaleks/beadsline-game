// fonts.ts - Local font declarations for Next.js app
import { Inter, Fredoka } from 'next/font/google';

// Configure local fonts with display swap for performance
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700'],
});