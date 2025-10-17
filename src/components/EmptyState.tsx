import Button from '@/components/Button';

interface EmptyStateProps {
  title: string;
  children?: React.ReactNode;
  onExample?: () => void;
}

export default function EmptyState({ title, children, onExample }: EmptyStateProps) {
  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
      <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{title}</p>
      {children && <p className="mb-3">{children}</p>}
      {onExample && (
        <Button variant="ghost" size="sm" onClick={onExample}>
          Try an example
        </Button>
      )}
    </div>
  );
}

