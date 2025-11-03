import { TrustSnapshot } from '@/components/TrustSnapshot'

export function TrustSection() {
  // Mock data - replace with actual API data
  const trustData = {
    version: 'v1',
    timestamp: new Date().toISOString(),
    stale: false
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Trust Snapshot */}
          <div>
            <TrustSnapshot ts={trustData.timestamp} ver={trustData.version} stale={trustData.stale} />
          </div>

          {/* Right: Explanation */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              Calibrated Weekly
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Our Projections Bite Harder
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Most sites give you a single number. We give you the <strong>full picture</strong>:
                floor, median, and ceiling outcomes based on thousands of simulations.
              </p>

              <p>
                Every projection comes with <strong>explainable drivers</strong> —
                see exactly why a player&apos;s outlook changed this week.
              </p>

              <p>
                Our Trust Snapshot shows real-time calibration. When we say 70% confidence,
                we hit that target historically. No smoke and mirrors.
              </p>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">89%</div>
                <div className="text-sm text-gray-500">In-Range Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">±2.3</div>
                <div className="text-sm text-gray-500">Avg Median Error</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">Weekly</div>
                <div className="text-sm text-gray-500">Data Refresh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

