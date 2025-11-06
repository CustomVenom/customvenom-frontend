'use client';

import Link from 'next/link';
import { LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginRequiredProps {
  featureName?: string;
  className?: string;
}

/**
 * LoginRequired - Component shown when user needs to sign in to access a feature
 *
 * Provides clear guidance for users who need to authenticate:
 * - Clear message about what requires login
 * - Sign In button (primary CTA)
 * - Sign up link (secondary CTA)
 * - Responsive design
 */
export function LoginRequired({ featureName = 'this feature', className }: LoginRequiredProps) {
  return (
    <div className={`flex items-center justify-center min-h-[60vh] px-4 ${className || ''}`}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-venom-500/10 border border-venom-500/20">
            <LogIn className="w-8 h-8 text-venom-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to sign in to access {featureName}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-venom-500 hover:text-venom-600 dark:text-venom-400 dark:hover:text-venom-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
