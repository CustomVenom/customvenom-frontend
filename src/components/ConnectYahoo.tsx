'use client';

import Link from 'next/link';

export function ConnectYahoo() {
  return (
    <Link
      className="cv-btn-primary inline-block px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
      href="/api/auth/signin"
    >
      Connect Yahoo
    </Link>
  );
}
