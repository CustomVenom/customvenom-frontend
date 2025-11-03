import { LeaguePageHeader } from '@/components/LeaguePageHeader';
import { ProLock } from '@/components/ProLock';
import { ProviderStatus } from '@/components/ProviderStatus';
import { getServerSession } from '@/lib/auth-helpers';

export const metadata = {
  title: 'Waivers - CustomVenom',
  description: 'Manage your waiver claims',
};

export const dynamic = 'force-dynamic';

export default async function WaiversPage() {
  const session = await getServerSession();
  const isPro = session?.user?.tier === 'VIPER' || session?.user?.tier === 'MAMBA';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Waivers</h1>

      <div className="mb-6">
        <ProviderStatus provider="yahoo" connected={!!session} />
      </div>

      <LeaguePageHeader isPro={isPro} />

      <ProLock isPro={isPro}>
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <p className="text-gray-600">Your waiver claims will appear here.</p>
        </div>
      </ProLock>
    </div>
  );
}
