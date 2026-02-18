import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { W, H, PADDLE_H, PADDLE_MARGIN, BALL_SIZE, BALL_SPEED_INIT } from './layout'

export type GameState = {
  // Paddles (y = top edge)
  playerY: number
  aiY: number
  // Ball (center)
  ballX: number
  ballY: number
  ballDx: number
  ballDy: number
  ballSpeed: number
  // Score
  playerScore: number
  aiScore: number
  // State
  running: boolean
  over: boolean
  rally: number
}

export function resetGame(): void {
  game.playerY = (H - PADDLE_H) / 2
  game.aiY = (H - PADDLE_H) / 2
  game.playerScore = 0
  game.aiScore = 0
  game.rally = 0
  game.running = true
  game.over = false
  serveBall()
}

export function serveBall(): void {
  game.ballX = W / 2
  game.ballY = H / 2
  game.ballSpeed = BALL_SPEED_INIT
  game.rally = 0
  // Random direction, biased toward the player who just scored
  const angle = (Math.random() - 0.5) * Math.PI / 3 // -30 to +30 degrees
  const dir = Math.random() > 0.5 ? 1 : -1
  game.ballDx = dir * Math.cos(angle)
  game.ballDy = Math.sin(angle)
}

export const game: GameState = {
  playerY: (H - PADDLE_H) / 2,
  aiY: (H - PADDLE_H) / 2,
  ballX: W / 2,
  ballY: H / 2,
  ballDx: 1,
  ballDy: 0,
  ballSpeed: BALL_SPEED_INIT,
  playerScore: 0,
  aiScore: 0,
  running: false,
  over: false,
  rally: 0,
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}
