'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

interface QuickStatsProps {
  stats: QuickStat[];
  className?: string;
}

/**
 * QuickStats - Quick stats display component matching ESPN/Yahoo/Sleeper patterns
 *
 * Displays key team metrics in a card grid:
 * - Record, points, rank
 * - Trend indicators (up/down arrows)
 * - Icons for visual context
 * - Loading states
 */
export function QuickStats({ stats, className }: QuickStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {stats.map((stat, index) => {
        const trendIcon =
          stat.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-venom-400" />
          ) : stat.trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-alert-500" />
          ) : stat.trend === 'neutral' ? (
            <Minus className="h-4 w-4 text-gray-400" />
          ) : stat.change !== undefined ? (
            stat.change > 0 ? (
              <TrendingUp className="h-4 w-4 text-venom-400" />
            ) : stat.change < 0 ? (
              <TrendingDown className="h-4 w-4 text-alert-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-400" />
            )
          ) : null;

        const changeValue = stat.change !== undefined ? stat.change : null;

        return (
          <Card key={index} variant="dashboard" className="hover:border-venom-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                  {stat.isLoading ? (
                    <div className="h-8 w-24 bg-field-700 rounded animate-pulse mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                  )}
                  {changeValue !== null && !stat.isLoading && (
                    <div className="flex items-center gap-1 mt-1">
                      {trendIcon}
                      <span
                        className={cn(
                          'text-sm font-medium',
                          changeValue > 0
                            ? 'text-venom-400'
                            : changeValue < 0
                              ? 'text-alert-500'
                              : 'text-gray-400'
                        )}
                      >
                        {changeValue > 0 ? '+' : ''}
                        {changeValue}
                      </span>
                    </div>
                  )}
                </div>
                {stat.icon && (
                  <div className="p-2 rounded-lg bg-venom-500/10 border border-venom-500/20">
                    {stat.icon}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Default icons for common stats
export const StatIcons = {
  trophy: <Trophy className="h-5 w-5 text-venom-400" />,
  target: <Target className="h-5 w-5 text-venom-400" />,
  chart: <BarChart3 className="h-5 w-5 text-venom-400" />,
};

