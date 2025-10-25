'use client';

import { useId, useState } from 'react';

import { GLOSSARY } from '@/lib/glossary';

type Props = {
  term: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
  className?: string;
};

export function GlossaryTip({ term, children, className = '' }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const label = typeof term === 'string' ? term : String(term);
  const text = GLOSSARY[label.toLowerCase()] ?? '';

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="underline decoration-dotted underline-offset-2">
        {children ?? label}
      </span>
      <button
        className="cv-btn-ghost text-xs px-2 py-1"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={`Definition: ${label}`}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        ?
      </button>
      {open && text && (
        <span
          id={id}
          role="tooltip"
          className="z-50 ml-1 rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgb(var(--bg-elevated))] px-3 py-2 text-xs text-[rgb(var(--text-primary))] shadow-2xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}

