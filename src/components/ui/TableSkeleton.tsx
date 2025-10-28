import { Skeleton } from './Skeleton';

export function TableSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div
        className="grid gap-y-2 gap-x-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={`${r}-${c}`} className="h-5 w-full rounded" />
          )),
        )}
      </div>
    </div>
  );
}
