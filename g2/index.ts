import { createPongActions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: 'pong',
  name: 'Pong',
  pageTitle: 'Pong',
  autoConnect: true,
  initialStatus: 'Pong ready',
  createActions: createPongActions,
}

export default app
