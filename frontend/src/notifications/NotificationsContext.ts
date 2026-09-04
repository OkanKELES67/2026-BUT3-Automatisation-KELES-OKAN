import { createContext } from 'react'

export type NotificationSeverity = 'success' | 'error'

export interface NotificationsApi {
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void
}

export const NotificationsContext = createContext<NotificationsApi | null>(null)
