'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // Webhook handles entitlement update
      // Just show success message
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-lg">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">No session ID found</p>
          <Link href="/go-pro" className="cv-btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Pro!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription is being activated. You should have access to all Pro features within 60
          seconds.
        </p>
        <div className="space-y-3">
          <Link href="/projections" className="cv-btn-primary block">
            View Projections
          </Link>
          <Link href="/settings" className="cv-btn-ghost block">
            Manage Subscription
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">Session ID: {sessionId?.substring(0, 20)}...</p>
      </div>
    </div>
  );
}
