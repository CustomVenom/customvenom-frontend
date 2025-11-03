'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

import Brand from '@/components/Brand';
import DensityToggle from '@/components/DensityToggle';
import ThemeToggle from '@/components/ThemeToggle';

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/league/roster', label: 'Roster' },
  { href: '/projections', label: 'Projections' },
];

const toolsLinks = [
  { href: '/dashboard/decisions', label: 'Important Decisions' },
  { href: '/dashboard/start-sit', label: 'Start/Sit' },
  { href: '/dashboard/faab', label: 'FAAB Helper' },
  { href: '/league/waivers', label: 'Waivers' },
];

export default function Header() {
  const pathname = usePathname();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    if (toolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [toolsDropdownOpen]);

  const isToolsActive = toolsLinks.some((link) => pathname?.startsWith(link.href));

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
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname?.startsWith(l.href)
                  ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-semibold'
                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))] transition-colors'
              }
            >
              {l.label}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1 transition-colors ${
                isToolsActive
                  ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-semibold'
                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))]'
              }`}
              aria-expanded={toolsDropdownOpen}
              aria-haspopup="true"
            >
              Tools
              <ChevronDown
                className={`h-4 w-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {toolsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname?.startsWith(link.href)
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/settings"
            className={
              pathname?.startsWith('/settings')
                ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-semibold'
                : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))] transition-colors'
            }
          >
            Settings
          </Link>
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
