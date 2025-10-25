'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { href: '/projections', label: 'Projections', icon: '📊' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/league', label: 'League', icon: '🏈' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Side navigation" className="hidden lg:block w-48 p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[rgb(var(--cv-primary))] text-white font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

