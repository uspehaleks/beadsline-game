# Beads Line - Telegram Mini App Arcade Game

## Overview
Beads Line is a Zuma-style arcade game implemented as a Telegram Mini App. Players match colored balls to earn points, with special crypto-themed balls offering bonus points. The project aims to provide an engaging, competitive gaming experience within the Telegram ecosystem, featuring a global leaderboard and a unique crypto-based economic system. The long-term vision includes expanding reward mechanisms and user engagement.

## User Preferences
I prefer iterative development, with clear communication at each stage. Please ask for my approval before making any significant changes to the core game mechanics or economic system. I appreciate detailed explanations of complex technical decisions but prefer concise updates for routine tasks. Ensure all user-facing text and messages, especially within the Telegram bot, are in Russian.

## System Architecture
The application is built with a React (TypeScript) frontend, an Express.js (Node.js) backend, and a PostgreSQL database using Drizzle ORM. UI/UX utilizes Tailwind CSS and shadcn/ui for a responsive, mobile-first design, with Framer Motion for animations. Wouter is used for routing and TanStack Query with React Context for state management.

Key features include:
-   **Zuma-style Game Mechanics**: Canvas-based rendering with dynamic ball paths (spiral, zigzag, wave, snake across 10 levels).
-   **Session Management**: Telegram WebApp and guest authentication.
-   **Leaderboard**: Real-time ranking system.
-   **Beads Economic System**: In-game currency ("Beads") awarded for victories, managed via a central "House Account." Players can purchase extra lives with Beads. All transactions are audited.
-   **Crypto Ball Integration**: Special BTC, ETH, USDT balls provide bonus points and crypto rewards, subject to daily and per-game limits, tracked in user balances.
-   **Level System**: 10 progressively difficult levels, unlocked sequentially upon completion. Progress is persisted per user.
-   **Combo System**: Chain reactions when matching balls lead to combo bonuses.
-   **Maintenance Mode**: Admin-controlled feature to display a custom message and countdown during updates.
-   **Referral System**: A 2-level referral program rewarding referrers with Beads when their direct and indirect referrals play games.
-   **Telegram Bot Integration**: Commands for game launch, leaderboard, and help, all in Russian.
-   **Telegram Stars Payments**: In-app purchases for boost packages using Telegram Stars currency. Invoice creation via Bot API, pre-checkout validation, and async payment processing with userId verification from authenticated session payload.
-   **Cryptocurrency Payments**: NOWPayments integration for crypto payments (BTC, ETH, USDT, LTC, TRX, TON). Payment method selection dialog in BoostShop with address display and status polling.
-   **Team Accounting System**: Mini-bookkeeping in admin panel with 5 team members and automatic revenue distribution:
    - 10% to Development
    - 15% to Advertising
    - 75% split among active team members proportionally (based on sharePercent, default 15% each)
    - Tracks both Stars and USD revenue from all purchases
    - Editable team member names and roles

The system uses a `game_config` table for dynamic configuration, allowing admins to adjust economy parameters like points, combo multipliers, crypto spawn chances, and referral rewards at runtime.

## External Dependencies
-   **Database**: PostgreSQL (Neon)
-   **ORM**: Drizzle ORM
-   **Styling**: Tailwind CSS, shadcn/ui
-   **Animation**: Framer Motion
-   **State Management/API Client**: TanStack Query
-   **Telegram**: Telegram WebApp SDK, Telegram Bot API