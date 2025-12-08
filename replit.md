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
- **Objective**: Match 3+ same-colored balls before they reach the finish line
- **Controls**: Touch/click to aim, release to shoot
- **Scoring**: Points calculated during game, Beads ONLY awarded on victory
- **Crypto Balls**: Special balls with bonus Beads (spawn at 8% rate)
- **Win Condition**: Clear all balls
- **Lives System**: Start with 3 lives, lose one when ball reaches finish
- **Game Over**: When all lives are lost
- **Ball Colors**: Red, Blue, Green, Yellow, Purple
- **Dynamic Speed**: Constant base speed with light acceleration in last 20% of path

## Beads Economic System

### House Account
Central Beads pool managed via Admin Panel → Beads:
- **balance**: Current Beads available for distribution
- **salesIncome**: Total Beads received from player purchases
- **totalDistributed**: Total Beads awarded to players
- All transactions are logged in beads_transactions table

### Transaction Types
- `game_win_reward`: Beads awarded for game victory
- `buy_extra_life`: Player purchases extra life during game
- `referral_reward`: Referral commission earned
- `admin_adjustment`: Manual admin balance adjustment
- `house_deposit`: House account top-up

### Lives Configuration (Admin Panel → Beads)
```typescript
LivesConfig: {
  livesPerGame: 3,        // Starting lives
  extraLifeCost: 50,      // Beads to buy extra life
  extraLifeSeconds: 30,   // Bonus time per life (currently unused)
  maxExtraLives: 5        // Max lives that can be purchased per game
}
```

### Key Rules
- Beads are ONLY awarded on victory (full board clear)
- Lost games give 0 Beads (score displayed but not added)
- Extra lives can be purchased during game for Beads
- All transactions go through House Account with full audit trail
- Referral rewards only trigger on victory

## Game Configuration

### Static Config (client/src/lib/gameConfig.ts)
Path and physics parameters (compiled):
```typescript
path: {
  type: 'spiral',       // Spiral path from outside to center
  segments: 600,        // Path smoothness
  spiralTurns: 3.5,     // Number of spiral rotations
  outerRadius: 0.42,    // Starting radius (% of screen)
  innerRadius: 0.08,    // End radius near center
}
balls: {
  radius: 16,           // Ball size
  spacing: 0.016,       // Gap between balls
  initialCount: 50,     // Starting balls in chain
  shooterSpeed: 16,     // Projectile speed
  collisionRadius: 2.0, // Collision detection multiplier
}
speed: {
  base: 0.012,          // Base speed for visible movement
  max: 0.025,           // Maximum speed near finish
  accelerationStart: 0.8, // Accelerate at 80% of path
}
gameplay: {
  winCondition: 5000,   // Beads to win
  addBallsInterval: 4000, // Add new balls every 4s
  addBallsCount: 3,     // Balls to add
}
```

### Dynamic Economy Config (stored in game_config table)
Economy parameters configurable at runtime via Admin Panel → Экономика:
```typescript
GameEconomyConfig: {
  points: {
    normal: 5,          // Points per regular ball matched
    btc: 500,           // Bonus for BTC ball (added to normal)
    eth: 300,           // Bonus for ETH ball
    usdt: 200           // Bonus for USDT ball
  },
  combo: {
    multiplier: 1.5,    // Combo multiplier per chain
    maxChain: 10        // Maximum combo chain
  },
  crypto: {
    spawnChance: 0.08   // Chance for crypto ball (8%)
  },
  cryptoRewards: {
    btcPerBall: 0.00000005,  // BTC awarded per crypto-BTC ball (5 satoshi)
    ethPerBall: 0.0000001,   // ETH awarded per crypto-ETH ball (100 gwei)
    usdtPerBall: 0.01        // USDT awarded per crypto-USDT ball (1 cent)
  },
  dailyLimits: {
    btcMaxSatsPerDay: 300,       // Max satoshi per user per day
    ethMaxWeiPerDay: 3000000000000000,  // Max gwei per user per day  
    usdtMaxPerDay: 3.0           // Max USDT per user per day
  },
  pools: {
    btcBalanceSats: 100000,      // Project BTC pool (satoshi)
    ethBalanceWei: 1000000000000000,  // Project ETH pool (wei)
    usdtBalance: 100             // Project USDT pool
  },
  perGameLimits: {
    btcMaxBeadsPerGame: 15,      // Max BTC balls spawned per game
    ethMaxBeadsPerGame: 15,      // Max ETH balls spawned per game
    usdtMaxBeadsPerGame: 15      // Max USDT balls spawned per game
  }
}
```
**Note**: Crypto balls only give bonus points when matched in groups of 3+, not just collected.
**Note**: Crypto balances (BTC, ETH, USDT) are persisted to user accounts after each game.
**Note**: Daily limits reset at midnight UTC. Users can track their daily progress in the app.
**Note**: Per-game limits control how many crypto balls of each type can spawn during one game session.
**Note**: Crypto balls only spawn if the project pool has balance and the type is enabled.

