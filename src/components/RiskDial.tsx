'use client';

import { useEffect, useState } from 'react';
import styles from './RiskDial.module.css';

interface RiskFactor {
  name: string;
  score: number;
  weight: number;
}

interface RiskDialProps {
  week?: string;
}

export function RiskDial({ week = '2025-06' }: RiskDialProps) {
  const [overallConfidence, setOverallConfidence] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [factors, setFactors] = useState<RiskFactor[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchRiskDial = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
        const response = await fetch(`${apiBase}/risk_dial?week=${week}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch risk dial: ${response.status}`);
        }

        const data = await response.json();
        setOverallConfidence(data.overall_confidence || 0);
        setRiskLevel(data.risk_level || 'moderate');
        setFactors(data.factors || []);
        setRecommendation(data.recommendation || '');
        setLastRefresh(data.last_refresh || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch risk dial');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskDial();
  }, [week]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading risk assessment...</div>
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

  const confidencePercent = Math.round(overallConfidence * 100);
  const getRiskColor = () => {
    if (confidencePercent > 80) return '#10b981'; // green
    if (confidencePercent >= 60) return '#f59e0b'; // yellow/orange
    return '#ef4444'; // red
  };

  const getRiskBadgeClass = () => {
    if (riskLevel === 'low') return styles.badgeLow;
    if (riskLevel === 'moderate') return styles.badgeModerate;
    return styles.badgeHigh;
  };

  const getRiskLabel = () => {
    if (riskLevel === 'low') return 'Low Risk';
    if (riskLevel === 'moderate') return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Risk Assessment</h2>
        {lastRefresh && (
          <span className={styles.lastRefresh}>
            Updated {new Date(lastRefresh).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className={styles.dialContainer}>
        <div className={styles.dial}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            {/* Progress arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getRiskColor()}
              strokeWidth="20"
              strokeDasharray={`${2 * Math.PI * 80 * (confidencePercent / 100)} ${2 * Math.PI * 80}`}
              strokeDashoffset={2 * Math.PI * 80 * 0.25}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className={styles.progressCircle}
            />
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fontSize="36"
              fontWeight="bold"
              fill="#111"
            >
              {confidencePercent}%
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              fontSize="14"
              fill="#666"
            >
              Confidence
            </text>
          </svg>
        </div>

        <div className={styles.info}>
          <span className={`${styles.riskBadge} ${getRiskBadgeClass()}`}>
            {getRiskLabel()}
          </span>
          <p className={styles.recommendation}>{recommendation}</p>
        </div>
      </div>

      {factors.length > 0 && (
        <div className={styles.factorsSection}>
          <button
            onClick={() => setExpanded(!expanded)}
            className={styles.expandButton}
          >
            {expanded ? '▼' : '▶'} View Factor Breakdown
          </button>

          {expanded && (
            <div className={styles.factorsList}>
              {factors.map((factor, index) => (
                <div key={index} className={styles.factorItem}>
                  <div className={styles.factorHeader}>
                    <span className={styles.factorName}>{factor.name}</span>
                    <span className={styles.factorScore}>
                      {Math.round(factor.score * 100)}%
                    </span>
                  </div>
                  <div className={styles.factorBar}>
                    <div
                      className={styles.factorProgress}
                      style={{
                        width: `${factor.score * 100}%`,
                        backgroundColor: factor.score > 0.8 ? '#10b981' : factor.score >= 0.6 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <div className={styles.factorWeight}>
                    Weight: {Math.round(factor.weight * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

