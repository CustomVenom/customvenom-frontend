import clsx from 'clsx';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={clsx('w-full border-separate border-spacing-0 text-sm', className)}
      {...props}
    />
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        'sticky top-0 z-10 bg-[rgb(var(--bg))] text-left text-[rgb(var(--text-secondary))] font-semibold uppercase text-xs tracking-wide border-b border-[rgba(148,163,184,0.2)] px-3 py-2',
        className,
      )}
      {...props}
    />
  );
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx('hover:bg-[rgba(16,185,129,0.05)] transition-colors', className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx(
        'border-b border-[rgba(148,163,184,0.1)] px-3 py-2 align-middle text-[rgb(var(--text-primary))]',
        className,
      )}
      {...props}
    />
  );
}
