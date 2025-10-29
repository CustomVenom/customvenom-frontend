'use client';
import { useEffect, useState } from 'react';

import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';
import DemoBadge from '@/components/DemoBadge';
import { FaabBands } from '@/components/FaabBands';
import GoProButton from '@/components/GoProButton';
import { ReasonChipsAdapter } from '@/components/ReasonChipsAdapter';
import { RiskDial } from '@/components/RiskDial';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { type Entitlements } from '@/lib/entitlements';
import { type Reason } from '@/lib/reasonsClamp';

interface ProjectionData {
  player_id: string;
  stat_name: string;
  projection: number;
  method: string;
  sources_used: number;
  confidence?: number;
  reasons?: Reason[]; // Updated to use Reason type
}

interface ProjectionsResponse {
  schema_version: string;
  last_refresh: string;
  projections: ProjectionData[];
}

interface ImportantDecision {
  player_id: string;
  stat_name: string;
  projection: number;
  confidence: number;
  reasons: Reason[]; // Updated to use Reason type
  last_refresh: string;
}

// ReasonsDisplay removed - replaced by ReasonChips component

interface ImportantDecisionsProps {
  decisions: ImportantDecision[];
}

interface ProFeatureProps {
  isPro: boolean;
  children: React.ReactNode;
}

function ProFeature({ isPro, children }: ProFeatureProps) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm opacity-60 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
        <div className="flex flex-col items-center gap-2 bg-linear-to-br from-[#667eea] to-[#764ba2] text-white px-6 py-4 rounded-xl shadow-lg">
          <span className="text-2xl">🔒</span>
          <span className="font-semibold text-sm">Pro Feature</span>
        </div>
      </div>
    </div>
  );
}

