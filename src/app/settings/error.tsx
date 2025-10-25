'use client';

export default function SettingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Log structured error data
  console.error(
    JSON.stringify({
      scope: 'settings.route-error',
      digest: error?.digest || null,
      message: error?.message || 'Unknown error',
      stack: error?.stack || null,
    })
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Settings Error</h1>
        <p className="text-gray-600 mb-6">
          Settings encountered an error. We&apos;ve logged the details for review.
        </p>
        <button
          onClick={reset}
          className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Try Again
        </button>
        {process.env['NODE_ENV'] === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error?.message}
              {'\n\n'}
              Digest: {error?.digest || 'N/A'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
