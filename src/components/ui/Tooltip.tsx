'use client'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
	return (
		<TooltipPrimitive.Provider delayDuration={200}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Content
					sideOffset={6}
					className="z-50 rounded-lg bg-gray-900 px-2 py-1.5 text-xs text-white shadow-card data-[state=delayed-open]:animate-in data-[state=closed]:animate-out"
				>
					{content}
					<TooltipPrimitive.Arrow className="fill-gray-900" />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	)
}

