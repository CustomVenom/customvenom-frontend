import '@/../sentry.server.config';
import '@/../sentry.client.config';
import type { Metadata } from "next";
import { Inter, Merriweather_Sans } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
    <html lang="en" className={`${inter.variable} ${merri.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
