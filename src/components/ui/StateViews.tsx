import { type HTMLAttributes } from 'react'
import { Loader2, AlertTriangle, Inbox } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { Button } from './Button'

interface StateViewProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  className?: string
}

export function LoadingState({
  title = 'Loading',
  description = 'Please wait a moment...',
  className,
  ...props
}: StateViewProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      <div>
        <p className="font-medium text-surface-100">{title}</p>
        {description && <p className="text-sm text-surface-500 mt-1">{description}</p>}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong.',
  description = 'Please try again in a moment.',
  onRetry,
  className,
  ...props
}: StateViewProps & { onRetry?: () => void }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
      role="alert"
      {...props}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <p className="font-medium text-surface-100">{title}</p>
        {description && <p className="text-sm text-surface-500 mt-1">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  title = 'Nothing here yet.',
  description = 'Items you add will appear here.',
  actionLabel,
  onAction,
  className,
  ...props
}: StateViewProps & { actionLabel?: string; onAction?: () => void }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
      {...props}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center">
        <Inbox className="w-6 h-6 text-surface-500" />
      </div>
      <div>
        <p className="font-medium text-surface-100">{title}</p>
        {description && <p className="text-sm text-surface-500 mt-1">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}