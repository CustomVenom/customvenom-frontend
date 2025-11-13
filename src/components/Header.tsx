'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Settings } from 'lucide-react';

import Brand from '@/components/Brand';
import DensityToggle from '@/components/DensityToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { SportSwitcher } from '@/components/SportSwitcher';

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/roster', label: 'Roster' },
  { href: '/projections', label: 'Projections' },
];

// Tools in consistent order: Decisions, Start/Sit, FAAB, Players
const toolsLinks = [
  { href: '/dashboard/decisions', label: 'Decisions' },
  { href: '/dashboard/start-sit', label: 'Start/Sit' },
  { href: '/dashboard/faab', label: 'FAAB' },
  { href: '/dashboard/players', label: 'Players' },
];

export default function Header() {
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
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg))]/95 backdrop-blur-md shadow-lg"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Home">
            <Brand size="lg" />
          </Link>
          <SportSwitcher />
        </div>

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
          <div className="relative" ref={toolsDropdownRef}>
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

          {/* Settings Dropdown - Discreet icon */}
          <div className="relative" ref={settingsDropdownRef}>
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className={`flex items-center gap-1 transition-colors p-1 rounded ${
                pathname?.startsWith('/settings')
                  ? 'text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))]'
                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-[rgb(var(--cv-primary))]'
              }`}
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
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname?.startsWith('/settings')
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-[rgb(var(--cv-primary-strong))] dark:text-[rgb(var(--cv-primary))] font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
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
