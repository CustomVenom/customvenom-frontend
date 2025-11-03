'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ToolId = 'decisions' | 'start-sit' | 'faab' | 'players';

interface ToolPageHeaderProps {
  title: string;
  currentTool: ToolId;
}

const tools = [
  { id: 'decisions' as const, label: 'Decisions', href: '/dashboard/decisions' },
  { id: 'start-sit' as const, label: 'Start/Sit', href: '/dashboard/start-sit' },
  { id: 'faab' as const, label: 'FAAB', href: '/dashboard/faab' },
  { id: 'players' as const, label: 'Players', href: '/dashboard/players' }, // Consolidated players/waivers
];

export function ToolPageHeader({ title, currentTool }: ToolPageHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h1>

      {/* Tool Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tools.map((tool) => {
          const isActive = currentTool === tool.id || pathname?.startsWith(tool.href);
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-venom-500 text-white border-b-2 border-venom-500'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-venom-500 dark:hover:text-venom-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tool.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

