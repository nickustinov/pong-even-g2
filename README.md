# Pong for Even G2

> See also: [G2 development notes](https://github.com/nickustinov/even-g2-notes/blob/main/G2.md) – hardware specs, UI system, input handling and practical patterns for Even Realities G2.

Pong game for [Even Realities G2](https://www.evenrealities.com/) smart glasses.

Player vs AI. Swipe to move your paddle, first to 7 wins. Global win count shared across all players via Redis.

### Play now

Scan this QR code in the Even Realities app (Even Hub page) to play on your G2 glasses with the shared global score system:

<img src="qr.png" width="200" />

<p>
  <img src="screenshot-splash.png" width="49%" />
  <img src="screenshot-game.png" width="49%" />
</p>

## Architecture

The game uses three different page layouts, switching between them via `rebuildPageContainer`:

- **Splash screen** – image container with logo + text container with instructions
- **Gameplay** – text container with unicode grid (`□` empty, `▦` paddle, `●` ball, `│` center line)
- **Game over** – image container with game over graphic + text container with score

A hidden text container with `isEventCapture: 1` and minimal content (`' '`) is present on every page. This receives scroll/tap events without the firmware's internal text scrolling consuming swipe gestures.

During gameplay, only `textContainerUpgrade` is called – no page rebuilds until the game ends.

```
tick() → pushFrame() → sleep(remaining) → repeat
```

The loop awaits each text push before scheduling the next tick. If a push is still in flight, the frame is silently dropped.

### Global win count

The win count is shared across all players via a Redis-backed API (`/api/best-score`). The Vercel serverless function uses a Lua script for atomic compare-and-set – a new count is only written if it exceeds the current value. The Redis key is `pong-even-g2:best`.

On app start, the current win count is fetched and displayed on the splash screen. When the player wins a game, the count is incremented and submitted. If it exceeds the stored value, Redis is updated and the new count is shown immediately.

Without `REDIS_URL` configured, scores won't persist between sessions.

### Grid

- 28 columns × 10 rows, no score display
- Floating-point physics, snapped to integers at render time
- ~80ms per tick (~12 frames/second)
- Ball speed increases with each rally

| Element | Character | Unicode |
|---------|-----------|---------|
| Empty | `□` | U+25A1 |
| Paddle | `▦` | U+25A6 |
| Ball | `●` | U+25CF |
| Center line | `│` | U+2502 |

## Controls

Swipe directions are inverted (swipe forward = paddle down, swipe back = paddle up).

| Input | Action |
|---|---|
| Tap | Start game / restart after game over |
| Swipe forward (up) | Move paddle down |
| Swipe back (down) | Move paddle up |
| Double tap | Start game / restart after game over |

## Project structure

```
g2/
  index.ts       App module registration
  main.ts        Bridge connection and auto-connect
  app.ts         Game loop orchestrator
  state.ts       Game state (paddles, ball, score, wins)
  game.ts        Physics, collision, AI
  renderer.ts    Text/image rendering, page layouts, frame push
  events.ts      Event normalisation + input dispatch
  layout.ts      Display and grid constants
  logo.png       Splash screen logo (200×100)
  gameover.png   Game over graphic (200×100)
api/
  best-score.js  Vercel serverless function (Redis)
```

## Setup

```bash
npm install
npm run dev
```

### Run with even-dev simulator

```bash
cd /path/to/even-dev
REDIS_URL="redis://..." APP_PATH=/path/to/pong-even-g2 ./start-even.sh
```

Set `REDIS_URL` to enable the global win count API. Without it, scores won't persist.

### Run on real glasses

Generate a QR code and scan it with the Even App:

```bash
npm run dev   # keep running
npm run qr    # generates QR code for http://<your-ip>:5173
```

### Package for distribution

```bash
npm run pack  # builds and creates pong.ehpk
```

## Tech stack

- **G2 frontend:** TypeScript + [Even Hub SDK](https://www.npmjs.com/package/@evenrealities/even_hub_sdk)
- **Build:** [Vite](https://vitejs.dev/)
- **Backend:** [Redis](https://redis.io/) via [ioredis](https://github.com/redis/ioredis) (global win count)
- **Hosting:** [Vercel](https://vercel.com/) (serverless API + static frontend)
- **CLI:** [evenhub-cli](https://www.npmjs.com/package/@evenrealities/evenhub-cli)
