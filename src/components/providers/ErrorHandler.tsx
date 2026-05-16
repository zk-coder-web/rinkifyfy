'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { getErrorMessage } from '@/lib/api-errors'

type NotificationType = 'error' | 'success' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

interface ErrorHandlerContextType {
  notifications: Notification[]
  showError: (title: string, message?: string) => void
  showSuccess: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showApiError: (error: unknown) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null)

export function useErrorHandler() {
  const context = useContext(ErrorHandlerContext)
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorHandlerProvider')
  }
  return context
}

export function ErrorHandlerProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotif = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotif])
    
    // Auto-remove após duration
    const duration = notification.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showError = useCallback((title: string, message?: string) => {
    addNotification({ type: 'error', title, message })
  }, [addNotification])

  const showSuccess = useCallback((title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }, [addNotification])

  const showApiError = useCallback((error: unknown) => {
    const message = getErrorMessage(error)
    addNotification({ 
      type: 'error', 
      title: 'Erro', 
      message,
      duration: 7000 // Erros ficam mais tempo na tela
    })
  }, [addNotification])

  return (
    <ErrorHandlerContext.Provider value={{
      notifications,
      showError,
      showSuccess,
      showWarning,
      showInfo,
      showApiError,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </ErrorHandlerContext.Provider>
  )
}

function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[]
  onRemove: (id: string) => void 
}) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <NotificationCard 
          key={notification.id} 
          notification={notification} 
          onRemove={() => onRemove(notification.id)} 
        />
      ))}
    </div>
  )
}

function NotificationCard({ 
  notification, 
  onRemove 
}: { 
  notification: Notification
  onRemove: () => void 
}) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  }

  const iconColors = {
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = icons[notification.type]

  return (
    <div 
      className={`
        pointer-events-auto
        rounded-xl border ${colors[notification.type]}
        p-4 shadow-lg backdrop-blur-sm
        animate-slide-up
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColors[notification.type]}`} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 dark:text-dark-text text-sm">
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-sm text-slate-600 dark:text-dark-muted mt-0.5">
              {notification.message}
            </p>
          )}
        </div>
        <button 
          onClick={onRemove}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/5 rounded-lg transition shrink-0"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      </div>
    </div>
  )
}
