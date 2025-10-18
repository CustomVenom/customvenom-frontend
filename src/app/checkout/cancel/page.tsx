import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-gray-600 mb-6">
          No worries! You can upgrade to Pro anytime you're ready.
        </p>
        <div className="space-y-3">
          <Link href="/go-pro" className="cv-btn-primary block">
            Try Again
          </Link>
          <Link href="/projections" className="cv-btn-ghost block">
            Continue with Free
          </Link>
        </div>
      </div>
    </div>
  );
}

