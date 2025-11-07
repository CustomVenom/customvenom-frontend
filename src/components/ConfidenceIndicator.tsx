import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

interface ConfidenceIndicatorProps {
  confidence: number;
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const color = getConfidenceColor(confidence);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full ml-2 border border-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            style={{ backgroundColor: color }}
            aria-label={`Confidence ${Math.round(confidence * 100)} percent`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Confidence: {(confidence * 100).toFixed(0)}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981'; // green
  if (confidence >= 0.7) return '#3b82f6'; // blue
  if (confidence >= 0.65) return '#f59e0b'; // orange
  return '#ef4444'; // low confidence (should be filtered out before display)
}
