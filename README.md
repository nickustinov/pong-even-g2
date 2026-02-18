# Pong Even G2

> See also: [G2 development notes](https://github.com/nickustinov/even-g2-notes/blob/main/G2.md) – hardware specs, UI system, input handling and practical patterns for Even Realities G2.

Pong game for [Even Realities G2](https://www.evenrealities.com/) smart glasses.

Player vs AI. Swipe to move your paddle, first to 7 wins. No server required.

## Controls

| Input | Action |
|---|---|
| Tap | Start game / restart |
| Swipe up | Move paddle up |
| Swipe down | Move paddle down |

## Game design

- 576×288 display, 50ms tick (~20fps self-pacing)
- Player paddle (left, white) vs AI paddle (right, grey)
- Ball speed increases with each rally
- First to 7 points wins
- AI tracks ball with slight speed disadvantage

## Architecture

Same optimized rendering pipeline as [snake-even-g2](https://github.com/nickustinov/snake-even-g2):

- Text container behind image for scroll event capture
- Persistent canvas, full redraw each frame (few objects = fast)
- Self-pacing game loop: `tick() → drawFrame() → await pushFrame() → sleep(remaining)`
- Frame skip on backpressure

```
g2/
  index.ts       App module registration
  main.ts        Bridge connection
  app.ts         Game loop orchestrator
  state.ts       Game state (paddles, ball, score)
  game.ts        Physics, collision, AI
  renderer.ts    Canvas rendering, image push
  events.ts      Event normalisation + input dispatch
  layout.ts      Display and game constants
```

## Setup

Requires [even-dev](https://github.com/BxNxM/even-dev) (Unified Even Hub Simulator v0.0.2).

```bash
npm install

ln -s /path/to/pong-even-g2/g2 /path/to/even-dev/apps/pong

cd /path/to/even-dev
APP_NAME=pong ./start-even.sh
```

## Tech stack

- **G2 frontend:** TypeScript + [Even Hub SDK](https://www.npmjs.com/package/@evenrealities/even_hub_sdk)
- **Build:** [Vite](https://vitejs.dev/)
