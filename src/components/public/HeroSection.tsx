'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden yard-lines">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-venom-50/50 to-white pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-venom-600 tracking-wide uppercase">
                  Fantasy Analytics
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fantasy Football
                <span className="block text-venom-600">Analytics</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                See <strong>floor, median, and ceiling</strong> projections for every player.
                Understand the <em>why</em> behind the numbers.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-venom-500 hover:bg-venom-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
                style={{ color: 'white' }}
              >
                Get Started Free
              </Link>

              <Link
                href="#projections"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-medium px-8 py-4 rounded-lg border-2 border-gray-200 transition-colors"
              >
                View Projections
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-500">Projections Weekly</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl font-bold text-gray-900">2025</div>
                <div className="text-sm text-gray-500">NFL Season</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-venom-600">✓</span>
                  <span className="text-sm font-medium text-gray-700">Calibrated</span>
                </div>
                <div className="text-sm text-gray-500">Live Data</div>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            {/* Projection card preview */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-venom-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    RB
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Christian McCaffrey</div>
                    <div className="text-sm text-gray-500">SF vs ARI</div>
                  </div>
                </div>
                <div className="bg-venom-50 text-venom-700 text-xs font-medium px-2 py-1 rounded">Week 9</div>
              </div>

              {/* Floor-Median-Ceiling visual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Floor</span>
                  <span className="font-mono font-semibold text-gray-900">14.2</span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-venom-200 via-venom-400 to-venom-600 rounded-lg" style={{ width: '85%' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">Median: 21.5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ceiling</span>
                  <span className="font-mono font-semibold text-gray-900">32.8</span>
                </div>
              </div>

              {/* Reasons */}
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-venom-50 text-venom-700 text-xs font-medium px-2 py-1 rounded border border-venom-200">
                  ↑ 85% Rush Share
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200">
                  • Positive Game Script
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-strike-400 to-strike-600 text-gray-900 px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-pulse">
              <Zap className="w-4 h-4" />
              Live Data
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

