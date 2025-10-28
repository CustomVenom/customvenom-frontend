'use client';

interface ErrorWithDigest extends Error {
  digest?: string;
}

export default function SettingsError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  // Minimal structured log; avoid leaking in UI
  console.error(
    JSON.stringify({
      scope: 'settings.route-error',
      digest: error?.digest ?? null,
      message: String(error),
      stack: error && error.stack ? String(error.stack) : null,
    }),
  );

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
        Settings hit an error. Please try again.
        <button onClick={reset} className="ml-3 px-3 py-1 rounded bg-gray-900 text-white text-sm">
          Try again
        </button>
      </div>
    </div>
  );
}
