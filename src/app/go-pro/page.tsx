// Go Pro Page
// Displays Pro features and starts Stripe checkout

'use client';

import { useState } from 'react';

export default function GoProPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simple checkout session (Preview-friendly)
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect directly to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-linear-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          Upgrade to Pro
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock advanced features and take your fantasy game to the next level
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm transition-transform hover:-translate-y-1">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Advanced Analytics</h3>
          <p className="text-base text-gray-600 leading-relaxed">
            Access detailed player projections, FAAB bands, and trend analysis
          </p>
        </div>

        <div className="text-center p-8 bg-white rounded-xl shadow-sm transition-transform hover:-translate-y-1">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Waiver Wire Insights</h3>
          <p className="text-base text-gray-600 leading-relaxed">
            Get AI-powered FAAB recommendations and pickup targets
          </p>
        </div>

        <div className="text-center p-8 bg-white rounded-xl shadow-sm transition-transform hover:-translate-y-1">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-time Updates</h3>
          <p className="text-base text-gray-600 leading-relaxed">
            Stay ahead with live injury reports and lineup changes
          </p>
        </div>

        <div className="text-center p-8 bg-white rounded-xl shadow-sm transition-transform hover:-translate-y-1">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Premium Support</h3>
          <p className="text-base text-gray-600 leading-relaxed">
            Get priority support and exclusive access to new features
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="max-w-md w-full p-12 px-8 bg-white rounded-2xl shadow-lg text-center">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Pro Plan</h3>
          <div className="mb-8">
            <span className="text-5xl font-bold text-gray-900">$19.99</span>
            <span className="text-xl text-gray-600">/season</span>
          </div>
          <ul className="list-none p-0 m-0 mb-8 text-left">
            <li className="py-2 text-gray-600 text-base">✓ All features unlocked</li>
            <li className="py-2 text-gray-600 text-base">✓ Advanced player projections</li>
            <li className="py-2 text-gray-600 text-base">✓ FAAB bid guidance</li>
            <li className="py-2 text-gray-600 text-base">✓ Waiver wire rankings</li>
            <li className="py-2 text-gray-600 text-base">✓ Real-time injury updates</li>
            <li className="py-2 text-gray-600 text-base">✓ Priority support</li>
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 px-8 bg-linear-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Start Checkout'}
          </button>
          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        </div>
      </div>

      <div className="text-center text-gray-500 text-base">
        <p className="my-2">💳 Secure payment powered by Stripe</p>
        <p className="my-2">🔒 Cancel anytime, no questions asked</p>
      </div>
    </div>
  );
}
