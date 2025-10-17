'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import GoProButton from '@/components/GoProButton';
import { getEntitlements, type Entitlements } from '@/lib/entitlements';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { FaabBands } from '@/components/FaabBands';
import { RiskDial } from '@/components/RiskDial';
import { ReasonChipsAdapter } from '@/components/ReasonChipsAdapter';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { type Reason } from '@/lib/reasonsClamp';
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';
import DemoBadge from '@/components/DemoBadge';

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
    <div className={styles.proFeature}>
      <div className={styles.proFeatureContent}>
        {children}
      </div>
      <div className={styles.proFeatureOverlay}>
        <div className={styles.proFeatureLock}>
          <span className={styles.lockIcon}>🔒</span>
          <span className={styles.lockText}>Pro Feature</span>
        </div>
      </div>
    </div>
  );
}

function ImportantDecisions({ decisions, isPro }: ImportantDecisionsProps & { isPro: boolean }) {
  if (decisions.length === 0) {
    return (
      <div className={styles.decisionsStrip}>
        <div className={styles.decisionsHeader}>
          <h2 className={styles.decisionsTitle}>Important Decisions</h2>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📊</span>
          <span className={styles.emptyText}>No important decisions yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.decisionsStrip}>
      <div className={styles.decisionsHeader}>
        <h2 className={styles.decisionsTitle}>Important Decisions</h2>
        <span className={styles.decisionsCount}>{decisions.length} decisions</span>
      </div>
      <ProFeature isPro={isPro}>
        <div className={styles.decisionsList}>
          {decisions.map((decision, index) => (
            <div key={index} className={styles.decisionItem}>
              <div className={styles.decisionHeader}>
                <span className={styles.decisionPlayer}>{decision.player_id}</span>
                <span className={styles.decisionStat}>{decision.stat_name}</span>
                <span className={styles.decisionProjection}>{decision.projection}</span>
              </div>
              <div className={styles.decisionReason}>
                <ReasonChipsAdapter reasons={decision.reasons} />
              </div>
              <div className={styles.decisionFooter}>
                <span className={styles.decisionConfidence}>
                  {(decision.confidence * 100).toFixed(1)}% confidence
                </span>
                <span className={styles.decisionRefresh}>
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
      // Check for session_id in URL params (from Stripe success redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      const userEntitlements = await getEntitlements(sessionId || undefined);
      setEntitlements(userEntitlements);
      
      // Clear session_id from URL after processing
      if (sessionId) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };

    fetchProjections();
    loadEntitlements();
  }, [reloadKey]); // Re-run when reloadKey changes

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Projections</h1>
        </div>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading projections...</p>
          <TableSkeleton rows={8} cols={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  // Derive important decisions from projections
  const deriveImportantDecisions = (projections: ProjectionData[], lastRefresh: string): ImportantDecision[] => {
    // Filter for high confidence projections with reasons
    const candidates = projections.filter(p => 
      p.confidence && p.confidence >= 0.75 && 
      p.reasons && p.reasons.length > 0
    );

    // De-duplicate by player (keep highest confidence per player)
    const playerMap = new Map<string, ProjectionData>();
    candidates.forEach(projection => {
      const existing = playerMap.get(projection.player_id);
      if (!existing || (projection.confidence && projection.confidence > (existing.confidence || 0))) {
        playerMap.set(projection.player_id, projection);
      }
    });

    // Convert to decisions and sort by confidence
    const decisions: ImportantDecision[] = Array.from(playerMap.values())
      .map(projection => ({
        player_id: projection.player_id,
        stat_name: projection.stat_name,
        projection: projection.projection,
        confidence: projection.confidence || 0,
        reasons: projection.reasons || [],
        last_refresh: lastRefresh
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Max 5 decisions

    return decisions;
  };

  const importantDecisions = deriveImportantDecisions(projections, lastRefresh);
  const isPro = entitlements?.isPro || false;

  // Group projections by player
  const groupedProjections = projections.reduce((acc, projection) => {
    const playerId = projection.player_id;
    if (!acc[playerId]) {
      acc[playerId] = [];
    }
    acc[playerId].push(projection);
    return acc;
  }, {} as Record<string, ProjectionData[]>);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <GlossaryTip term="Baseline">Projections</GlossaryTip>
          </h1>
          <button 
            onClick={handleReload}
            className={styles.reloadButton}
            aria-label="Reload projections data"
          >
            🔄 Reload Data
          </button>
        </div>
        <div className={styles.headerRight}>
          <DemoBadge show={isDemoMode} />
          <TrustSnapshot 
            lastRefresh={lastRefresh} 
            schemaVersion={schemaVersion} 
            stale={isStale}
            staleAge={staleAge}
          />
          {!isPro && (
            <div className={styles.proPrompt}>
              <GoProButton 
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_pro_season'}
              />
            </div>
          )}
        </div>
      </div>

      <ImportantDecisions decisions={importantDecisions} isPro={isPro} />

      <RiskDial week="2025-06" />

      <FaabBands week="2025-06" />

      <div className={styles.projectionsGrid}>
        {Object.entries(groupedProjections).map(([playerId, playerProjections]) => (
          <div key={playerId} className={styles.playerCard}>
            <div className={styles.playerHeader}>
              <h3 className={styles.playerId}>{playerId}</h3>
              <div className={styles.playerActions}>
                <ProFeature isPro={isPro}>
                  <button className={styles.actionButton}>
                    📊 Export CSV
                  </button>
                </ProFeature>
                <ProFeature isPro={isPro}>
                  <button className={styles.actionButton}>
                    📧 Email Recap
                  </button>
                </ProFeature>
              </div>
            </div>
            
            <div className={styles.projectionsList}>
              {playerProjections.map((projection, index) => (
                <div key={index} className={styles.projectionItem}>
                  <div className={styles.projectionHeader}>
                    <span className={styles.statName}>{projection.stat_name}</span>
                    <span className={styles.projectionValue}>{projection.projection}</span>
                  </div>
                  
                  <div className={styles.projectionDetails}>
                    <span className={styles.method}>{projection.method}</span>
                    <span className={styles.sources}>
                      <GlossaryTip term="Coverage">Sources</GlossaryTip>: {projection.sources_used}
                    </span>
                  </div>

                  {projection.reasons && (
                    <div className={styles.reasonsChipsContainer}>
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
