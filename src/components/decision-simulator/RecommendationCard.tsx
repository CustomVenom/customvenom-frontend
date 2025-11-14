'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DecisionVerdict } from '@/lib/types/decision';
import { Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  verdict: DecisionVerdict;
}

export function RecommendationCard({ verdict }: RecommendationCardProps) {
  const getConfidenceBadge = () => {
    switch (verdict.confidence_level) {
      case 'high':
        return { text: 'HIGH CONFIDENCE', color: 'bg-green-800 text-green-300' };
      case 'moderate':
        return { text: 'MODERATE CONFIDENCE', color: 'bg-yellow-800 text-yellow-300' };
      case 'low':
        return { text: 'LOW CONFIDENCE', color: 'bg-gray-700 text-gray-300' };
    }
  };

  const badge = getConfidenceBadge();

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold">{verdict.headline}</h2>
        </div>
        <Badge className={cn('text-xs', badge.color)}>{badge.text}</Badge>
      </div>
      <p className="text-lg leading-relaxed text-gray-300">{verdict.narrative}</p>
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          Verdict by the CustomVenom Intelligence Engine
        </p>
      </div>
    </Card>
  );
}
