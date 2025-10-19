'use client';

export function ConnectYahoo() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';

  return (
    <a
      className="cv-btn-primary inline-block px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
      href={`${apiBase}/auth/yahoo`}
    >
      Connect Yahoo
    </a>
  );
}
