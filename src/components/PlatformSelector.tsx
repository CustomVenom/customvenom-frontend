'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

type Platform = 'yahoo' | 'espn' | 'sleeper';

interface PlatformSelectorProps {
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ onSelect }: PlatformSelectorProps) {
  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  const handlePlatformSelect = (platform: Platform) => {
    if (platform === 'yahoo') {
      // Redirect to Workers OAuth flow for Yahoo
      window.location.href = `${API_BASE}/api/connect/start?host=yahoo`;
    } else {
      // For future platforms, just call the callback
      onSelect(platform);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Choose Your Platform</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect your fantasy league to get started with data-driven insights
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Yahoo */}
        <button
          onClick={() => handlePlatformSelect('yahoo')}
          className="platform-card p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-venom-500 dark:hover:border-venom-500 transition-colors bg-white dark:bg-gray-800 text-left"
        >
          <div className="platform-icon mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Y!</span>
            </div>
          </div>
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Yahoo Fantasy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Most popular platform</p>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
            <Check className="w-3 h-3" />
            Available
          </span>
        </button>

        {/* ESPN */}
        <button
          disabled
          className="platform-card p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-left"
        >
          <div className="platform-icon mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ESPN</span>
            </div>
          </div>
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">ESPN Fantasy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Coming soon</p>
          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
            Coming Soon
          </span>
        </button>

        {/* Sleeper */}
        <button
          disabled
          className="platform-card p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-left"
        >
          <div className="platform-icon mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </div>
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Sleeper</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Coming soon</p>
          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
            Coming Soon
          </span>
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Supported platforms: Yahoo Fantasy (more coming soon)</p>
      </div>
    </div>
  );
}

