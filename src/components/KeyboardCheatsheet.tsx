'use client';

import { useEffect, useState } from 'react';

interface Shortcut {
  key: string;
  description: string;
  context?: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: '?', description: 'Show/hide this cheatsheet' },
  { key: 'Esc', description: 'Close modals and overlays' },
  { key: 'Tab', description: 'Skip to main content', context: 'On page load' },
  { key: '1', description: 'Select "Protect" risk mode', context: 'Tools' },
  { key: '2', description: 'Select "Neutral" risk mode', context: 'Tools' },
  { key: '3', description: 'Select "Chase" risk mode', context: 'Tools' },
  { key: 'Enter', description: 'Run comparison/calculation', context: 'Start/Sit, FAAB' },
];

export default function KeyboardCheatsheet() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // '?' or 'Shift+/' to toggle
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(open => !open);
      }

      // 'Escape' to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.4)] text-[rgb(var(--cv-primary))] hover:bg-[rgba(16,185,129,0.3)] transition-all shadow-lg hover:shadow-xl font-bold text-lg"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Cheatsheet Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[rgb(var(--bg-card))] rounded-lg shadow-2xl border border-[rgba(148,163,184,0.2)] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.1)] p-4">
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
              <span className="text-[rgb(var(--cv-primary))]">⌨️</span>
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {SHORTCUTS.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-[rgba(16,185,129,0.05)] transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm text-[rgb(var(--text-primary))] font-medium">
                    {shortcut.description}
                  </div>
                  {shortcut.context && (
                    <div className="text-xs text-[rgb(var(--text-dim))] mt-0.5">
                      {shortcut.context}
                    </div>
                  )}
                </div>
                <kbd className="px-2 py-1 rounded bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] text-[rgb(var(--cv-primary))] font-mono text-sm font-semibold whitespace-nowrap">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[rgba(148,163,184,0.1)] p-4">
            <p className="text-xs text-[rgb(var(--text-dim))] text-center">
              Press <kbd className="px-1 py-0.5 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[rgb(var(--cv-primary))] font-mono">?</kbd> or <kbd className="px-1 py-0.5 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[rgb(var(--cv-primary))] font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

