'use client';

import ShareButtons from '@/components/ShareButtons';

export default function ActionBar() {
  return (
    <div className="sticky bottom-3 z-30 mx-auto max-w-3xl pb-[env(safe-area-inset-bottom)] [@supports(padding:constant(safe-area-inset-bottom))]:pb-[constant(safe-area-inset-bottom)]">
      <div className="rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgb(var(--bg-card))]/95 backdrop-blur-md px-3 py-2 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-[rgb(var(--text-secondary))]">
            Pro tip: Press{' '}
            <kbd className="px-1 py-0.5 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-xs text-[rgb(var(--cv-primary))] font-mono">
              Ctrl/⌘+K
            </kbd>{' '}
            for commands
          </div>
          <ShareButtons />
        </div>
      </div>
    </div>
  );
}
