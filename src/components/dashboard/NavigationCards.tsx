'use client';

import Link from 'next/link';
import { Users, TrendingUp, Target, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const navigationItems = [
  {
    title: 'My Roster',
    description: 'View your lineup with AI projections',
    href: '/league/roster',
    icon: Users,
    variant: 'default' as const,
  },
  {
    title: 'Start/Sit',
    description: 'Get recommendations for tough decisions',
    href: '/dashboard/start-sit',
    icon: Target,
    variant: 'secondary' as const,
  },
  {
    title: 'Projections',
    description: 'Browse all player projections',
    href: '/dashboard/projections',
    icon: TrendingUp,
    variant: 'secondary' as const,
  },
  {
    title: 'FAAB Helper',
    description: 'Optimize your waiver budget',
    href: '/dashboard/faab',
    icon: DollarSign,
    variant: 'secondary' as const,
  },
  {
    title: 'Important Decisions',
    description: 'See critical lineup calls',
    href: '/dashboard/decisions',
    icon: AlertCircle,
    variant: 'secondary' as const,
  },
  {
    title: 'Waivers',
    description: 'Find top available players',
    href: '/league/waivers',
    icon: BarChart3,
    variant: 'secondary' as const,
  },
];

export function NavigationCards() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-primary-600 dark:hover:border-primary-400 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary-600/10 dark:bg-primary-400/10">
                      <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
