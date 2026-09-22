import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', label, ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="vertical"
          className={cn('self-stretch w-px bg-surface-700', className)}
          {...props}
        />
      )
    }

    if (label) {
      return (
        <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
          <div className="flex-1 h-px bg-surface-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-surface-500">{label}</span>
          <div className="flex-1 h-px bg-surface-700" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn('h-px w-full bg-surface-700', className)}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'