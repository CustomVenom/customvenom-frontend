'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Brand from '@/components/Brand';
import DensityToggle from '@/components/DensityToggle';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  { href: '/projections', label: 'Projections' },
  { href: '/tools', label: 'Tools' },
  { href: '/ops', label: 'Ops' },
  { href: '/settings', label: 'Settings' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg))]/95 backdrop-blur-md shadow-lg"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Home">
          <Brand size="lg" />
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname?.startsWith(l.href)
                  ? 'text-[rgb(var(--cv-primary))] font-semibold'
                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary))] transition-colors'
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DensityToggle />
          {/* Go Pro button disabled for development */}
          {/* <Link href="/go-pro" className="cv-btn-primary hidden sm:inline-block">
            Go Pro
          </Link> */}
          <Link
            href="/design-preview"
            className="cv-btn-ghost hidden lg:inline-block text-xs px-2 py-1"
          >
            Design
          </Link>
        </div>
      </div>
    </header>
  );
}
