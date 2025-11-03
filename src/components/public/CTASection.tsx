import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-venom-500 to-venom-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Strike?
            </h2>
            <p className="text-xl text-venom-50 max-w-2xl mx-auto">
              Join thousands of fantasy managers making better decisions with data-driven insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-venom-600 hover:bg-gray-50">
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <Link href="#projections">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                View Live Projections
              </Button>
            </Link>
          </div>

          <div className="pt-8 text-sm text-venom-100">
            <p>No credit card required • 7-day free trial • Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}

