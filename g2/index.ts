import { createPongActions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: 'pong',
  name: 'Pong',
  pageTitle: 'Pong',
  connectLabel: 'Connect glasses',
  actionLabel: 'New game',
  initialStatus: 'Pong ready',
  createActions: createPongActions,
}

export default app
