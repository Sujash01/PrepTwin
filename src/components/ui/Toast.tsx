import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/helpers'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  }

  const backgrounds = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    info: 'bg-primary-500/20 border-primary-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-xl',
        'animate-slide-up',
        'max-w-md',
        backgrounds[type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-surface-100 text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-surface-500 hover:text-surface-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast message={toast.message} type={toast.type} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </div>
  )
}