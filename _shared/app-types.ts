export type SetStatus = (text: string) => void

export type AppActions = {
  connect: () => Promise<void>
  action: () => Promise<void>
}

export type AppModule = {
  id: string
  name: string
  pageTitle?: string
  connectLabel?: string
  actionLabel?: string
  initialStatus?: string
  createActions: (setStatus: SetStatus) => Promise<AppActions> | AppActions
}
