'use client';

import { useState } from 'react';
import type { Projection } from '@customvenom/lib/adapters/projections-adapter';

type Risk = 'protect' | 'neutral' | 'chase';

interface Props {
  dataset: Projection[];
  preA?: string;
  preB?: string;
  preRisk?: Risk;
}

export default function StartSitForm({ dataset, preA, preB, preRisk = 'neutral' }: Props) {
  const [playerA, setPlayerA] = useState<string | undefined>(preA);
  const [playerB, setPlayerB] = useState<string | undefined>(preB);
  const [risk, setRisk] = useState<Risk>(preRisk);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Start/Sit Helper</h2>
      <div className="flex gap-4">
        <select
          value={playerA || ''}
          onChange={(e) => setPlayerA(e.target.value || undefined)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Player A</option>
          {dataset.map((p) => (
            <option key={p.playerId} value={p.playerId}>
              {p.name} ({p.position})
            </option>
          ))}
        </select>
        <select
          value={playerB || ''}
          onChange={(e) => setPlayerB(e.target.value || undefined)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Player B</option>
          {dataset.map((p) => (
            <option key={p.playerId} value={p.playerId}>
              {p.name} ({p.position})
            </option>
          ))}
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as Risk)}
          className="px-4 py-2 border rounded"
        >
          <option value="protect">Protect</option>
          <option value="neutral">Neutral</option>
          <option value="chase">Chase</option>
        </select>
      </div>
      {playerA && playerB && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <p>Comparison will appear here</p>
        </div>
      )}
    </div>
  );
}
