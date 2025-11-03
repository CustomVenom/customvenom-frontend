import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'
import { VenomLogo } from '@/components/ui/VenomLogo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account · CustomVenom',
  description: 'Start your 7-day free trial of fantasy football analytics.'
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-field-900 dashboard-hub scale-pattern">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <VenomLogo size="md" variant="dark" className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2 text-white">Start Your Free Trial</h2>
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-venom-500 hover:text-venom-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-400">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

