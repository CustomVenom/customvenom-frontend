import YahooConnectButton from './YahooConnectButton';
import TeamSelector from '@/components/TeamSelector';

export default function ToolsPage() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Tools</h1>
      <YahooConnectButton />
      <TeamSelector />
    </div>
  );
}
