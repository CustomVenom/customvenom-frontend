interface ConfidenceDecayBadgeProps {
  confidence: number;
  decayMetadata: {
    original_confidence: number;
    decay_applied: number;
    expires_in_hours: number;
  };
}

export function ConfidenceDecayBadge({ confidence: _confidence, decayMetadata }: ConfidenceDecayBadgeProps) {
  if (decayMetadata.decay_applied === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-orange-400">
      <span>⏱️</span>
      <span>
        Confidence adjusted down {(decayMetadata.decay_applied * 100).toFixed(0)}% due to stale data
        (expires in {decayMetadata.expires_in_hours}h)
      </span>
    </div>
  );
}
