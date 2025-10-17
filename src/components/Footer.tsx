import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Custom Venom · Pick Your Poison</div>
        <nav className="flex gap-3">
          <Link href="/ops" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Ops
          </Link>
          <Link href="/design-preview" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Design
          </Link>
          <a 
            href="https://bsky.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline"
          >
            Bluesky
          </a>
        </nav>
      </div>
    </footer>
  );
}

