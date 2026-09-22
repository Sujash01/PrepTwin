import { Fragment, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
  }

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          className={cn(
            'w-full bg-surface-900/95 backdrop-blur-xl border border-surface-700/50 rounded-2xl shadow-2xl',
            'animate-scale-in',
            sizes[size]
          )}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-surface-700/50">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-surface-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-surface-400">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Fragment>
  )
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-surface-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}