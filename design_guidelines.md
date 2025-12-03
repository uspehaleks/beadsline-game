# Design Guidelines: Crypto Zuma Arcade Game (Telegram Mini App)

## Design Approach

**Reference-Based Approach**: Drawing inspiration from classic arcade games (Zuma, Bubble Shooter) combined with modern mobile game aesthetics and crypto/blockchain visual language. The design emphasizes vibrant energy, clarity, and instant readability crucial for fast-paced gameplay.

## Core Design Principles

1. **Mobile-First Arcade Aesthetic**: Bold, playful interface optimized for thumb-friendly interactions
2. **Instant Clarity**: Game state, score, and controls immediately understandable at a glance
3. **Crypto Integration**: Subtle blockchain theming without overwhelming the core gameplay experience
4. **Performance-Optimized**: Minimal DOM elements, canvas-based game rendering for smooth 60fps gameplay

## Typography System

**Font Selection**: 
- Primary: "Righteous" or "Fredoka One" (Google Fonts) - Bold, rounded, game-friendly display font
- Secondary: "Inter" or "DM Sans" - Clean, readable for UI elements and numbers

**Type Scale**:
- Game Title/Headers: text-4xl to text-5xl, font-black
- Score Display: text-3xl to text-4xl, font-bold, tabular-nums
- UI Labels: text-sm to text-base, font-semibold
- Body/Instructions: text-sm, font-medium

## Layout System

**Spacing Primitives**: Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6, p-8
- Element gaps: gap-4, gap-6
- Screen margins: mx-4, my-6

**Viewport Structure**:
- Game Canvas: Full viewport width, 70vh height for main play area
- HUD Overlay: Fixed positioning for score, timer, lives
- Bottom Controls: Fixed bottom panel (h-20 to h-24) for shooter preview and power-ups

## Component Library

### Game Screen Layout

**HUD (Heads-Up Display)**:
- Top bar (h-16): Timer (left), Current Score (center), Lives/Health (right)
- Semi-transparent backdrop with blur effect (backdrop-blur-md)
- Icons for crypto balls collected, combo multiplier indicator
- Spacing: px-4, py-3

**Game Canvas**:
- Central play area with curved path rendering
- Ball shooter at bottom-center of canvas
- Next ball preview below shooter (w-12 h-12)
- Canvas wrapper: aspect-ratio-[9/16] on mobile, max-h-[70vh]

**Bottom Control Panel**:
- Fixed positioning (fixed bottom-0 inset-x-0)
- Power-up buttons: Grid of 3-4 circular buttons (w-14 h-14)
- Spacing: p-4, gap-4
- Subtle gradient backdrop

### Pre-Game / Menu Screen

**Main Menu**:
- Centered layout (max-w-md mx-auto)
- Game logo/title: Large, prominent at top (mb-12)
- Play button: Extra large (h-16 w-full max-w-xs), rounded-2xl
- Stats panel: User points, rank position (p-6, rounded-xl)
- Quick stats grid: 2 columns showing total points, games played, best score
- Spacing between sections: space-y-8

**User Profile Card**:
- Compact header (h-20): Telegram avatar (w-12 h-12, rounded-full), username, total points
- Horizontal layout with space-between alignment

### Leaderboard Screen

**Layout**:
- Sticky header (h-16): "Leaderboard" title, filter tabs (All Time / Today / Week)
- Scrollable list of player entries (min-h-screen - h-16)
- Top 3 podium: Special cards with larger size (h-24) featuring rank medals
- Standard entries: h-16, flex layout with rank number, avatar, name, score

**Entry Structure**:
- Rank badge: w-8, positioned left
- Avatar: w-10 h-10, rounded-full
- Name & Score: Flex-1 with justify-between
- Entry spacing: border-b with py-3

### Game Over / Results Screen

**Modal Overlay**:
- Centered card (max-w-sm, rounded-3xl, p-8)
- Results hierarchy: Win/Lose status (text-3xl), Final score (text-5xl, mb-8)
- Stats breakdown: Grid layout (grid-cols-2, gap-4)
  - Crypto balls collected with icons
  - Combo count
  - Accuracy percentage
- Action buttons stacked (space-y-4): Play Again (primary), View Leaderboard (secondary), Main Menu (tertiary)

### Loading / Transition States

**Loading Spinner**:
- Centered bouncing ball animation
- Loading text below (text-sm, animate-pulse)
- Minimal layout: flex flex-col items-center justify-center h-screen

## Game-Specific Elements

**Ball Rendering**:
- Standard balls: Circular, w-12 h-12 in UI previews
- Crypto balls: Same size with distinct iconic symbols (₿, Ξ, ₮)
- Glow effects for special balls via box-shadow

**Path Visualization**:
- Curved rail/track beneath ball chain
- Width: 16-20px visual guide line
- Subtle depth with shadow or gradient treatment

**Shooter Interface**:
- Rotating shooter base: Circular container (w-16 h-16)
- Aim indicator: Thin dotted line or arrow showing trajectory
- Touch controls: Tap anywhere on canvas to aim/shoot direction

## Animations (Minimal)

**Critical Animations Only**:
- Ball launch: Quick scale and movement (duration-200)
- Match explosion: Particle burst on 3+ match (duration-300)
- Score pop-up: Scale and fade on points earned (duration-500)
- Button press: Subtle scale transform (scale-95 active:scale-90)

**Avoided Animations**:
- No page transitions
- No decorative background animations
- No hover states (mobile-first)

## Responsive Behavior

**Breakpoint Strategy**:
- Base (mobile): Optimized for 360-428px width Telegram WebApp
- sm (640px+): Slightly larger UI elements if viewed on tablet
- Canvas scales proportionally, maintaining aspect ratio
- Max-width container (max-w-md) centers content on larger screens

## Accessibility

**Game Accessibility**:
- High contrast mode support for ball colors
- Clear visual indicators for game state
- Tap targets minimum 44x44px
- Keyboard controls for non-touch testing (arrow keys, spacebar)
- Screen reader announcements for score changes and game events

## Images

No photographic images required. All visuals are icon-based or canvas-rendered game elements:
- Crypto symbols: Use icon fonts (₿ Ξ ₮) or SVG icons from crypto icon libraries
- Game balls: Rendered as canvas circles with fills
- Background: Gradient or subtle pattern, no hero images
- User avatars: Fetched from Telegram user profile

This design creates an energetic, focused arcade experience optimized for quick mobile gameplay sessions while maintaining the crypto theming and competitive leaderboard features.