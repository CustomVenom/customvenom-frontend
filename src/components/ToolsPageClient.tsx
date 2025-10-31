'use client';

import ConnectLeague from '@/components/ConnectLeague';
import { RosterViewer } from '@/components/roster/RosterViewer';

export default function ToolsPageClient() {
  return (
    <div className="p-4 space-y-6">
      <ConnectLeague />

      {/* Roster Section */}
      <section className="mt-8">
        <RosterViewer />
      </section>
    </div>
  );
}
