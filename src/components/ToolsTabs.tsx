'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LeagueSwitcher } from './LeagueSwitcher';

// Tools in consistent order: Decisions, Start/Sit, FAAB, Players
const tabs = [
  { href: '/dashboard/decisions', label: 'Decisions' },
  { href: '/dashboard/start-sit', label: 'Start/Sit' },
  { href: '/dashboard/faab', label: 'FAAB' },
  { href: '/dashboard/players', label: 'Players' },
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
              className={`py-2 text-sm transition-colors border-b-2 ${
                p?.startsWith(t.href)
                  ? 'border-[rgb(var(--cv-primary-strong))] dark:border-[rgb(var(--cv-primary))] text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-medium'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))] hover:border-[rgb(var(--cv-primary-strong))]/50 dark:hover:border-[rgb(var(--cv-primary))]/50'
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
