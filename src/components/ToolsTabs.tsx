'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LeagueSwitcher } from './LeagueSwitcher';

const tabs = [
  { href: '/tools/leagues', label: 'Leagues' },
  { href: '/tools/start-sit', label: 'Start/Sit' },
  { href: '/tools/faab', label: 'FAAB' },
  { href: '/tools/decisions', label: 'Decisions' },
];

export default function ToolsTabs() {
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
                  ? 'border-b-2 border-[var(--cv-primary)] dark:border-[var(--cv-accent)] text-[var(--cv-primary)] dark:text-[var(--cv-accent)] font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[var(--cv-primary)] dark:hover:text-[var(--cv-accent)]'
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
