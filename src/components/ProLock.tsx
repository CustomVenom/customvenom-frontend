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
  // DISABLED FOR DEVELOPMENT - Always show content
  return <>{children}</>;
}
