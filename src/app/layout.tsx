import '@/../sentry.server.config';
import '@/../sentry.client.config';
import type { Metadata } from "next";
import { Inter, Merriweather_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from '@/components/ThemeToggle'
import DensityToggle from '@/components/DensityToggle'
import Brand from '@/components/Brand'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-title', 
  weight: ['700','800'] 
});

const merri = Merriweather_Sans({ 
  subsets: ['latin'], 
  variable: '--font-tag', 
  weight: ['400','500'] 
});

export const metadata: Metadata = {
  title: "Custom Venom — Pick Your Poison",
  description: "Fantasy football projections and decisions powered by explainable AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merri.variable}`}>
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" aria-label="Home">
              <Brand size="lg" />
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DensityToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
