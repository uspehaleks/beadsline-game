# Beads Line - Telegram Mini App Arcade Game

## Overview
A Zuma-style arcade game designed as a Telegram Mini App where players match colored balls to earn points. Special crypto-themed balls (BTC, ETH, USDT) provide bonus points. The game features a leaderboard, user profiles, and session-based gameplay.

## Current State
The application is a fully functional MVP with:
- Complete Zuma-style game mechanics with canvas rendering
- Crypto ball special items (BTC +500, ETH +300, USDT +200 points)
- Session-based authentication (Telegram WebApp or guest mode)
- Leaderboard with real-time updates
- PostgreSQL database for persistence
- Responsive mobile-first design

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Routing**: Wouter
- **State**: TanStack Query + React Context

## Project Structure
```
├── client/src/
│   ├── components/       # UI components
│   │   ├── GameCanvas.tsx      # Canvas-based game rendering
│   │   ├── GameHUD.tsx         # Score, timer, combo display
│   │   ├── GameScreen.tsx      # Main game container
│   │   ├── GameOverScreen.tsx  # Results modal
│   │   ├── MainMenu.tsx        # Home screen
│   │   ├── Leaderboard.tsx     # Player rankings
│   │   └── NextBallPreview.tsx # Next ball indicator
│   ├── contexts/
│   │   └── UserContext.tsx     # User state management
│   ├── hooks/
│   │   └── useGameState.ts     # Game logic hook
│   ├── lib/
│   │   ├── gameEngine.ts       # Core game mechanics
│   │   ├── telegram.ts         # Telegram WebApp SDK
│   │   ├── queryClient.ts      # API client
│   │   └── utils.ts
│   └── pages/
│       └── Home.tsx            # Main page controller
├── server/
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   ├── routes.ts       # API endpoints
│   └── index.ts        # Server entry
└── shared/
    └── schema.ts       # Database models & types
```

## Game Mechanics
- **Objective**: Match 3+ same-colored balls before time runs out
- **Controls**: Touch/click to aim, release to shoot
- **Scoring**: 100 Beads per ball, combo multipliers (1.5x per consecutive match)
- **Crypto Balls**: Special balls with bonus Beads (spawn at 8% rate)
- **Win Condition**: Score 5000+ Beads in 60 seconds
- **Ball Colors**: Red, Blue, Green, Yellow, Purple
- **Dynamic Speed**: Balls start slow and accelerate as they approach finish

## Game Configuration (client/src/lib/gameConfig.ts)
All game parameters are centralized for easy tuning:
```typescript
path: {
  segments: 350,        // Path length (more = longer path)
  amplitude: 0.35,      // Snake width
  frequency: 3.5,       // Number of curves
  startY: 0.1,          // Start position
  endY: 0.9,            // End position (finish line)
}
balls: {
  radius: 18,           // Ball size
  spacing: 0.028,       // Gap between balls
  initialCount: 25,     // Starting balls in chain
  shooterSpeed: 12,     // Projectile speed
}
speed: {
  base: 0.008,          // Starting speed (slow)
  max: 0.035,           // Maximum speed (at finish)
  accelerationCurve: 2.0, // Quadratic curve (1=linear, 2=smooth, 3=aggressive)
}
gameplay: {
  duration: 60,         // Game time in seconds
  winCondition: 5000,   // Points to win
}
```

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/telegram` | POST | Authenticate via Telegram |
| `/api/auth/guest` | POST | Create guest session |
| `/api/auth/me` | GET | Get current user (requires auth) |
| `/api/scores` | POST | Submit game score (requires auth) |
| `/api/leaderboard` | GET | Get top players |
| `/api/users/:id` | GET | Get user profile |
| `/api/config/:key` | GET | Get game config |
| `/api/telegram/webhook` | POST | Telegram bot webhook (public) |
| `/api/telegram/info` | GET | Bot info (admin only) |
| `/api/telegram/setup-webhook` | POST | Setup webhook (admin only) |

## Telegram Bot Integration
The game includes a Telegram bot that:
- Responds to commands: /start, /play, /leaderboard, /help
- Sends Mini App buttons to launch the game
- All messages are in Russian

**Bot Commands:**
- `/start` - Welcome message with "Play" button
- `/play` - Quick launch button
- `/leaderboard` - Shows top 10 players
- `/help` - Game instructions

**Admin Setup (via Admin Panel → Bot tab):**
1. Click "Настроить Webhook" to register bot with Telegram
2. Test by sending /start to your bot
3. Configure Menu Button in BotFather for Mini App launch

## Database Schema
- **users**: Player profiles (id, telegramId, username, totalPoints, gamesPlayed, bestScore)
- **game_scores**: Individual game results (score, crypto counts, combo, accuracy, duration)
- **game_config**: Configuration key-value store
- **prize_pool**: Future reward system structure

## Running the Application
```bash
npm run dev          # Start development server
npm run db:push      # Push database schema changes
npm run build        # Build for production
```

## Future Enhancements
- Admin dashboard for prize pool management
- Daily/weekly leaderboard resets
- Power-ups (slow-mo, color bomb, reverse)
- Multiple difficulty levels
- Sound effects and music
- Real reward distribution system
