import Link from 'next/link';
import OpsStatus from '@/components/OpsStatus';

export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-10 border-t border-gray-200 dark:border-gray-800">
      <div className="container py-6 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>© {new Date().getFullYear()} Custom Venom · Pick Your Poison</div>
          <OpsStatus />
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-3">
          <Link href="/ops" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Ops
          </Link>
          <Link href="/status" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Status
          </Link>
          <Link href="/design-preview" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Design
          </Link>
          <Link href="/privacy" className="hover:text-brand-primary dark:hover:text-brand-accent hover:underline">
            Privacy
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

