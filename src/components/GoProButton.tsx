'use client';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

interface GoProButtonProps {
  priceId: string;
  className?: string;
}

export default function GoProButton({ priceId, className = '' }: GoProButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoPro = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Initialize Stripe (check if configured)
      const stripeKey = process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'];
      if (!stripeKey) {
        throw new Error('Stripe not configured');
      }
      
      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('GoPro error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="go-pro-container">
      <button
        onClick={handleGoPro}
        disabled={loading}
        className={`go-pro-button ${className}`}
      >
        {loading ? 'Loading...' : '🚀 Go Pro'}
      </button>
      {error && (
        <div className="go-pro-error">
          {error}
        </div>
      )}
      <style jsx>{`
        .go-pro-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .go-pro-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .go-pro-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .go-pro-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .go-pro-error {
          color: #e74c3c;
          font-size: 0.9rem;
          text-align: center;
          background: #fdf2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}

