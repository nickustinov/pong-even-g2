import {
  W, H,
  PADDLE_W, PADDLE_H, PADDLE_MARGIN, PADDLE_SPEED,
  BALL_SIZE, BALL_SPEED_INC, WIN_SCORE,
} from './layout'
import { game, serveBall } from './state'

export function movePlayerUp(): void {
  if (!game.running) return
  game.playerY = Math.max(0, game.playerY - PADDLE_SPEED)
}

export function movePlayerDown(): void {
  if (!game.running) return
  game.playerY = Math.min(H - PADDLE_H, game.playerY + PADDLE_SPEED)
}

function moveAI(): void {
  // AI tracks ball with slight delay – moves toward ball center
  const aiCenter = game.aiY + PADDLE_H / 2
  const diff = game.ballY - aiCenter
  const speed = PADDLE_SPEED * 0.7 // slightly slower than player
  if (Math.abs(diff) > 4) {
    game.aiY += Math.sign(diff) * Math.min(speed, Math.abs(diff))
  }
  game.aiY = Math.max(0, Math.min(H - PADDLE_H, game.aiY))
}

export function tick(): void {
  if (!game.running) return

  // Move ball
  game.ballX += game.ballDx * game.ballSpeed
  game.ballY += game.ballDy * game.ballSpeed

  // Bounce off top/bottom walls
  const half = BALL_SIZE / 2
  if (game.ballY - half <= 0) {
    game.ballY = half
    game.ballDy = Math.abs(game.ballDy)
  }
  if (game.ballY + half >= H) {
    game.ballY = H - half
    game.ballDy = -Math.abs(game.ballDy)
  }

  // Player paddle collision (left side)
  const pLeft = PADDLE_MARGIN
  const pRight = PADDLE_MARGIN + PADDLE_W
  if (
    game.ballX - half <= pRight &&
    game.ballX + half >= pLeft &&
    game.ballY + half >= game.playerY &&
    game.ballY - half <= game.playerY + PADDLE_H &&
    game.ballDx < 0
  ) {
    game.ballX = pRight + half
    const hitPos = (game.ballY - game.playerY) / PADDLE_H // 0 to 1
    const angle = (hitPos - 0.5) * Math.PI / 3 // -30 to +30 degrees
    game.ballDx = Math.cos(angle)
    game.ballDy = Math.sin(angle)
    game.rally++
    game.ballSpeed += BALL_SPEED_INC
  }

  // AI paddle collision (right side)
  const aLeft = W - PADDLE_MARGIN - PADDLE_W
  const aRight = W - PADDLE_MARGIN
  if (
    game.ballX + half >= aLeft &&
    game.ballX - half <= aRight &&
    game.ballY + half >= game.aiY &&
    game.ballY - half <= game.aiY + PADDLE_H &&
    game.ballDx > 0
  ) {
    game.ballX = aLeft - half
    const hitPos = (game.ballY - game.aiY) / PADDLE_H
    const angle = (hitPos - 0.5) * Math.PI / 3
    game.ballDx = -Math.cos(angle)
    game.ballDy = Math.sin(angle)
    game.rally++
    game.ballSpeed += BALL_SPEED_INC
  }

  // Score – ball past left edge
  if (game.ballX < 0) {
    game.aiScore++
    if (game.aiScore >= WIN_SCORE) {
      game.running = false
      game.over = true
    } else {
      serveBall()
    }
    return
  }

  // Score – ball past right edge
  if (game.ballX > W) {
    game.playerScore++
    if (game.playerScore >= WIN_SCORE) {
      game.running = false
      game.over = true
    } else {
      serveBall()
    }
    return
  }

  // Move AI
  moveAI()
}
