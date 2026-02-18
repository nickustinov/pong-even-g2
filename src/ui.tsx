import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  Card,
  CardContent,
  Button,
} from '@jappyjan/even-realities-ui'
import type { AppModule, AppActions } from '../_shared/app-types'

function AppPanel({ app, actions }: { app: AppModule; actions: AppActions }) {
  const [connecting, setConnecting] = React.useState(false)
  const [running, setRunning] = React.useState(false)

  const handleConnect = async () => {
    if (connecting) return
    setConnecting(true)
    try {
      await actions.connect()
    } catch (e) {
      console.error('[ui] connect failed', e)
    } finally {
      setConnecting(false)
    }
  }

  const handleAction = async () => {
    if (running) return
    setRunning(true)
    try {
      await actions.action()
    } catch (e) {
      console.error('[ui] action failed', e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Card style={{ width: '100%' }}>
        <CardContent>
          <Button
            variant="primary"
            style={{ width: '100%' }}
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : (app.connectLabel ?? 'Connect')}
          </Button>
        </CardContent>
      </Card>
      <Card style={{ width: '100%' }}>
        <CardContent>
          <Button
            variant="default"
            style={{ width: '100%' }}
            onClick={handleAction}
            disabled={running}
          >
            {app.actionLabel ?? 'Action'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function renderAppUI(app: AppModule, actions: AppActions): void {
  const appEl = document.getElementById('app')
  if (!appEl) return

  // Remove raw HTML buttons
  for (const id of ['connectBtn', 'actionBtn']) {
    const el = document.getElementById(id)
    if (el) el.remove()
  }

  const heading = appEl.querySelector('h1')
  if (heading) heading.textContent = app.pageTitle ?? app.name

  const container = document.createElement('div')
  container.style.margin = '48px 0'

  const status = document.getElementById('status')
  if (status) {
    appEl.insertBefore(container, status)
  } else {
    appEl.appendChild(container)
  }

  createRoot(container).render(
    <React.StrictMode>
      <AppPanel app={app} actions={actions} />
    </React.StrictMode>,
  )
}
