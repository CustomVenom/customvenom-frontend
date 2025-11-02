'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';

interface LeagueContextHeaderProps {
  leagueName: string;
  teamName: string;
  week: number;
  scoringType: string;
}

export function LeagueContextHeader({
  leagueName,
  teamName,
  week,
  scoringType,
}: LeagueContextHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 -mx-4 md:-mx-8 px-4 md:px-8 py-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <Link
            href="/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{leagueName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 dark:text-gray-400">{teamName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 dark:text-gray-400">Week {week}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 dark:text-gray-400">{scoringType}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Change Team
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
