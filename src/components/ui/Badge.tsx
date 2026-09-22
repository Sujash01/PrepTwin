import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
      success: 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30',
      danger: 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30',
      neutral: 'bg-surface-700 text-surface-300 border border-surface-600',
      outline: 'bg-transparent text-surface-300 border border-surface-600',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
    }

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full font-medium border', variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'