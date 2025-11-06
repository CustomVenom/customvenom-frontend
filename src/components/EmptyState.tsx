import Button from '@/components/Button';
import { ConnectLeagueButton } from '@/components/ConnectLeagueButton';

interface EmptyStateProps {
  title: string;
  children?: React.ReactNode;
  onExample?: () => void;
  showConnectButton?: boolean;
  message?: string;
}

export default function EmptyState({
  title,
  children,
  onExample,
  showConnectButton = false,
  message
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[rgba(148,163,184,0.2)] p-8 text-center bg-[rgb(var(--bg-elevated))]">
      <p className="font-semibold text-[rgb(var(--text-primary))] text-lg mb-3">{title}</p>
      {message && <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">{message}</p>}
      {children && <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">{children}</p>}
      {showConnectButton && (
        <div className="pt-4">
          <ConnectLeagueButton />
        </div>
      )}
      {onExample && (
        <Button variant="ghost" size="sm" onClick={onExample}>
          Try an example
        </Button>
      )}
    </div>
  );
}
