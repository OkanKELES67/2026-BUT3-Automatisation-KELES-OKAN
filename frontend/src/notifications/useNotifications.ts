import { useContext } from 'react'
import { NotificationsContext, type NotificationsApi } from './NotificationsContext'

export function useNotifications(): NotificationsApi {
  const notifications = useContext(NotificationsContext)
  if (!notifications) {
    throw new Error('useNotifications must be used inside a NotificationsProvider')
  }

  return notifications
}
