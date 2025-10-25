'use client';

import { useState } from 'react';

import DensityToggle from '@/components/DensityToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/Table';

export default function DesignPreviewPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Design Preview</h1>
        <DensityToggle value={density} onValueChange={setDensity} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Component Showcase</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Buttons</h3>
            <div className="flex gap-2">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="subtle">Subtle</Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Badges</h3>
            <div className="flex gap-2">
              <Badge intent="positive">Positive</Badge>
              <Badge intent="warning">Warning</Badge>
              <Badge intent="danger">Danger</Badge>
              <Badge intent="neutral">Neutral</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Table</h3>
            <Table>
              <THead>
                <tr>
                  <Th>Player</Th>
                  <Th>Projection</Th>
                  <Th>Range</Th>
                  <Th>Reason</Th>
                </tr>
              </THead>
              <TBody>
                <Tr>
                  <Td>Josh Allen</Td>
                  <Td>24.2</Td>
                  <Td>21.0–27.8</Td>
                  <Td>
                    <Badge intent="positive">Usage ↑</Badge>
                  </Td>
                </Tr>
                <Tr>
                  <Td>Lamar Jackson</Td>
                  <Td>22.1</Td>
                  <Td>18.4–26.3</Td>
                  <Td>
                    <Badge intent="warning">Volatility</Badge>
                  </Td>
                </Tr>
              </TBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Dark Mode Test</h2>
        <div className="p-4 rounded bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
          <p>Tailwind CSS is working correctly!</p>
          <p className="text-sm mt-2">This should have proper dark mode styling.</p>
        </div>
      </div>
    </div>
  );
}
