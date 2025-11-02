export default function Connected() {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">League Connected</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can now access your profile and leagues
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Available Endpoints:</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`${apiBase}/yahoo/me`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  /yahoo/me
                </a>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  — Your profile
                </span>
              </li>
              <li>
                <a
                  href={`${apiBase}/yahoo/leagues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  /yahoo/leagues
                </a>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  — Your leagues
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <a
              href="/settings"
              className="cv-btn-ghost inline-block px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← Back to Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
