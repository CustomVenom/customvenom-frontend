import { getServerSession } from '@/lib/auth-helpers';
import { ProLock } from '@/components/ProLock';
import { ProviderStatus } from '@/components/ProviderStatus';
import { ToolPageHeader } from '@/components/ToolPageHeader';

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
  const session = await getServerSession();
  const isPro = session?.user?.tier === 'VIPER' || session?.user?.tier === 'MAMBA';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <ProviderStatus provider="yahoo" connected={!!session} />
      </div>

      <ToolPageHeader title="Players • Free Agents & Waivers" currentTool="players" />

      <ProLock isPro={isPro}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Browse the player pool, track waivers, and plan FAAB bids here.</p>
        </div>
      </ProLock>
    </div>
  );
}
