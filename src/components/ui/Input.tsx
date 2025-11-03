import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-10' : 'pl-3',
            error
              ? 'border-alert-500 focus:border-alert-500 focus:ring-alert-500'
              : 'border-gray-300 focus:border-venom-500 focus:ring-venom-500',
            // Dark mode (for dashboard)
            'dark:bg-field-800 dark:border-field-600 dark:text-gray-100',
            'dark:placeholder:text-gray-500',
            error
              ? 'dark:border-alert-500 dark:focus:border-alert-500'
              : 'dark:focus:border-venom-500',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

