import { WaitlistForm } from '@/components/waitlist/WaitlistForm';
import { PublicFooter } from '@/components/public/PublicFooter';

export const metadata = {
  title: 'Join the Waitlist | Custom Venom',
  description:
    'Be the first to know when Custom Venom launches. Get early access to fantasy football analytics with explainable AI.',
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-venom-50/50 to-white pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Tagline */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-venom-600 tracking-wide uppercase">
                  Coming Soon
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fantasy Football
                <span className="block text-venom-600">Analytics</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                See <strong>floor, median, and ceiling</strong> projections for every player.
                Understand the <em>why</em> behind the numbers with explainable AI.
              </p>
            </div>

            {/* Waitlist Form */}
            <div className="pt-8">
              <WaitlistForm />
            </div>

            {/* Value Props */}
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">Probabilistic Projections</div>
                <div className="text-gray-600">
                  See the full range of possible outcomes, not just a single number.
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">Explainable AI</div>
                <div className="text-gray-600">
                  Understand why players are projected the way they are with confidence scores.
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">League Integration</div>
                <div className="text-gray-600">
                  Connect your Yahoo, ESPN, or Sleeper leagues for personalized insights.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

