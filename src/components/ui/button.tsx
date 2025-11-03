import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-venom-500 hover:bg-venom-600 text-white shadow-lg shadow-venom-500/30 hover:shadow-venom-500/50 hover:scale-105 focus:ring-venom-500',
        secondary: 'bg-field-700 hover:bg-field-600 text-gray-100 border border-field-600 focus:ring-field-500',
        ghost: 'text-venom-400 hover:text-venom-300 hover:bg-venom-500/10 focus:ring-venom-500',
        danger: 'bg-alert-500 hover:bg-alert-600 text-white focus:ring-alert-500',
        outline: 'border-2 border-venom-500 text-venom-500 hover:bg-venom-500 hover:text-white focus:ring-venom-500',
        // Legacy variants for backward compatibility
        default: 'bg-venom-500 hover:bg-venom-600 text-white shadow-lg shadow-venom-500/30 hover:shadow-venom-500/50 hover:scale-105 focus:ring-venom-500',
        destructive: 'bg-alert-500 hover:bg-alert-600 text-white focus:ring-alert-500',
        link: 'text-venom-500 underline-offset-4 hover:underline'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-5 py-2.5 text-base rounded-lg',
        lg: 'px-8 py-4 text-lg rounded-lg',
        icon: 'p-2 rounded-md',
        // Legacy sizes for backward compatibility
        default: 'px-5 py-2.5 text-base rounded-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }

