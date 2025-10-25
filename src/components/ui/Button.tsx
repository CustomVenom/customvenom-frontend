import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'outline' | 'subtle'
	size?: 'sm' | 'md'
}

export function Button({ variant='primary', size='md', className, ...props }: Props) {
	const base = 'inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
	const sizes = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-4 text-sm'
	}[size]
	const variants = {
		primary: 'bg-primary-600 text-white hover:bg-primary-700',
		outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
		subtle: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
	}[variant]
	return <button className={clsx(base, sizes, variants, className)} {...props}/>
}

