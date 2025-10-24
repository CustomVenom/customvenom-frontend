'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface ProviderStatusProps {
  provider: 'yahoo' | 'sleeper' | 'espn';
  connected: boolean;
  username?: string;
}

export function ProviderStatus({ provider, connected, username }: ProviderStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium capitalize">{provider}</span>
      {connected ? (
        <Badge intent="positive" className="text-xs">
          Connected {username && `• ${username}`}
        </Badge>
      ) : (
        <Badge intent="warning" className="text-xs">
          Not Connected
        </Badge>
      )}
    </div>
  );
}
