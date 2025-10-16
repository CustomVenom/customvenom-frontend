'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import GoProButton from '@/components/GoProButton';
import { getEntitlements, type Entitlements } from '@/lib/entitlements';
import { TrustSnapshot } from '@/components/TrustSnapshot';

interface ProjectionData {
  player_id: string;
  stat_name: string;
  projection: number;
  method: string;
  sources_used: number;
  confidence?: number;
  reasons?: string[];
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
  reasons: string[];
  last_refresh: string;
}

interface TrustBadgeProps {
  lastRefresh: string;
  schemaVersion: string;
  isStale?: boolean;
}

function TrustBadge({ lastRefresh, schemaVersion, isStale = false }: TrustBadgeProps) {
  return (
    <div className={styles.trustBadge}>
      <div className={styles.trustBadgeHeader}>
        <span className={styles.trustIcon}>🛡️</span>
        <span className={styles.trustTitle}>Trust</span>
        {isStale && (
          <span className={styles.staleBadge}>⚠️ Stale</span>
        )}
      </div>
      <div className={styles.trustDetails}>
        <div className={styles.trustItem}>
          <span className={styles.trustLabel}>Last Refresh:</span>
          <span className={styles.trustValue}>{new Date(lastRefresh).toLocaleString()}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustLabel}>Schema Version:</span>
          <span className={styles.trustValue}>{schemaVersion}</span>
        </div>
      </div>
    </div>
  );
}

interface ReasonsDisplayProps {
  reasons: string[];
  confidence: number;
}

function ReasonsDisplay({ reasons, confidence }: ReasonsDisplayProps) {
  if (confidence < 0.65) {
    return null;
  }

  const displayReasons = reasons.slice(0, 2); // Show max 2 reasons

  return (
    <div className={styles.reasonsContainer}>
      <div className={styles.reasonsHeader}>
        <span className={styles.reasonsTitle}>Reasons</span>
        <span className={styles.confidenceBadge}>
          Confidence: {(confidence * 100).toFixed(1)}%
        </span>
      </div>
      <ul className={styles.reasonsList}>
        {displayReasons.map((reason, index) => (
          <li key={index} className={styles.reasonItem}>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ImportantDecisionsProps {
  decisions: ImportantDecision[];
}

interface ProFeatureProps {
  isPro: boolean;
  feature: string;
  children: React.ReactNode;
}

function ProFeature({ isPro, feature, children }: ProFeatureProps) {
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
      <ProFeature isPro={isPro} feature="compareView">
        <div className={styles.decisionsList}>
          {decisions.map((decision, index) => (
            <div key={index} className={styles.decisionItem}>
              <div className={styles.decisionHeader}>
                <span className={styles.decisionPlayer}>{decision.player_id}</span>
                <span className={styles.decisionStat}>{decision.stat_name}</span>
                <span className={styles.decisionProjection}>{decision.projection}</span>
              </div>
              <div className={styles.decisionReason}>
                {decision.reasons[0] || 'High confidence projection'}
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

export default function ProjectionsPage() {
  const [projections, setProjections] = useState<ProjectionData[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [staleAge, setStaleAge] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setIsStale(staleHeader === 'true');
        setStaleAge(staleAgeHeader);
        
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
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading projections...</div>
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
        <h1 className={styles.title}>Projections</h1>
        <div className={styles.headerRight}>
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
                onSuccess={() => window.location.reload()}
              />
            </div>
          )}
        </div>
      </div>

      <ImportantDecisions decisions={importantDecisions} isPro={isPro} />

      <div className={styles.projectionsGrid}>
        {Object.entries(groupedProjections).map(([playerId, playerProjections]) => (
          <div key={playerId} className={styles.playerCard}>
            <div className={styles.playerHeader}>
              <h3 className={styles.playerId}>{playerId}</h3>
              <div className={styles.playerActions}>
                <ProFeature isPro={isPro} feature="csvExport">
                  <button className={styles.actionButton}>
                    📊 Export CSV
                  </button>
                </ProFeature>
                <ProFeature isPro={isPro} feature="recapEmail">
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
                    <span className={styles.sources}>Sources: {projection.sources_used}</span>
                  </div>

                  {projection.confidence && projection.reasons && (
                    <ReasonsDisplay 
                      reasons={projection.reasons} 
                      confidence={projection.confidence} 
                    />
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
