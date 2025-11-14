import type { Metadata } from 'next';
import { Inter, Merriweather_Sans } from 'next/font/google';
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import ClientLayout from './ClientLayout';
import './globals.css';
import '@customvenom/ui/styles/tokens.css';
import Providers from './providers';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MobileNav from '@/components/layout/MobileNav';
import PublicTrustFooterWrapper from '@/components/trust/PublicTrustFooterWrapper';
import { TrustProvider } from '@customvenom/lib/trust-context';
import { SelectionProvider } from '@/lib/selection';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { validateEnv } from '@/lib/env-validator';

// Validate env vars on startup (dev only)
if (process.env['NODE_ENV'] !== 'production') {
  validateEnv(true);
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-title',
  weight: ['700', '800'],
});

const merri = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-tag',
  weight: ['400', '500'],
});

const site =
  process.env['NEXT_PUBLIC_SITE_URL'] ??
  (process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : 'https://customvenom.com');

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'Custom Venom — Fantasy Football Analytics',
  description:
    'Data-driven insights for your fantasy football league. Supports Yahoo, ESPN, and Sleeper.',
  openGraph: {
    title: 'Custom Venom — Fantasy Football Analytics',
    description:
      'Data-driven insights for your fantasy football league. Supports Yahoo, ESPN, and Sleeper.',
    type: 'website',
    url: 'https://www.customvenom.com',
    siteName: 'Custom Venom',
    images: ['/og.png'], // Add this when og.png is created
  },
  other: {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.customvenom.com https://fantasysports.yahooapis.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${merri.variable}`}>
      <head>
        <script suppressHydrationWarning>
          {`(function(){try{
            var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.dataset.theme = t;
          }catch(e){}})();`}
        </script>
      </head>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-[rgb(var(--cv-primary))] focus:text-[#0A0E1A] focus:px-3 focus:py-1 focus:rounded focus:z-50 focus:font-semibold focus:shadow-lg"
          >
            Skip to main content
          </a>
          <Providers>
            <TrustProvider>
              <SelectionProvider>
                <Header />
                <ClientLayout>
                  <main
                    id="main"
                    role="main"
                    className="app flex-1 mx-auto w-full max-w-6xl px-4 py-6"
                    style={{
                      paddingTop: 'calc(1rem + env(safe-area-inset-top))',
                      minHeight: 'calc(100vh - 4rem)', // Account for header height
                    }}
                  >
                    {children}
                  </main>
                </ClientLayout>
                <MobileNav />
                <PublicTrustFooterWrapper />
              </SelectionProvider>
            </TrustProvider>
          </Providers>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </body>
    </html>
  );
}