function ImportantDecisions({ decisions, isPro }: ImportantDecisionsProps & { isPro: boolean }) {
  if (decisions.length === 0) {
    return (
      <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 m-0">Important Decisions</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
          <span className="text-3xl mb-3 opacity-60">📊</span>
          <span className="text-gray-600 text-lg font-medium">No important decisions yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 m-0">Important Decisions</h2>
        <span className="bg-[#667eea] text-white px-3 py-1 rounded-full text-sm font-medium">
          {decisions.length} decisions
        </span>
      </div>
      <ProFeature isPro={isPro}>
        <div className="flex flex-col gap-3">
          {decisions.map((decision, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800 text-lg">{decision.player_id}</span>
                <span className="text-gray-600 text-sm capitalize">{decision.stat_name}</span>
                <span className="text-xl font-bold text-[#667eea]">{decision.projection}</span>
              </div>
              <div className="text-gray-700 text-base mb-2 leading-snug">
                <ReasonChipsAdapter reasons={decision.reasons} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-xl font-medium">
                  {(decision.confidence * 100).toFixed(1)}% confidence
                </span>
                <span className="text-gray-600">
                  Updated: {new Date(decision.last_refresh).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ProFeature>
    </div>
  );
}

function ProjectionsPageInner() {
  const [projections, setProjections] = useState<ProjectionData[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [staleAge, setStaleAge] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // For triggering manual reloads

  useEffect(() => {
    const fetchProjections = async () => {
      try {
        setLoading(true);
        // Use the current week for demo - in production this would be dynamic
        const week = '2025-05';
        const response = await fetch(`/api/projections?week=${week}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch projections: ${response.status}`);
        }

        const data: ProjectionsResponse = await response.json();

        // Check for stale headers
        const staleHeader = response.headers.get('x-stale');
        const staleAgeHeader = response.headers.get('x-stale-age');
        const demoModeHeader = response.headers.get('x-demo-mode');
        setIsStale(staleHeader === 'true');
        setStaleAge(staleAgeHeader);
        setIsDemoMode(demoModeHeader === 'true');

        setProjections(data.projections);
        setSchemaVersion(data.schema_version);
        setLastRefresh(data.last_refresh);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
      } finally {
        setLoading(false);
      }
    };

    const loadEntitlements = async () => {
      try {
        const response = await fetch('/api/entitlements');
        if (response.ok) {
          const userEntitlements = await response.json();
          setEntitlements(userEntitlements);
        }
      } catch (error) {
        console.error('Failed to load entitlements:', error);
      }

      // Clear session_id from URL if present (from Stripe redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };

    fetchProjections();
    loadEntitlements();
  }, [reloadKey]); // Re-run when reloadKey changes

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="flex justify-between items-start mb-8 gap-5">
          <h1 className="text-4xl font-bold text-gray-800 m-0 mb-3">Projections</h1>
        </div>
        <div className="p-5">
          <p className="text-center text-lg text-gray-600 mb-5">Loading projections...</p>
          <TableSkeleton rows={8} cols={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="text-center text-xl text-red-600 py-10 bg-red-50 border border-red-200 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  // Derive important decisions from projections
  const deriveImportantDecisions = (
    projections: ProjectionData[],
    lastRefresh: string,
  ): ImportantDecision[] => {
    // Filter for high confidence projections with reasons
    const candidates = projections.filter(
      (p) => p.confidence && p.confidence >= 0.75 && p.reasons && p.reasons.length > 0,
    );

    // De-duplicate by player (keep highest confidence per player)
    const playerMap = new Map<string, ProjectionData>();
    candidates.forEach((projection) => {
      const existing = playerMap.get(projection.player_id);
      if (
        !existing ||
        (projection.confidence && projection.confidence > (existing.confidence || 0))
      ) {
        playerMap.set(projection.player_id, projection);
      }
    });

    // Convert to decisions and sort by confidence
    const decisions: ImportantDecision[] = Array.from(playerMap.values())
      .map((projection) => ({
        player_id: projection.player_id,
        stat_name: projection.stat_name,
        projection: projection.projection,
        confidence: projection.confidence || 0,
        reasons: projection.reasons || [],
        last_refresh: lastRefresh,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Max 5 decisions

    return decisions;
  };

  const importantDecisions = deriveImportantDecisions(projections, lastRefresh);
  const isPro = entitlements?.isPro || false;

  // Group projections by player
  const groupedProjections = projections.reduce(
    (acc, projection) => {
      const playerId = projection.player_id;
      if (!acc[playerId]) {
        acc[playerId] = [];
      }
      acc[playerId]!.push(projection);
      return acc;
    },
    {} as Record<string, ProjectionData[]>,
  );

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="flex justify-between items-start mb-8 gap-5">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 m-0 mb-3">
            <GlossaryTip term="Baseline">Projections</GlossaryTip>
          </h1>
          <button
            onClick={handleReload}
            className="bg-[#667eea] text-white border-none px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all inline-flex items-center gap-1.5 hover:bg-[#5a6fd8] hover:-translate-y-px active:translate-y-0"
            aria-label="Reload projections data"
          >
            🔄 Reload Data
          </button>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <DemoBadge show={isDemoMode} />
          <TrustSnapshot
            lastRefresh={lastRefresh}
            schemaVersion={schemaVersion}
            stale={isStale}
            staleAge={staleAge}
          />
          {!isPro && (
            <div className="bg-linear-to-br from-[#ff6b35] to-[#f7931e] p-3 px-4 rounded-lg shadow-lg">
              <GoProButton
                priceId={process.env['NEXT_PUBLIC_STRIPE_PRICE_ID'] || 'price_pro_season'}
              />
            </div>
          )}
        </div>
      </div>

      <ImportantDecisions decisions={importantDecisions} isPro={isPro} />

      <RiskDial week="2025-06" />

      <FaabBands week="2025-06" />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {Object.entries(groupedProjections).map(([playerId, playerProjections]) => (
          <div
            key={playerId}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 m-0">{playerId}</h3>
              <div className="flex gap-2">
                <ProFeature isPro={isPro}>
                  <button className="bg-[#667eea] text-white border-none px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-[#5a6fd8] hover:-translate-y-px">
                    📊 Export CSV
                  </button>
                </ProFeature>
                <ProFeature isPro={isPro}>
                  <button className="bg-[#667eea] text-white border-none px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-[#5a6fd8] hover:-translate-y-px">
                    📧 Email Recap
                  </button>
                </ProFeature>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {playerProjections.map((projection, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#667eea]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 capitalize">
                      {projection.stat_name}
                    </span>
                    <span className="text-xl font-bold text-[#667eea]">
                      {projection.projection}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                    <span className="italic">{projection.method}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-xl text-xs font-medium">
                      <GlossaryTip term="Coverage">Sources</GlossaryTip>: {projection.sources_used}
                    </span>
                  </div>

                  {projection.reasons && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <ReasonChipsAdapter reasons={projection.reasons} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectionsPage() {
  return (
    <ApiErrorBoundary>
      <ProjectionsPageInner />
    </ApiErrorBoundary>
  );
}
