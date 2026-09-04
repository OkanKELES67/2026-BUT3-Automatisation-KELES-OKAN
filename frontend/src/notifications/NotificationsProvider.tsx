import { useCallback, useMemo, useState, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { NotificationsContext, type NotificationSeverity } from './NotificationsContext'

interface Notification {
  /** Bumped on every message so an identical text still restarts the auto-hide timer. */
  key: number
  message: string
  severity: NotificationSeverity
}

const autoHideDurationMs: Record<NotificationSeverity, number> = {
  success: 3000,
  error: 6000,
}

export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)

  const notify = useCallback((message: string, severity: NotificationSeverity) => {
    setNotification((current) => ({ key: (current?.key ?? 0) + 1, message, severity }))
  }, [])

  const notifications = useMemo(
    () => ({
      notifySuccess: (message: string) => notify(message, 'success'),
      notifyError: (message: string) => notify(message, 'error'),
    }),
    [notify],
  )

  return (
    <NotificationsContext.Provider value={notifications}>
      {children}

      <Snackbar
        key={notification?.key}
        open={notification !== null}
        autoHideDuration={notification ? autoHideDurationMs[notification.severity] : null}
        onClose={(_, reason) => reason !== 'clickaway' && setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          data-testid="notification"
          severity={notification?.severity ?? 'success'}
          variant="filled"
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  )
}
