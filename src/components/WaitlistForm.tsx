'use client';

import { useState } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, platform }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage("You're on the list. We'll email you when we launch.");
        setEmail('');
        setName('');
        setPlatform('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection.');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {status === 'success' ? (
        <div className="p-6 rounded-lg bg-[#0F1512] border border-[#16A34A]">
          <p className="text-[#22C55E]">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0F1512] border border-[#1F2A24] text-[#E6F2EA] placeholder-[#9AB9A7] focus:border-[#16A34A] focus:outline-none transition-colors"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="w-full px-4 py-3 rounded-lg bg-[#0F1512] border border-[#1F2A24] text-[#E6F2EA] placeholder-[#9AB9A7] focus:border-[#16A34A] focus:outline-none transition-colors"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#0F1512] border border-[#1F2A24] text-[#E6F2EA] focus:border-[#16A34A] focus:outline-none transition-colors"
          >
            <option value="">League platform (optional)</option>
            <option value="yahoo">Yahoo</option>
            <option value="espn">ESPN</option>
            <option value="sleeper">Sleeper</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-3 rounded-lg bg-[#16A34A] text-white font-semibold hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-[#EF4444] text-center">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}

