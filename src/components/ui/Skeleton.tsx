export function Skeleton({ className = '' }: { className?: string }) {
	return <div className={`animate-pulse rounded bg-gray-200/80 dark:bg-gray-700/50 ${className}`} />
}

