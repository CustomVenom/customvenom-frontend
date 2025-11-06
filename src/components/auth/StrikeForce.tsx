'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Zap } from 'lucide-react'

type Tier = 'FREE' | 'VIPER' | 'MAMBA'

interface StrikeForceProps {
  /** Minimum tier required to access */
  requiredTier: Tier

  /** Feature name for messaging */
  featureName: string

  /** Children shown when user has access */
  children: ReactNode

  /** Variant: 'inline' (shows in place) or 'blur' (blurs content) */
  variant?: 'inline' | 'blur'

  /** Custom upgrade message */
  upgradeMessage?: string

  /** Show feature preview/screenshot */
  preview?: ReactNode
}

const TIER_HIERARCHY = { FREE: 0, VIPER: 1, MAMBA: 2 }

export function StrikeForce({
  requiredTier,
  featureName,
  children,
  variant = 'inline',
  upgradeMessage,
  preview
}: StrikeForceProps) {
  const { data: session, status } = useSession()

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-venom-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="border-2 border-dashed border-strike-500/30 rounded-lg p-8 text-center bg-field-800">
        <Lock className="h-12 w-12 text-strike-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-100">Connect Your League to Unlock</h3>
        <p className="text-gray-400 mb-6">
          {featureName} requires a connected fantasy league.
        </p>
        <Link href="/login">
          <Button variant="primary">
            Connect League
          </Button>
        </Link>
      </div>
    )
  }

  // Check tier access
  const userTier = (session.user?.tier || 'FREE') as Tier
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]

  // User has access - show feature
  if (hasAccess) {
    return <>{children}</>
  }

  // User needs upgrade
  const tierName = requiredTier === 'MAMBA' ? 'Mamba' : 'Viper'
  const tierPrice = requiredTier === 'MAMBA' ? '$19.99' : '$9.99'
  const tierIcon = requiredTier === 'MAMBA' ? '🐍' : '⚡'

  const defaultMessage = upgradeMessage ||
    `Unlock ${featureName} with ${tierName} tier access.`

  if (variant === 'blur') {
    return (
      <div className="relative">
        {/* Blurred content preview */}
        <div className="filter blur-sm pointer-events-none select-none opacity-40">
          {preview || children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-field-900 via-field-900/95 to-transparent">
          <div className="text-center max-w-md px-6">
            <Badge variant="strike" className="mb-4">
              {tierIcon} {tierName} Only
            </Badge>
            <h3 className="text-2xl font-bold mb-2 text-gray-100">{featureName}</h3>
            <p className="text-gray-400 mb-6">{defaultMessage}</p>
            <Link href={`/account?upgrade=${requiredTier.toLowerCase()}`}>
              <Button
                variant="primary"
                className="group"
              >
                <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                Unleash Full Venom · {tierPrice}/mo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Inline variant (default)
  return (
    <div className="border-2 border-strike-500/30 bg-gradient-to-br from-strike-900/10 to-transparent rounded-lg p-8 text-center bg-field-800">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-strike-500/10 mb-4">
        <Lock className="h-8 w-8 text-strike-500" />
      </div>

      <Badge variant="strike" className="mb-3">
        {tierIcon} {tierName} Feature
      </Badge>

      <h3 className="text-xl font-bold mb-2 text-gray-100">{featureName}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        {defaultMessage}
      </p>

      {preview && (
        <div className="mb-6 rounded-lg overflow-hidden border border-field-600">
          {preview}
        </div>
      )}

      <Link href={`/account?upgrade=${requiredTier.toLowerCase()}`}>
        <Button
          variant="primary"
          className="group"
        >
          <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
          Upgrade to {tierName} · {tierPrice}/mo
        </Button>
      </Link>

      <p className="text-xs text-gray-500 mt-4">
        7-day free trial · Cancel anytime
      </p>
    </div>
  )
}