### User Balance Tracking (in database)
Additional fields for daily limits tracking:
- `btc_balance_sats` (bigint) - Total BTC balance in satoshi
- `btc_today_sats` (bigint) - Satoshi earned today
- `btc_today_date` (date) - Date of last BTC earning
- `eth_balance_wei` (bigint) - Total ETH balance in gwei
- `eth_today_wei` (bigint) - Gwei earned today  
- `eth_today_date` (date) - Date of last ETH earning
- `usdt_today` (numeric) - USDT earned today
- `usdt_today_date` (date) - Date of last USDT earning

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
| `/api/crypto-balances` | GET | Get available crypto types (public) |
| `/api/admin/balances` | GET/PUT | Manage admin crypto fund |
| `/api/admin/users/:id` | PUT | Update user details |
| `/api/admin/users/:id` | DELETE | Soft delete user |
| `/api/admin/users/:id/restore` | PATCH | Restore deleted user |
| `/api/telegram/webhook` | POST | Telegram bot webhook (public) |
| `/api/telegram/info` | GET | Bot info (admin only) |
| `/api/telegram/setup-webhook` | POST | Setup webhook (admin only) |
| `/api/referral` | GET | Get user's referral code and link (requires auth) |
| `/api/referral/rewards` | GET | Get user's referral rewards history (requires auth) |
| `/api/referral/config` | GET | Get referral system config (public) |
| `/api/admin/referral/config` | PUT | Update referral config (admin only) |
| `/api/admin/referral/stats` | GET | Get all users' referral stats (admin only) |
| `/api/maintenance` | GET | Get maintenance mode status (public) |
| `/api/admin/maintenance` | PUT | Set maintenance mode (admin only) |

## Maintenance Mode
Admin can enable maintenance mode for site updates and development.

**Features:**
- Toggle switch in Admin Panel → Обслуживание tab
- Date/time picker for expected end time
- Custom message for users
- Countdown timer on maintenance page
- Auto-reload when maintenance ends

**Configuration (stored in game_config as 'maintenance_mode'):**
```typescript
MaintenanceConfig: {
  enabled: boolean,     // Whether maintenance mode is active
  endTime: string|null, // ISO datetime when maintenance ends
  message: string|null  // Custom message for users
}
```

**Behavior:**
- When enabled, non-admin users see a maintenance page with countdown
- Admin users can still access all pages normally
- Page auto-reloads when countdown expires or maintenance is disabled
- Polls server every 10-15 seconds for status changes

## Referral System (2-Level)
A 2-level referral system via Telegram bot with Beads-only rewards.

**How it works:**
- Each user gets a unique referral code (8 alphanumeric characters)
- Referral link format: `https://t.me/BOT_USERNAME?start=REFERRAL_CODE`
- When a new user opens the app via referral link, they become a referral
- Referrer earns % of Beads when their referrals play games

**Configuration (stored in game_config table as 'referral_config'):**
```typescript
ReferralConfig: {
  maxDirectReferralsPerUser: 1000,       // Max direct referrals per user
  level1RewardPercent: 10,               // % of Beads from direct referrals
  level2RewardPercent: 3,                // % of Beads from 2nd level referrals
  maxReferralBeadsPerRefPerDay: 1000000, // Daily cap from one referral
  maxReferralBeadsPerUserPerDay: 10000000 // Daily cap from all referrals
}
```

**Rules:**
- `referredBy` is set once on first registration and never changes
- Referral rewards are processed automatically when referral plays a game
- Rewards are added to referrer's totalPoints (Beads balance)

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
- **users**: Player profiles (id, telegramId, username, totalPoints, gamesPlayed, bestScore, referralCode, referredBy, directReferralsCount)
- **game_scores**: Individual game results (score, crypto counts, combo, accuracy, duration)
- **game_config**: Configuration key-value store
- **prize_pool**: Future reward system structure
- **referral_rewards**: Referral bonus history (userId, refUserId, level, beadsAmount, gameScoreId)

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
