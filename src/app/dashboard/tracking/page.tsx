import { WeeklyTrackingTable } from '@/components/tracking/WeeklyTrackingTable';

export default function TrackingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Player Tracking</h1>
        <p className="text-gray-600 mt-2">
          Compare projected vs actual fantasy points for your roster
        </p>
      </div>
      <WeeklyTrackingTable />
    </div>
  );
}


