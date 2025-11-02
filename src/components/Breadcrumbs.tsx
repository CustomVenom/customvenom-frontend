'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const p = (usePathname() || '').split('/').filter(Boolean);
  const build = (i: number) => '/' + p.slice(0, i + 1).join('/');

  return (
    <nav className="text-xs text-gray-600 dark:text-gray-400 mb-4">
      <Link
        href="/"
        className="hover:text-[rgb(var(--cv-primary-strong))] dark:hover:text-brand-accent hover:underline"
      >
        Home
      </Link>
      {p.map((seg, i) => (
        <span key={i}>
          {' / '}
          <Link
            href={build(i)}
            className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline capitalize"
          >
            {seg.replaceAll('-', ' ')}
          </Link>
        </span>
      ))}
    </nav>
  );
}
