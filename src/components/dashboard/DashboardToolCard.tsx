'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DashboardToolCardProps {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  isActive?: boolean;
  className?: string;
}

/**
 * DashboardToolCard - Card component for dashboard tools
 *
 * Matches ESPN/Yahoo/Sleeper card patterns:
 * - Large icon/visual
 * - Title and description
 * - Hover effects
 * - Active state indication
 * - Badge support for new features
 */
export function DashboardToolCard({
  title,
  description,
  href,
  icon,
  badge,
  isActive = false,
  className,
}: DashboardToolCardProps) {
  return (
    <Link href={href} className={cn('block group', className)}>
      <Card
        variant="dashboard"
        className={cn(
          'h-full transition-all hover:border-venom-500/50 hover:shadow-lg hover:shadow-venom-500/10',
          isActive && 'border-venom-500/50 ring-2 ring-venom-500/20',
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-3 rounded-lg bg-venom-500/10 border border-venom-500/20 group-hover:bg-venom-500/20 transition-colors">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-100 group-hover:text-venom-400 transition-colors">
                    {title}
                  </CardTitle>
                  {badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-venom-500/20 text-venom-400 rounded-full border border-venom-500/30">
                      {badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-venom-400 group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-400 text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
