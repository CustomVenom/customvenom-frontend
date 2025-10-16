'use client'
import { GLOSSARY } from '@/lib/glossary'
import { Tooltip } from '@/components/ui/Tooltip'

export function GlossaryTip({ term, children }: { term: keyof typeof GLOSSARY; children?: React.ReactNode }) {
	const text = GLOSSARY[term]
	return (
		<Tooltip content={`${term}: ${text}`}>
			<span tabIndex={0} className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 cursor-help">
				{children ?? term} <span aria-hidden>ⓘ</span>
			</span>
		</Tooltip>
	)
}

