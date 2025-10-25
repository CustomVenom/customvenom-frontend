// BARE-BONES SETTINGS - Binary search for failing import
export default function SettingsPage() {
  // Route-entry structured env log (visible in server logs)
  console.error(
    JSON.stringify({
      scope: 'settings.route.enter',
      env: {
        api: process.env['NEXT_PUBLIC_API_BASE'] ?? null,
        enableYahoo: process.env['NEXT_PUBLIC_ENABLE_YAHOO'] ?? null,
      },
    })
  );

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      <div className="mb-10 pb-10 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">League Integration (Preview)</h2>
        <div className="p-3 bg-gray-50 border rounded">
          Settings page loaded successfully. No server-side crashes detected.
        </div>
      </div>
    </div>
  );
}
