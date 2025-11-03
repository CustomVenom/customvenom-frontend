import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full border',
  {
    variants: {
      variant: {
        trust: 'bg-trust-500/10 text-trust-600 border-trust-500/20',
        venom: 'bg-venom-500/10 text-venom-400 border-venom-500/20',
        strike: 'bg-gradient-to-r from-strike-400 to-strike-600 text-gray-900 border-0 shadow-md',
        alert: 'bg-alert-500/10 text-alert-600 border-alert-500/20',
        neutral: 'bg-gray-100 text-gray-600 border-gray-200',
        // Legacy variants for backward compatibility
        default: 'bg-venom-500/10 text-venom-400 border-venom-500/20',
        secondary: 'bg-gray-100 text-gray-600 border-gray-200',
        destructive: 'bg-alert-500/10 text-alert-600 border-alert-500/20',
        outline: 'border-2 border-venom-500 text-venom-500'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md'
    }
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { badgeVariants }

