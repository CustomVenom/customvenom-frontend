'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LeagueSwitcher } from './LeagueSwitcher';

const tabs = [
  { href: '/dashboard/leagues', label: 'Leagues' },
  { href: '/dashboard/start-sit', label: 'Start/Sit' },
  { href: '/dashboard/faab', label: 'FAAB' },
  { href: '/dashboard/decisions', label: 'Decisions' },
];

export function ToolsTabs() {
  const p = usePathname();

  return (
    <div className="mt-2 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-6xl flex gap-4 px-3 items-center justify-between">
        <div className="flex gap-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`py-2 text-sm transition-colors ${
                p?.startsWith(t.href)
                  ? 'border-b-2 border-(--cv-primary) dark:border-(--cv-accent) text-(--cv-primary) dark:text-(--cv-accent) font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-(--cv-primary) dark:hover:text-(--cv-accent)'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <LeagueSwitcher />
      </div>
    </div>
  );
}

export default ToolsTabs;
