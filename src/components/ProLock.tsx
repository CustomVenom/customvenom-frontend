// ProLock Component
// Blurs content and shows unlock CTA for free users

'use client';

import { useRouter } from 'next/navigation';

interface ProLockProps {
  children: React.ReactNode;
  isPro: boolean;
  message?: string;
}

export function ProLock({ children, isPro, message = 'Unlock Pro features' }: ProLockProps) {
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm opacity-60 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
        <div className="text-center p-8 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold mb-3">{message}</h3>
          <p className="mb-6 text-white/90">
            Upgrade to Pro to access advanced features and insights
          </p>
          <button
            onClick={() => router.push('/go-pro')}
            className="w-full px-6 py-3 bg-white text-[#667eea] border-none rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-100"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

