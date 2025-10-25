import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, THead, Th, TBody, Tr, Td } from '@/components/ui/Table'
import { Tooltip } from '@/components/ui/Tooltip'

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="subtle">Subtle</Button>
        <Tooltip content="Confidence >= 0.65">
          <Badge intent="positive">Reason: Market Delta</Badge>
        </Tooltip>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-lg font-semibold">Projections (demo)</h2>
        <Table>
          <THead>
            <tr>
              <Th>Player</Th>
              <Th>Baseline</Th>
              <Th>Range</Th>
              <Th>Chips</Th>
            </tr>
          </THead>
          <TBody>
            <Tr>
              <Td>Player A</Td>
              <Td>15.2</Td>
              <Td>13.0–17.8</Td>
              <Td>
                <Badge intent="positive">Usage ↑</Badge>
              </Td>
            </Tr>
            <Tr>
              <Td>Player B</Td>
              <Td>12.1</Td>
              <Td>10.4–14.3</Td>
              <Td>
                <Badge intent="warning">Volatility</Badge>
              </Td>
            </Tr>
            <Tr>
              <Td>Player C</Td>
              <Td>18.7</Td>
              <Td>16.2–21.4</Td>
              <Td>
                <Badge intent="neutral">Matchup OK</Badge>
              </Td>
            </Tr>
          </TBody>
        </Table>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Component Demo
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Badge intent="positive">Positive</Badge>
            <Badge intent="warning">Warning</Badge>
            <Badge intent="danger">Danger</Badge>
            <Badge intent="neutral">Neutral</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
