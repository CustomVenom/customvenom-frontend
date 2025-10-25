'use client';

export default function Brand({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const wrap =
    size === 'lg' ? 'text-2xl md:text-3xl' : size === 'md' ? 'text-xl md:text-2xl' : 'text-lg';

  return (
    <div className={`inline-flex items-baseline gap-2 ${wrap}`}>
      <span className="brand-title">Custom Venom</span>
      <span className="brand-tagline">Pick Your Poison</span>
    </div>
  );
}
