import { Badge } from '@/components/ui/Badge'
import { clampReasons, Reason } from '@/lib/reasonsClamp'

export function ReasonChips({ reasons }: { reasons: Reason[] }) {
	const clamped = clampReasons(reasons)
	if (!clamped.length) return null
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{clamped.map((r, index) => (
				<Badge key={`${r.label}-${index}`} intent={r.effect >= 0 ? 'positive' : 'warning'}>
					{r.label} {r.effect > 0 ? `+${r.effect}%` : `${r.effect}%`}
				</Badge>
			))}
		</div>
	)
}

