'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/projections', label: 'Projections', icon: '📊' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/league', label: 'League', icon: '🏈' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-[rgb(var(--cv-primary))]'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

