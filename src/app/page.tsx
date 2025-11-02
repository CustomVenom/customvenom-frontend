import { WaitlistForm } from '@/components/WaitlistForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F0B] text-[#E6F2EA]">
      {/* Hero section */}
      <section className="container mx-auto px-6 py-20 text-center max-w-6xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Pick Your Poison</h1>
        <p className="text-xl md:text-2xl text-[#9AB9A7] mb-16">
          Lineup advice with receipts. Ranges, two clear reasons, and a trust badge on every
          result.
        </p>

        {/* Value props */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-lg bg-[#0F1512] border border-[#1F2A24] shadow-[inset_0_0_0_1px_#1F2A24,0_0_24px_rgba(34,197,94,.06)]">
            <h3 className="text-lg font-semibold mb-2 text-[#22C55E]">Floor/Median/Ceiling</h3>
            <p className="text-sm text-[#9AB9A7]">
              See the full range, not just a misleading single number
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#0F1512] border border-[#1F2A24] shadow-[inset_0_0_0_1px_#1F2A24,0_0_24px_rgba(34,197,94,.06)]">
            <h3 className="text-lg font-semibold mb-2 text-[#22C55E]">Confidence-Gated Reasons</h3>
            <p className="text-sm text-[#9AB9A7]">
              Max 2 driver chips per player, only when confidence ≥ 0.65
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#0F1512] border border-[#1F2A24] shadow-[inset_0_0_0_1px_#1F2A24,0_0_24px_rgba(34,197,94,.06)]">
            <h3 className="text-lg font-semibold mb-2 text-[#22C55E]">Trust-First Transparency</h3>
            <p className="text-sm text-[#9AB9A7]">
              schema_version + last_refresh on every result
            </p>
          </div>
        </div>

        {/* Waitlist form */}
        <WaitlistForm />
      </section>
    </div>
  );
}
