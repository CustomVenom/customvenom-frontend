import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Target, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Floor/Median/Ceiling',
    description: 'See the full range, not just a misleading single number. Understand the spread of possible outcomes.'
  },
  {
    icon: Target,
    title: 'Confidence-Gated Reasons',
    description: 'Max 2 driver chips per player, only when confidence ≥ 0.65. Clear, actionable insights.'
  },
  {
    icon: Shield,
    title: 'Trust-First Transparency',
    description: 'schema_version + last_refresh on every result. Know when your data was updated and how.'
  },
  {
    icon: Zap,
    title: 'Live Roster Integration',
    description: 'Connect your fantasy league and see projections tailored to your team. Start/sit decisions made easy.'
  }
]

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Everything You Need to Win
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed for serious fantasy managers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card key={idx} variant="public" className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-venom-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-venom-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

