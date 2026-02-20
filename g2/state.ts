import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { COLS, ROWS, PADDLE_H, BALL_SPEED_INIT } from './layout'

export type GameState = {
  playerY: number
  aiY: number
  ballX: number
  ballY: number
  ballDx: number
  ballDy: number
  ballSpeed: number
  playerScore: number
  aiScore: number
  running: boolean
  over: boolean
  rally: number
  highScore: number
}

export function resetGame(): void {
  game.playerY = (ROWS - PADDLE_H) / 2
  game.aiY = (ROWS - PADDLE_H) / 2
  game.playerScore = 0
  game.aiScore = 0
  game.rally = 0
  game.running = true
  game.over = false
  serveBall()
}

export function serveBall(): void {
  game.ballX = COLS / 2
  game.ballY = ROWS / 2
  game.ballSpeed = BALL_SPEED_INIT
  game.rally = 0
  const angle = (Math.random() - 0.5) * Math.PI / 3
  const dir = Math.random() > 0.5 ? 1 : -1
  game.ballDx = dir * Math.cos(angle)
  game.ballDy = Math.sin(angle)
}

export const game: GameState = {
  playerY: (ROWS - PADDLE_H) / 2,
  aiY: (ROWS - PADDLE_H) / 2,
  ballX: COLS / 2,
  ballY: ROWS / 2,
  ballDx: 1,
  ballDy: 0,
  ballSpeed: BALL_SPEED_INIT,
  playerScore: 0,
  aiScore: 0,
  running: false,
  over: false,
  rally: 0,
  highScore: 0,
}

export async function fetchBestScore(): Promise<number> {
  appendEventLog('Score: fetching best score')
  const res = await fetch('/api/best-score')
  appendEventLog(`Score: GET status=${res.status}`)
  const data = await res.json()
  appendEventLog(`Score: GET response=${JSON.stringify(data)}`)
  const score: number = data.score ?? 0
  if (score > game.highScore) {
    game.highScore = score
  }
  return game.highScore
}

export async function submitScore(score: number): Promise<void> {
  appendEventLog(`Score: submitting score=${score}`)
  const res = await fetch('/api/best-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score }),
  })
  appendEventLog(`Score: POST status=${res.status}`)
  const data = await res.json()
  appendEventLog(`Score: POST response=${JSON.stringify(data)}`)
  game.highScore = data.score ?? score
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}
