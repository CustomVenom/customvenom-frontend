'use client';

import { Button } from '@/components/ui/button';

export function ConnectLeagueButton() {
  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  const handleConnect = async () => {
    // Redirect to Workers OAuth flow
    window.location.href = `${API_BASE}/api/connect/start?host=yahoo`;
  };

  return (
    <Button
      onClick={handleConnect}
      variant="primary"
      size="lg"
      className="px-8 py-6 text-lg font-semibold"
    >
      Connect Yahoo Fantasy
    </Button>
  );
}
