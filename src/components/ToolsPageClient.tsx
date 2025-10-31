'use client';

import ConnectLeague from '@/components/ConnectLeague';
import { YahooRosterViewer } from '@/components/yahoo/YahooRosterViewer';

export default function ToolsPageClient() {
  return (
    <div className="p-4 space-y-6">
      <ConnectLeague />

      {/* Yahoo Roster Section */}
      <section className="mt-8">
        <YahooRosterViewer />
      </section>
    </div>
  );
}
