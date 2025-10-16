'use client'
import { useDensity } from '@/hooks/useDensity'

export default function DensityToggle() {
	const { dense, toggle } = useDensity()
	return (
		<button
			onClick={toggle}
			className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
			aria-pressed={dense}
			aria-label="Toggle density"
		>
			<span className="font-medium">{dense ? 'Compact' : 'Comfortable'}</span>
		</button>
	)
}

