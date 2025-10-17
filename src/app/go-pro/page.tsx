// Go Pro Page
// Displays Pro features and starts Stripe checkout

'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './page.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

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
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Upgrade to Pro</h1>
        <p className={styles.subtitle}>
          Unlock advanced features and take your fantasy game to the next level
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📊</div>
          <h3 className={styles.featureTitle}>Advanced Analytics</h3>
          <p className={styles.featureDescription}>
            Access detailed player projections, FAAB bands, and trend analysis
          </p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <h3 className={styles.featureTitle}>Waiver Wire Insights</h3>
          <p className={styles.featureDescription}>
            Get AI-powered FAAB recommendations and pickup targets
          </p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Real-time Updates</h3>
          <p className={styles.featureDescription}>
            Stay ahead with live injury reports and lineup changes
          </p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🏆</div>
          <h3 className={styles.featureTitle}>Premium Support</h3>
          <p className={styles.featureDescription}>
            Get priority support and exclusive access to new features
          </p>
        </div>
      </div>

      <div className={styles.pricing}>
        <div className={styles.pricingCard}>
          <h3 className={styles.planName}>Pro Plan</h3>
          <div className={styles.price}>
            <span className={styles.priceAmount}>$19.99</span>
            <span className={styles.pricePeriod}>/season</span>
          </div>
          <ul className={styles.benefitsList}>
            <li>✓ All features unlocked</li>
            <li>✓ Advanced player projections</li>
            <li>✓ FAAB bid guidance</li>
            <li>✓ Waiver wire rankings</li>
            <li>✓ Real-time injury updates</li>
            <li>✓ Priority support</li>
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={styles.checkoutButton}
          >
            {loading ? 'Loading...' : 'Start Checkout'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>

      <div className={styles.guarantee}>
        <p>💳 Secure payment powered by Stripe</p>
        <p>🔒 Cancel anytime, no questions asked</p>
      </div>
    </div>
  );
}

