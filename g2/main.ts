import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import type { AppActions, SetStatus } from '../_shared/app-types'
import { appendEventLog } from '../_shared/log'
import { initApp, startGame } from './app'

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Even bridge not detected within ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => window.clearTimeout(timer))
  })
}

export function createPongActions(setStatus: SetStatus): AppActions {
  let connected = false

  return {
    async connect() {
      setStatus('Pong: connecting to Even bridge...')
      appendEventLog('Pong: connect requested')

      try {
        const bridge = await withTimeout(waitForEvenAppBridge(), 6000)
        await initApp(bridge)
        connected = true
        setStatus('Pong: connected. Tap to start!')
        appendEventLog('Pong: connected to bridge')
      } catch (err) {
        console.error('[pong] connect failed', err)
        setStatus('Pong: bridge not found.')
        appendEventLog('Pong: connection failed')
      }
    },

    async action() {
      if (!connected) {
        setStatus('Pong: not connected')
        return
      }
      startGame()
      setStatus('Pong: new game!')
    },
  }
}
