import Link from 'next/link';

export default function AuthErrorPage() {
  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] as string;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an error during authentication. Please try again.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <a
              href={`${API_BASE}/api/connect/start?host=yahoo&from=/tools`}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </a>
          </div>
          <div className="text-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
