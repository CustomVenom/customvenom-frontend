'use client';
import { useState, useEffect } from 'react';

import { ReasonChips, type Reason } from '@/components/ReasonChips';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sample reasons data
  const sampleReasons: Reason[] = [
    { component: 'Usage ↑', delta_points: 2.1, confidence: 0.78, unit: 'points' },
    { component: 'Weather ↓', delta_points: -1.4, confidence: 0.72, unit: 'points' },
    { component: 'Def matchup', delta_points: 0.9, confidence: 0.6, unit: 'points' }, // This will be filtered (below 0.65)
    { component: 'Injury concern', delta_points: -0.8, confidence: 0.68, unit: 'points' },
  ];

  const samplePlayers = [
    { name: 'Patrick Mahomes', baseline: 22.3, floor: 17.8, ceiling: 28.1 },
    { name: 'Josh Allen', baseline: 21.8, floor: 16.9, ceiling: 27.4 },
    { name: 'Jalen Hurts', baseline: 20.5, floor: 15.2, ceiling: 26.8 },
    { name: 'Lamar Jackson', baseline: 19.9, floor: 14.7, ceiling: 25.6 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">UI Features Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Showcasing density toggle, skeletons, reason chips, and glossary tooltips
        </p>
      </div>

      {/* Feature 1: Density Toggle */}
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">1. Density Toggle</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Try the <GlossaryTip term="Density" /> toggle in the header (top-right) to switch between
          compact and comfortable spacing. The table below will adjust its padding automatically.
        </p>
      </section>

      {/* Feature 2: Skeletons */}
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">2. Loading Skeletons</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Skeleton placeholders prevent layout shifts during data loading. Click the button to see
          them in action.
        </p>
        <button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Data (2s)
        </button>
        <div className="mt-4">
          {isLoading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Baseline</th>
                  <th>Floor</th>
                  <th>Ceiling</th>
                </tr>
              </thead>
              <tbody>
                {samplePlayers.map((player, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{player.name}</td>
                    <td>{player.baseline.toFixed(1)}</td>
                    <td className="text-gray-500">{player.floor.toFixed(1)}</td>
                    <td className="text-gray-500">{player.ceiling.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </section>

      {/* Feature 3: Reason Chips */}
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">3. Reason Chips with Clamping</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <GlossaryTip term="Driver chip">Driver chips</GlossaryTip> show factors affecting
          projections. The system automatically:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
          <li>Filters reasons with confidence ≥ 0.65</li>
          <li>Shows max 2 chips (sorted by impact)</li>
          <li>Clamps total effect to ±3.5%</li>
        </ul>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Patrick Mahomes</p>
            <ReasonChips reasons={sampleReasons} />
            <p className="text-xs text-gray-500 mt-2">
              Note: &quot;Def matchup&quot; is filtered out (confidence 0.6 &lt; 0.65)
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Josh Allen</p>
            <ReasonChips
              reasons={[
                { component: 'Home game', delta_points: 1.8, confidence: 0.75, unit: 'points' },
                { component: 'vs weak DEF', delta_points: 2.3, confidence: 0.81, unit: 'points' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Feature 4: Glossary Tooltips */}
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">4. Glossary Tooltips</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Hover over or focus on underlined terms to see definitions:
        </p>
        <div className="space-y-2 text-sm">
          <p>
            The <GlossaryTip term="Baseline" /> projection represents the median expected outcome.
          </p>
          <p>
            View the <GlossaryTip term="Range band" /> to understand variance in projections.
          </p>
          <p>
            <GlossaryTip term="Coverage" /> tells you how reliable our predictions have been
            historically.
          </p>
          <p>
            Check the <GlossaryTip term="Trust snapshot" /> before making critical decisions.
          </p>
        </div>
      </section>

      {/* Combined Example */}
      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">All Features Combined</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          A realistic example showing all features working together:
        </p>
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Player</th>
                <th>
                  <GlossaryTip term="Baseline">Baseline</GlossaryTip>
                </th>
                <th>
                  <GlossaryTip term="Range band">Range</GlossaryTip>
                </th>
                <th>Drivers</th>
                <th>
                  <GlossaryTip term="Coverage">Coverage</GlossaryTip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">Patrick Mahomes</td>
                <td className="font-semibold">22.3</td>
                <td className="text-sm text-gray-500">17.8–28.1</td>
                <td>
                  <ReasonChips reasons={sampleReasons} />
                </td>
                <td className="text-sm">78%</td>
              </tr>
              <tr>
                <td className="font-medium">Josh Allen</td>
                <td className="font-semibold">21.8</td>
                <td className="text-sm text-gray-500">16.9–27.4</td>
                <td>
                  <ReasonChips
                    reasons={[
                      {
                        component: 'Home game',
                        delta_points: 1.8,
                        confidence: 0.75,
                        unit: 'points',
                      },
                      {
                        component: 'vs weak DEF',
                        delta_points: 2.3,
                        confidence: 0.81,
                        unit: 'points',
                      },
                    ]}
                  />
                </td>
                <td className="text-sm">82%</td>
              </tr>
              <tr>
                <td className="font-medium">Jalen Hurts</td>
                <td className="font-semibold">20.5</td>
                <td className="text-sm text-gray-500">15.2–26.8</td>
                <td>
                  <ReasonChips
                    reasons={[
                      {
                        component: 'Rush usage',
                        delta_points: 3.1,
                        confidence: 0.89,
                        unit: 'points',
                      },
                    ]}
                  />
                </td>
                <td className="text-sm">75%</td>
              </tr>
            </tbody>
          </Table>
        )}
      </section>

      {/* Acceptance Criteria */}
      <section className="card p-6 space-y-4 bg-green-50 dark:bg-green-900/10">
        <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
          ✓ Acceptance Checklist
        </h2>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <li>✓ Density toggle switches padding globally and persists between sessions</li>
          <li>✓ Skeletons appear before data and prevent layout jumps</li>
          <li>✓ Reason chips never exceed 2 visible items and total effect stays within ±3.5%</li>
          <li>
            ✓ Tooltip definitions render on hover/focus and are accessible with screen readers
          </li>
        </ul>
      </section>
    </div>
  );
}
