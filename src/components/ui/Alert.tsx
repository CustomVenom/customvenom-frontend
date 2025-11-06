import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'danger' | 'success' | 'info'
  children: ReactNode
}

const alertVariants = {
  default: 'bg-gray-50 border-gray-200 text-gray-900 dark:bg-field-800 dark:border-field-600 dark:text-gray-100',
  danger: 'bg-alert-50 border-alert-200 text-alert-800 dark:bg-alert-900/20 dark:border-alert-500 dark:text-alert-400',
  success: 'bg-venom-50 border-venom-200 text-venom-800 dark:bg-venom-900/20 dark:border-venom-500 dark:text-venom-400',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
}

const iconMap = {
  default: Info,
  danger: AlertCircle,
  success: CheckCircle2,
  info: Info
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const Icon = iconMap[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4',
          alertVariants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

