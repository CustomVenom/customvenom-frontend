'use client';

import ShareButtons from '@/components/ShareButtons';

export default function ActionBar() {
  return (
    <div className="sticky bottom-3 z-30 mx-auto max-w-3xl pb-[env(safe-area-inset-bottom)] [@supports(padding:constant(safe-area-inset-bottom))]:pb-[constant(safe-area-inset-bottom)]">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-2 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Pro tip: Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs">Ctrl/⌘+K</kbd> for commands
          </div>
          <ShareButtons />
        </div>
      </div>
    </div>
  );
}

