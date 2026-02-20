import {
  COLS, ROWS,
  PADDLE_H, PADDLE_SPEED, PADDLE_COL_LEFT, PADDLE_COL_RIGHT,
  BALL_SPEED_INC, WIN_SCORE,
} from './layout'
import { game, serveBall } from './state'

export function movePlayerUp(): void {
  if (!game.running) return
  game.playerY = Math.max(0, game.playerY - PADDLE_SPEED)
}

export function movePlayerDown(): void {
  if (!game.running) return
  game.playerY = Math.min(ROWS - PADDLE_H, game.playerY + PADDLE_SPEED)
}

function moveAI(): void {
  const aiCenter = game.aiY + PADDLE_H / 2
  const diff = game.ballY - aiCenter
  const speed = PADDLE_SPEED * 0.7
  if (Math.abs(diff) > 0.5) {
    game.aiY += Math.sign(diff) * Math.min(speed, Math.abs(diff))
  }
  game.aiY = Math.max(0, Math.min(ROWS - PADDLE_H, game.aiY))
}

export function tick(): void {
  if (!game.running) return

  game.ballX += game.ballDx * game.ballSpeed
  game.ballY += game.ballDy * game.ballSpeed

  // Bounce off top/bottom walls
  if (game.ballY < 0) {
    game.ballY = -game.ballY
    game.ballDy = Math.abs(game.ballDy)
  }
  if (game.ballY > ROWS - 1) {
    game.ballY = 2 * (ROWS - 1) - game.ballY
    game.ballDy = -Math.abs(game.ballDy)
  }

  // Player paddle collision (left side)
  if (
    game.ballX <= PADDLE_COL_LEFT + 1 &&
    game.ballDx < 0 &&
    game.ballY >= game.playerY &&
    game.ballY <= game.playerY + PADDLE_H
  ) {
    game.ballX = PADDLE_COL_LEFT + 1
    const hitPos = (game.ballY - game.playerY) / PADDLE_H
    const angle = (hitPos - 0.5) * Math.PI / 3
    game.ballDx = Math.cos(angle)
    game.ballDy = Math.sin(angle)
    game.rally++
    game.ballSpeed += BALL_SPEED_INC
  }

  // AI paddle collision (right side)
  if (
    game.ballX >= PADDLE_COL_RIGHT - 1 &&
    game.ballDx > 0 &&
    game.ballY >= game.aiY &&
    game.ballY <= game.aiY + PADDLE_H
  ) {
    game.ballX = PADDLE_COL_RIGHT - 1
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
  if (game.ballX >= COLS) {
    game.playerScore++
    if (game.playerScore >= WIN_SCORE) {
      game.running = false
      game.over = true
    } else {
      serveBall()
    }
    return
  }

  moveAI()
}
