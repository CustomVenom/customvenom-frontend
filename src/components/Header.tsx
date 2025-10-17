'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import DensityToggle from '@/components/DensityToggle';

const links = [
  { href: '/projections', label: 'Projections' },
  { href: '/tools', label: 'Tools' },
  { href: '/ops', label: 'Ops' },
  { href: '/settings', label: 'Settings' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Home">
          <Brand size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname?.startsWith(l.href) 
                ? 'text-brand-primary dark:text-brand-accent font-medium underline' 
                : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-accent hover:underline'}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DensityToggle />
          <Link href="/go-pro" className="cv-btn-primary hidden sm:inline-block">
            Go Pro
          </Link>
          <Link href="/design-preview" className="cv-btn-ghost hidden lg:inline-block text-xs px-2 py-1">
            Design
          </Link>
        </div>
      </div>
    </header>
  );
}

