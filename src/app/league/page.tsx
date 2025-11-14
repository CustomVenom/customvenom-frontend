// League standings page
'use client';

import { useSession } from 'next-auth/react';
import { useUserStore } from '@/lib/store';
import { useLeagueStandings } from '@/hooks/use-league-standings';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Table, THead, TBody, Tr, Th, Td } from '@/components/ui/Table';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';

function LeagueContent() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { activeLeague } = useUserStore();
  const { data: standingsData, isLoading, error } = useLeagueStandings(activeLeague);

  if (!session) {
    return (
      <Alert>
        <AlertDescription>Please sign in with Yahoo to view league standings.</AlertDescription>
      </Alert>
    );
  }

  if (!activeLeague) {
    return (
      <Alert>
        <AlertDescription>Please select a league to view standings.</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !standingsData) {
    return (
      <Alert variant="danger">
        <AlertDescription>Failed to load standings. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (!standingsData.data) {
    return (
      <Alert variant="danger">
        <AlertDescription>Invalid standings data format.</AlertDescription>
      </Alert>
    );
  }

  const { standings, playoff_line } = standingsData.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">League Standings</h1>
        {playoff_line !== undefined && (
          <div className="text-sm text-muted-foreground">Playoff Line: Top {playoff_line}</div>
        )}
      </div>

      <Table>
        <THead>
          <Tr>
            <Th>Rank</Th>
            <Th>Team</Th>
            <Th>W</Th>
            <Th>L</Th>
            <Th>T</Th>
            <Th>PF</Th>
            <Th>PA</Th>
          </Tr>
        </THead>
        <TBody>
          {standings.map((team) => (
            <Tr
              key={team.team_key}
              className={
                playoff_line !== undefined && team.rank <= playoff_line ? 'bg-green-500/10' : ''
              }
            >
              <Td className="font-bold">{team.rank}</Td>
              <Td className="font-medium">{team.team_name}</Td>
              <Td>{team.wins}</Td>
              <Td>{team.losses}</Td>
              <Td>{team.ties}</Td>
              <Td>{team.points_for.toFixed(1)}</Td>
              <Td>{team.points_against.toFixed(1)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {standingsData && <TrustSnapshot trust={standingsData.trust} />}
    </div>
  );
}

export default function LeaguePage() {
  return (
    <ToolErrorBoundary toolName="League Standings">
      <LeagueContent />
    </ToolErrorBoundary>
  );
}
