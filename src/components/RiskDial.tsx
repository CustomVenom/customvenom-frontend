'use client';

import { useEffect, useState } from 'react';

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
        const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const response = await fetch(`${apiBase}/risk_dial?week=${week}`, {
          cache: 'no-store',
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="text-center text-lg text-gray-600 py-5">Loading risk assessment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="text-center text-lg text-red-600 py-5">Error: {error}</div>
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
    if (riskLevel === 'low')
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-green-600/15 text-green-300 ring-1 ring-inset ring-green-600/30';
    if (riskLevel === 'moderate')
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-yellow-600/15 text-yellow-300 ring-1 ring-inset ring-yellow-600/30';
    return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-red-600/15 text-red-300 ring-1 ring-inset ring-red-600/30';
  };

  const getRiskLabel = () => {
    if (riskLevel === 'low') return 'Low Risk';
    if (riskLevel === 'moderate') return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 m-0">Risk Assessment</h2>
        {lastRefresh && (
          <span className="text-sm text-gray-500">
            Updated {new Date(lastRefresh).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform transition-transform"
          >
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
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
            />
            {/* Center text */}
            <text x="100" y="95" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#111">
              {confidencePercent}%
            </text>
            <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#666">
              Confidence
            </text>
          </svg>
        </div>

        <div className="flex-1">
          <span className={getRiskBadgeClass()}>{getRiskLabel()}</span>
          <p className="text-gray-700 leading-relaxed">{recommendation}</p>
        </div>
      </div>

      {factors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[#667eea] font-medium hover:text-[#5a6fd8] transition-colors cursor-pointer bg-transparent border-none p-0 text-base"
          >
            {expanded ? '▼' : '▶'} View Factor Breakdown
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {factors.map((factor, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{factor.name}</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {Math.round(factor.score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${factor.score * 100}%`,
                        backgroundColor:
                          factor.score > 0.8
                            ? '#10b981'
                            : factor.score >= 0.6
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
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
