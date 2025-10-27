import type { Metadata } from 'next';
import { Inter, Merriweather_Sans } from 'next/font/google';

import './globals.css';
import ClientLayout from './ClientLayout';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SelectionProvider } from '@/lib/selection';

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
    url: 'https://www.customvenom.com',
    siteName: 'Custom Venom',
    images: ['/og.png'], // Add this when og.png is created
  },
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.customvenom.com https://fantasysports.yahooapis.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${merri.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-[rgb(var(--cv-primary))] focus:text-[#0A0E1A] focus:px-3 focus:py-1 focus:rounded focus:z-50 focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <SelectionProvider>
          <Header />
          <ClientLayout>
            <main id="main" role="main" className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
              {children}
            </main>
          </ClientLayout>
        </SelectionProvider>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
