'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface QuickNavShortcut {
  key: string;
  path: string;
  label: string;
}

const shortcuts: QuickNavShortcut[] = [
  { key: 'p', path: '/projections', label: 'Projections' },
  { key: 't', path: '/tools', label: 'Tools' },
  { key: 'l', path: '/league', label: 'League' },
  { key: 's', path: '/settings', label: 'Settings' },
];

export function QuickNav() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only activate if 'g' is pressed first (focus management)
      if (e.key === 'g' || e.key === 'G') {
        // Next key press will trigger navigation
        const nextHandler = (nextE: KeyboardEvent) => {
          const shortcut = shortcuts.find((s) => s.key === nextE.key.toLowerCase());
          if (shortcut) {
            e.preventDefault();
            router.push(shortcut.path);
          }
          document.removeEventListener('keydown', nextHandler);
        };
        document.addEventListener('keydown', nextHandler);
        // Remove listener after 2 seconds
        setTimeout(() => {
          document.removeEventListener('keydown', nextHandler);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return null; // No UI component
}

