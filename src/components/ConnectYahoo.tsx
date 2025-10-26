'use client';

import { useSession } from 'next-auth/react';

export function ConnectYahoo() {
  const { data: session } = useSession();

  // Feature flag gating
  const ENABLED = process.env['NEXT_PUBLIC_YAHOO_CONNECT_ENABLED'] === 'true';
  const MAINT = process.env['NEXT_PUBLIC_YAHOO_MAINTENANCE'] === 'true';
  const CANARY = (process.env['NEXT_PUBLIC_YAHOO_CANARY_EMAILS'] || '')
    .split(',')
    .map((s) => s.trim().toLowerCase());

  const isCanary = (email?: string) => !!email && CANARY.includes(email.toLowerCase());

  // Hide CTA if not enabled, in maintenance, or user not in canary list
  if (!ENABLED || MAINT || !isCanary(session?.user?.email)) {
    return null;
  }

  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
  const from = typeof window !== 'undefined' ? `${location.pathname}${location.search}` : '/tools';
  const href = `${apiBase}/api/connect/start?host=yahoo&from=${encodeURIComponent(from)}`;

  return (
    <a
      href={href}
      className="cv-btn-primary inline-block px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
      rel="nofollow"
    >
      Connect Yahoo
    </a>
  );
}

