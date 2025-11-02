'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, change, icon }: MetricCardProps) {
  const trendIcon = change ? (
    change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : change < 0 ? (
      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
    ) : (
      <Minus className="h-4 w-4 text-gray-400" />
    )
  ) : null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {icon && (
              <div className="p-2 rounded-lg bg-primary-600/10 dark:bg-primary-400/10">{icon}</div>
            )}
            {change !== undefined && (
              <div className="flex items-center space-x-1 text-sm">
                {trendIcon}
                <span
                  className={
                    change > 0
                      ? 'text-green-600 dark:text-green-400'
                      : change < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }
                >
                  {change > 0 ? '+' : ''}
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardMetrics() {
  // TODO: Fetch real metrics from API
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Team Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Your Record" value="7-3" />
        <MetricCard label="Avg Points" value="124.5" change={3.2} />
        <MetricCard label="Power Rank" value="#4" change={2} />
      </div>
    </div>
  );
}
