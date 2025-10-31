export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import TeamPicker from '@/components/TeamPicker';
import RosterDisplay from '@/components/RosterDisplay';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <TeamPicker />
      <RosterDisplay />
    </div>
  );
}
