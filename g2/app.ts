import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { TICK_MS } from './layout'
import { game, setBridge, resetGame } from './state'
import { tick } from './game'
import {
  initDisplay,
  drawFrame,
  drawGameOver,
  pushFrame,
} from './renderer'
import { onEvenHubEvent, setStartGame } from './events'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function gameLoop(): Promise<void> {
  appendEventLog('Pong: game loop started')
  while (game.running) {
    const start = Date.now()

    tick()
    drawFrame()
    await pushFrame()

    const elapsed = Date.now() - start
    await sleep(Math.max(0, TICK_MS - elapsed))
  }

  if (game.over) {
    drawGameOver()
    await pushFrame()
    appendEventLog(`Pong: game over ${game.playerScore}-${game.aiScore}`)
  }
}

export function startGame(): void {
  if (game.running) return
  resetGame()
  drawFrame()
  void pushFrame().then(() => {
    void gameLoop()
  })
  appendEventLog('Pong: new game started')
}

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)
  setStartGame(startGame)

  appBridge.onEvenHubEvent((event) => {
    onEvenHubEvent(event)
  })

  await initDisplay()
  appendEventLog('Pong: ready. Tap to start.')
}
