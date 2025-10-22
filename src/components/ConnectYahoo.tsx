'use client';

import Link from 'next/link';

export function ConnectYahoo() {
  return (
    <Link
      href="/api/auth/signin/yahoo"
      className="cv-btn-primary inline-block px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
    >
      Connect Yahoo
    </Link>
  );
}
