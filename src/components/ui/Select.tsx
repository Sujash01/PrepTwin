import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[] | readonly string[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-surface-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-surface-800/50 border text-surface-100 placeholder-surface-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-surface-700 hover:border-surface-600',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(option => {
              const isString = typeof option === 'string'
              const value = isString ? option : option.value
              const optionLabel = isString ? option : option.label
              const isDisabled = !isString && option.disabled
              return (
                <option key={value} value={value} disabled={isDisabled} className="bg-surface-800">
                  {optionLabel}
                </option>
              )
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" aria-hidden="true" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-surface-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'