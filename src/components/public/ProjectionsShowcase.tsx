'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type ScoringFormat = '0.5ppr' | 'standard' | 'ppr'

interface ProjectionRowProps {
  player: string
  team: string
  position: string
  floor: number
  median: number
  ceiling: number
  drivers: string[]
}

function ProjectionRow({ player, team, position, floor, median, ceiling, drivers }: ProjectionRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-venom-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
            {position}
          </div>
          <div className="font-medium text-gray-900">{player}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{team}</td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono text-sm text-gray-600">{floor}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono font-semibold text-gray-900">{median}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono text-sm text-gray-600">{ceiling}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1 flex-wrap">
          {drivers.map((d, i) => (
            <span key={i} className="inline-block bg-venom-50 text-venom-700 text-xs px-2 py-0.5 rounded border border-venom-200">
              {d}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}

export function ProjectionsShowcase() {
  const [format, setFormat] = useState<ScoringFormat>('0.5ppr')
  const [position, setPosition] = useState<string>('ALL')

  // Sample data - replace with actual API call
  const sampleProjections: ProjectionRowProps[] = [
    {
      player: 'Christian McCaffrey',
      team: 'SF',
      position: 'RB',
      floor: 14.2,
      median: 21.5,
      ceiling: 32.8,
      drivers: ['↑ 85% Rush Share', '• Positive Script']
    },
    {
      player: 'CeeDee Lamb',
      team: 'DAL',
      position: 'WR',
      floor: 11.8,
      median: 18.3,
      ceiling: 29.5,
      drivers: ['↑ Target Share 28%', '↓ Tough DB']
    }
  ]

  return (
    <section id="projections" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Week 9 Projections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See probabilistic ranges and explainable drivers for every player.
            Filter by scoring format to match your league.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          {/* Scoring format toggle */}
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {(['0.5ppr', 'standard', 'ppr'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  format === fmt
                    ? 'bg-venom-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {fmt === '0.5ppr' ? '½ PPR' : fmt === 'standard' ? 'Standard' : 'Full PPR'}
              </button>
            ))}
          </div>

          {/* Position filter */}
          <div className="flex gap-2">
            {['ALL', 'QB', 'RB', 'WR', 'TE'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  position === pos
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Projections Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Median</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ceiling</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sampleProjections.map((proj, idx) => (
                  <ProjectionRow key={idx} {...proj} />
                ))}
              </tbody>
            </table>
          </div>

          {/* View more CTA */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-venom-600 hover:text-venom-700 font-medium text-sm"
            >
              View All Projections + Your Roster
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

