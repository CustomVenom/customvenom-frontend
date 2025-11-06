import { HeroSection } from '@/components/public/HeroSection';
import { ProjectionsShowcase } from '@/components/public/ProjectionsShowcase';
import { TrustSection } from '@/components/public/TrustSection';
import { FeaturesGrid } from '@/components/public/FeaturesGrid';
import { CTASection } from '@/components/public/CTASection';
import { PublicFooter } from '@/components/public/PublicFooter';

export const metadata = {
  title: 'Custom Venom | Fantasy Football Analytics with Bite',
  description:
    'Probabilistic projections and explainable AI for fantasy football. See the floor, median, and ceiling for every player.',
};

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Above the fold */}
      <HeroSection />

      {/* Live Projections Preview - Filterable by scoring format */}
      <ProjectionsShowcase />

      {/* Trust Section - Our analytical moat */}
      <TrustSection />

      {/* Features - What you get */}
      <FeaturesGrid />

      {/* CTA - Get started */}
      <CTASection />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
