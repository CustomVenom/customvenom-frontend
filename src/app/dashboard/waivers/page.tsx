'use client';

import { ProLock } from '@/components/ProLock';
import { ProviderStatus } from '@/components/ProviderStatus';
import { ToolPageHeader } from '@/components/ToolPageHeader';
import { useSession } from 'next-auth/react';

export default function WaiversPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.tier === 'VIPER' || session?.user?.tier === 'MAMBA';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <ProviderStatus provider="yahoo" connected={!!session} />
      </div>

      <ToolPageHeader title="Free Agents & Waivers" currentTool="players" />

      <ProLock isPro={isPro}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Your waiver claims and free agent pool will appear here.</p>
        </div>
      </ProLock>
    </div>
  );
}

