'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * BaseLayout - Site-wide wrapper with header and footer
 *
 * Provides the foundational layout structure for all pages:
 * - Sticky header with navigation
 * - Main content area
 * - Footer with links and status
 */
export function BaseLayout({ children, className }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main" role="main" className={`flex-1 mx-auto w-full max-w-6xl px-4 py-6 ${className || ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

