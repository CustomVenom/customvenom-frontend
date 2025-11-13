'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlatformSelector } from '@/components/PlatformSelector';
import { logger } from '@/lib/logger';

type Platform = 'yahoo' | 'espn' | 'sleeper';

export function ConnectLeagueButton() {
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  const handlePlatformSelect = (platform: Platform) => {
    // Yahoo is handled directly in PlatformSelector
    // Future platforms will be handled here
    if (platform !== 'yahoo') {
      logger.info('Platform not yet implemented', { platform });
    }
  };

  if (showPlatformSelector) {
    return (
      <div className="mt-6">
        <PlatformSelector onSelect={handlePlatformSelect} />
        <Button
          onClick={() => setShowPlatformSelector(false)}
          variant="ghost"
          size="sm"
          className="mt-4"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowPlatformSelector(true)}
      variant="primary"
      size="lg"
      className="px-8 py-6 text-lg font-semibold"
    >
      Connect Your League
    </Button>
  );
}
