import Button from '@/components/Button';

interface EmptyStateProps {
  title: string;
  children?: React.ReactNode;
  onExample?: () => void;
}

export default function EmptyState({ title, children, onExample }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[rgba(148,163,184,0.2)] p-8 text-center bg-[rgb(var(--bg-elevated))]">
      <p className="font-semibold text-[rgb(var(--text-primary))] text-lg mb-3">{title}</p>
      {children && <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">{children}</p>}
      {onExample && (
        <Button variant="ghost" size="sm" onClick={onExample}>
          Try an example
        </Button>
      )}
    </div>
  );
}

