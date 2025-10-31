import Link from 'next/link';

import Button from '@/components/Button';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Page not found</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        The page you&apos;re looking for doesn&apos;t exist. Try the Dashboard or Projections.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard">
          <Button variant="primary">Open Dashboard</Button>
        </Link>
        <Link href="/projections">
          <Button variant="ghost">Projections</Button>
        </Link>
      </div>
    </main>
  );
}
