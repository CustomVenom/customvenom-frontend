import type { Metadata } from 'next';
import { Inter, Merriweather_Sans } from 'next/font/google';

import './globals.css';
import ClientLayout from './ClientLayout';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

import { Analytics } from '@vercel/analytics/react';

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
  title: 'Custom Venom — Pick Your Poison',
  description: 'Fantasy football projections and decisions powered by explainable AI.',
  openGraph: {
    title: 'Custom Venom — Pick Your Poison',
    description: 'Fantasy football projections and decisions powered by explainable AI.',
    type: 'website',
    url: 'https://customvenom.com',
    siteName: 'Custom Venom',
    images: ['/og.png'], // Add this when og.png is created
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
        <Header />
        <ClientLayout>
          <main id="main" role="main" className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </main>
        </ClientLayout>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
