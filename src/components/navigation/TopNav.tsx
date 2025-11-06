'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Settings } from 'lucide-react';

import Brand from '@/components/Brand';
import DensityToggle from '@/components/DensityToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

export interface TopNavProps {
  mainLinks?: NavLink[];
  toolsLinks?: NavLink[];
  showSettings?: boolean;
  className?: string;
}

const defaultMainLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/roster', label: 'Roster' },
  { href: '/projections', label: 'Projections' },
];

const defaultToolsLinks: NavLink[] = [
  { href: '/dashboard/decisions', label: 'Decisions' },
  { href: '/dashboard/start-sit', label: 'Start/Sit' },
  { href: '/dashboard/faab', label: 'FAAB' },
  { href: '/dashboard/players', label: 'Players' },
];

/**
 * TopNav - Site-wide top navigation component
 *
 * Provides consistent navigation across all pages:
 * - Brand logo/home link
 * - Main navigation links (Dashboard, Roster, Projections)
 * - Tools dropdown menu
 * - Settings dropdown
 * - Theme and density toggles
 *
 * Responsive: Desktop shows full nav, mobile shows condensed menu
 */
export function TopNav({
  mainLinks = defaultMainLinks,
  toolsLinks = defaultToolsLinks,
  showSettings = true,
  className,
}: TopNavProps) {
  const pathname = usePathname();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setToolsDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(target)) {
        setSettingsDropdownOpen(false);
      }
    };

    if (toolsDropdownOpen || settingsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [toolsDropdownOpen, settingsDropdownOpen]);

  const isToolsActive = toolsLinks.some((link) => pathname?.startsWith(link.href));

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        'sticky top-0 z-40 border-b border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg))]/95 backdrop-blur-md shadow-lg',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" aria-label="Home">
          <Brand size="lg" />
        </Link>

        {/* Main Navigation Links */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {mainLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors',
                  isActive
                    ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-semibold'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))]',
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={cn(
                'flex items-center gap-1 transition-colors',
                isToolsActive
                  ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-semibold'
                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))]',
              )}
              aria-expanded={toolsDropdownOpen}
              aria-haspopup="true"
              aria-label="Tools menu"
            >
              Tools
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', toolsDropdownOpen && 'rotate-180')}
              />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {toolsLinks.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setToolsDropdownOpen(false)}
                        className={cn(
                          'block px-4 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="relative" ref={settingsDropdownRef}>
              <button
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                className={cn(
                  'flex items-center gap-1 transition-colors p-1 rounded',
                  pathname?.startsWith('/settings')
                    ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))]'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))]',
                )}
                aria-expanded={settingsDropdownOpen}
                aria-haspopup="true"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>

              {settingsDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className={cn(
                        'block px-4 py-2 text-sm transition-colors',
                        pathname?.startsWith('/settings')
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                      )}
                    >
                      Settings
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DensityToggle />
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
