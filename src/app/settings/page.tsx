import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function SettingsPage() {
  console.error(
    JSON.stringify({
      scope: 'settings.route.enter',
      env: {
        api: process.env['NEXT_PUBLIC_API_BASE'] ?? null,
        enableYahoo: process.env['NEXT_PUBLIC_ENABLE_YAHOO'] ?? null,
      },
    })
  );

  // Keep skeleton for now
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      <div className="mb-10 pb-10 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">League Integration (Preview)</h2>
        <ErrorBoundary fallback={<div className="p-3 bg-yellow-50 border rounded">Panel disabled</div>}>
          {/* Panel will be added in Step 2 */}
          <div className="p-3 bg-gray-50 border rounded">Placeholder</div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
