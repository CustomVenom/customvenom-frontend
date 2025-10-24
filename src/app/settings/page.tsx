// Settings Page
// Shows account details, role, and manage billing for Pro users

import { getServerSession } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';
import { LeagueImport } from '@/components/LeagueImport';
import { YahooStatusBadge } from '@/components/YahooStatusBadge';
import Link from 'next/link';

export const metadata = {
  title: 'Settings - CustomVenom',
  description: 'Manage your account settings',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession();
  const cookieStore = await cookies();
  const _yahooToken = cookieStore.get('y_at')?.value;

  // If not authenticated, show connect UI instead of redirecting
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>
          <div className="mb-10 pb-10 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access your settings.</p>
            <Link href="/api/auth/signin" className="cv-btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user } = session;
  const isPro = user.role === 'pro';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>

        <div className="mb-10 pb-10 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Profile</h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
            <div className="text-base text-gray-900">{user.name || 'Not set'}</div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <div className="text-base text-gray-900">{user.email}</div>
          </div>
        </div>

        <div className="mb-10 pb-10 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Subscription</h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">Current Plan</label>
            <div className="text-base text-gray-900">
              <span
                className={
                  isPro
                    ? 'inline-block py-1 px-3 rounded-full text-sm font-semibold bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white'
                    : 'inline-block py-1 px-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-600'
                }
              >
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>

          {isPro ? (
            <form action="/api/stripe/portal" method="POST" className="mt-4">
              <button
                type="submit"
                className="py-3 px-6 bg-gray-900 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-gray-700 hover:-translate-y-px"
              >
                Manage Billing
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Update payment method, view invoices, or cancel your subscription
              </p>
            </form>
          ) : (
            <div className="mt-4 p-6 bg-gradient-to-br from-[#667eea15] to-[#764ba215] rounded-lg">
              <p className="text-base text-gray-600 mb-4">
                Upgrade to Pro to unlock advanced features and insights
              </p>
              <a
                href="/go-pro"
                className="inline-block py-3 px-6 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg text-base font-semibold no-underline cursor-pointer transition-all hover:-translate-y-px hover:shadow-lg"
              >
                Upgrade to Pro
              </a>
            </div>
          )}
        </div>

        <div className="mb-10 pb-10 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">League Integration (Preview)</h2>
          <div className="mb-6">
            <YahooStatusBadge />
          </div>
          <LeagueImport />
        </div>

        <div className="mb-10 pb-10 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Danger Zone</h2>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="py-3 px-6 bg-transparent text-red-600 border border-red-600 rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-red-600 hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
