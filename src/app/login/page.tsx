import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { VenomLogo } from '@/components/ui/VenomLogo';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In · CustomVenom',
  description: 'Sign in to access your fantasy football analytics.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex dashboard-hub scale-pattern">
      {/* Left side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-venom-900 via-field-900 to-field-950 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 scale-pattern opacity-20" />

        <div className="relative z-10 max-w-md">
          <VenomLogo size="lg" variant="dark" className="mb-8" />

          <h1 className="text-4xl font-bold mb-4 text-white">
            Your Fantasy Edge,
            <br />
            <span className="text-venom-400">Backed by Data</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Connect your league and unlock personalized projections, waiver recommendations, and
            lineup optimization.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Calibrated Projections</h3>
                <p className="text-sm text-gray-400">
                  Confidence ranges that actually match reality
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">League-Specific Insights</h3>
                <p className="text-sm text-gray-400">Scoring format and roster settings baked in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Built for Decisions</h3>
                <p className="text-sm text-gray-400">Start/Sit, FAAB, trades—all in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-field-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <VenomLogo size="md" variant="dark" className="mx-auto" />
          </div>

          <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
          <p className="text-gray-400 mb-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-venom-500 hover:text-venom-400 font-medium">
              Sign up
            </Link>
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
