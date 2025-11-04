import type { Metadata } from 'next';
import { Inter, Merriweather_Sans } from 'next/font/google';

import ClientLayout from './ClientLayout';
import './globals.css';
import Providers from './providers';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SelectionProvider } from '@/lib/selection';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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

export const metadata: Metadata = {
  title: 'Custom Venom — Fantasy Football Analytics',
  description: 'Data-driven insights for your fantasy football league. Supports Yahoo, ESPN, and Sleeper.',
  openGraph: {
    title: 'Custom Venom — Fantasy Football Analytics',
    description: 'Data-driven insights for your fantasy football league. Supports Yahoo, ESPN, and Sleeper.',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent dark-mode FOUC (Flash of Unstyled Content)
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = stored === 'dark' || (stored === null && prefersDark);

                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback: default to dark mode for fantasy football
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-[rgb(var(--cv-primary))] focus:text-[#0A0E1A] focus:px-3 focus:py-1 focus:rounded focus:z-50 focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <SelectionProvider>
            <Header />
            <ClientLayout>
              <main id="main" role="main" className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
                {children}
              </main>
            </ClientLayout>
          </SelectionProvider>
        </Providers>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
