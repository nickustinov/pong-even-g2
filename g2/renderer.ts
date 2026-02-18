import {
  CreateStartUpPageContainer,
  ImageContainerProperty,
  ImageRawDataUpdate,
  RebuildPageContainer,
  TextContainerProperty,
} from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import {
  W, H,
  PADDLE_W, PADDLE_H, PADDLE_MARGIN,
  BALL_SIZE, WIN_SCORE,
} from './layout'
import { game, bridge } from './state'

// ---------------------------------------------------------------------------
// Persistent canvas
// ---------------------------------------------------------------------------

const canvas = document.createElement('canvas')
canvas.width = W
canvas.height = H
const ctx = canvas.getContext('2d')!

let startupRendered = false
let pageSetUp = false

// ---------------------------------------------------------------------------
// Page setup – called ONCE
// ---------------------------------------------------------------------------

async function setupPage(): Promise<void> {
  if (!bridge) return
  const config = {
    containerTotalNum: 2,
    textObject: [
      new TextContainerProperty({
        containerID: 1,
        containerName: 'evt',
        content: ' ',
        xPosition: 0,
        yPosition: 0,
        width: W,
        height: H,
        isEventCapture: 1,
        paddingLength: 0,
      }),
    ],
    imageObject: [
      new ImageContainerProperty({
        containerID: 2,
        containerName: 'screen',
        xPosition: 0,
        yPosition: 0,
        width: W,
        height: H,
      }),
    ],
  }

  if (!startupRendered) {
    await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(config))
    startupRendered = true
  } else {
    await bridge.rebuildPageContainer(new RebuildPageContainer(config))
  }
  pageSetUp = true
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

export function drawFrame(): void {
  // Clear
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  // Center dashed line
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(W / 2, 0)
  ctx.lineTo(W / 2, H)
  ctx.stroke()
  ctx.setLineDash([])

  // Score
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#444'
  ctx.textAlign = 'right'
  ctx.fillText(`${game.playerScore}`, W / 2 - 20, 36)
  ctx.textAlign = 'left'
  ctx.fillText(`${game.aiScore}`, W / 2 + 20, 36)

  // Player paddle (left)
  ctx.fillStyle = '#fff'
  ctx.fillRect(PADDLE_MARGIN, game.playerY, PADDLE_W, PADDLE_H)

  // AI paddle (right)
  ctx.fillStyle = '#aaa'
  ctx.fillRect(W - PADDLE_MARGIN - PADDLE_W, game.aiY, PADDLE_W, PADDLE_H)

  // Ball
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(game.ballX, game.ballY, BALL_SIZE / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'left'
}

// ---------------------------------------------------------------------------
// Game over overlay
// ---------------------------------------------------------------------------

export function drawGameOver(): void {
  drawFrame()

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'

  const won = game.playerScore >= WIN_SCORE

  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText(won ? 'YOU WIN' : 'YOU LOSE', W / 2, H / 2 - 20)

  ctx.font = '18px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#aaa'
  ctx.fillText(`${game.playerScore} \u2013 ${game.aiScore}`, W / 2, H / 2 + 15)

  ctx.font = '12px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#555'
  ctx.fillText('Tap to play again', W / 2, H / 2 + 45)

  ctx.textAlign = 'left'
}

// ---------------------------------------------------------------------------
// Title screen
// ---------------------------------------------------------------------------

export function drawTitleScreen(): void {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  // Decorative paddles
  ctx.fillStyle = '#333'
  ctx.fillRect(PADDLE_MARGIN, (H - PADDLE_H) / 2, PADDLE_W, PADDLE_H)
  ctx.fillRect(W - PADDLE_MARGIN - PADDLE_W, (H - PADDLE_H) / 2, PADDLE_W, PADDLE_H)

  // Center line
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(W / 2, 0)
  ctx.lineTo(W / 2, H)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.textAlign = 'center'

  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText('PONG', W / 2, H / 2 - 20)

  ctx.font = '14px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#888'
  ctx.fillText(`Swipe to move \u00B7 First to ${WIN_SCORE} wins`, W / 2, H / 2 + 15)

  ctx.font = '12px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = '#555'
  ctx.fillText('Tap to start', W / 2, H / 2 + 40)

  ctx.textAlign = 'left'
}

// ---------------------------------------------------------------------------
// Image push
// ---------------------------------------------------------------------------

let pushInFlight = false

export async function pushFrame(): Promise<void> {
  if (!bridge || !pageSetUp) return
  if (pushInFlight) return
  pushInFlight = true
  try {
    const dataUrl = canvas.toDataURL('image/png')
    const binary = atob(dataUrl.split(',')[1])
    const bytes: number[] = new Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    await bridge.updateImageRawData(
      new ImageRawDataUpdate({
        containerID: 2,
        containerName: 'screen',
        imageData: bytes,
      }),
    )
  } finally {
    pushInFlight = false
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function initDisplay(): Promise<void> {
  await setupPage()
  drawTitleScreen()
  await pushFrame()
  appendEventLog('Pong: display initialized')
}
