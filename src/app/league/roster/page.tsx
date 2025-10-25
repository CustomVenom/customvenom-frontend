import { LeaguePageHeader } from '@/components/LeaguePageHeader';
import { ProLock } from '@/components/ProLock';
import { ProviderStatus } from '@/components/ProviderStatus';
import { getServerSession } from '@/lib/auth-helpers';

export const metadata = {
  title: 'Roster - CustomVenom',
  description: 'View your fantasy roster',
};

export const dynamic = 'force-dynamic';

export default async function RosterPage() {
  const session = await getServerSession();
  const isPro = session?.user?.role === 'pro';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Roster</h1>

      <div className="mb-6">
        <ProviderStatus provider="yahoo" connected={!!session} />
      </div>

      <LeaguePageHeader isPro={isPro} />

      <ProLock isPro={isPro}>
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <p className="text-gray-600">Your fantasy roster will appear here.</p>
        </div>
      </ProLock>
    </div>
  );
}
