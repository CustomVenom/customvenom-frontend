export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-3">
      <div className="rounded-lg border border-[rgba(148,163,184,0.1)] p-6 bg-[rgb(var(--bg-card))]">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mt-3" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mt-2" />
      </div>
      <div className="rounded-lg border border-[rgba(148,163,184,0.1)] p-6 bg-[rgb(var(--bg-card))]">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mt-2" />
      </div>
    </main>
  );
}

