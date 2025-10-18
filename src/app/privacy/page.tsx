'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="container section space-y-4">
      <h1 className="h1">Privacy</h1>
      <p className="text-sm text-muted">
        We keep data collection minimal to run the product and improve reliability.
      </p>

      <section className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4 space-y-2">
        <h2 className="h2">What we collect</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Basic usage analytics (page views, feature use) without sensitive content</li>
          <li>Operational logs (request_id, route, response time) for reliability</li>
          <li>OAuth profile basics if you sign in (name, email, provider id)</li>
        </ul>
      </section>

      <section className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4 space-y-2">
        <h2 className="h2">What we do not collect</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>No passwords (handled by your provider)</li>
          <li>No payment details unless you enable payments (Stripe handles card data)</li>
          <li>No personal notes or league chat content</li>
        </ul>
      </section>

      <section className="rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgb(var(--bg-card))] p-4 space-y-2">
        <h2 className="h2">Control and export</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Request export or deletion any time: trust@customvenom.com</li>
          <li>Turn off analytics in Settings (when available)</li>
          <li>OAuth unlink in Settings (when available)</li>
        </ul>
      </section>

      <div className="flex gap-2">
        <Link href="/" className="cv-btn-ghost">Home</Link>
        <Link href="/projections" className="cv-btn-primary">Open Projections</Link>
      </div>
    </main>
  );
}

