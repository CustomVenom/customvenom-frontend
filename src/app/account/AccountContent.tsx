'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import {
  User,
  Mail,
  Shield,
  CreditCard,
  Link as LinkIcon,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AccountContentProps {
  session: Session;
}

export function AccountContent({ session }: AccountContentProps) {
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');

  const [activeTab, setActiveTab] = useState(upgradeParam ? 'billing' : 'profile');

  const tier = (session.user?.tier as string) || 'FREE';
  const _role = (session.user?.role as string) || 'USER';

  return (
    <div className="min-h-screen bg-field-900 py-12 px-6 dashboard-hub">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Account Settings</h1>
          <p className="text-gray-400">Manage your profile, subscription, and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 mb-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'leagues', label: 'Connected Leagues', icon: LinkIcon },
            { id: 'preferences', label: 'Preferences', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-venom-500 text-venom-500'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && <ProfileTab session={session} />}
        {activeTab === 'billing' && <BillingTab tier={tier} upgradeParam={upgradeParam} />}
        {activeTab === 'leagues' && <LeaguesTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ session }: { session: Session }) {
  const [name, setName] = useState(session.user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: API call to update profile
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4 text-white">Personal Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <Input value={session.user?.email || ''} disabled icon={<Mail className="h-4 w-4" />} />
            <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Role</label>
            <div className="flex items-center gap-2">
              <Badge variant="venom">
                <Shield className="h-3 w-3 mr-1" />
                {session.user?.role || 'USER'}
              </Badge>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} variant="primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4 text-white">Security</h3>

        <div className="space-y-4">
          <Button variant="outline">Change Password</Button>

          <Button variant="danger" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Billing Tab
function BillingTab({ tier, upgradeParam }: { tier: string; upgradeParam: string | null }) {
  const plans = [
    {
      id: 'FREE',
      name: 'Hatchling',
      icon: '🥚',
      price: 'Free',
      features: ['Public projections', 'Basic stats'],
    },
    {
      id: 'VIPER',
      name: 'Viper',
      icon: '⚡',
      price: '$9.99/month',
      features: ['All Hatchling features', 'League integration', 'Start/Sit tool', 'FAAB helper'],
    },
    {
      id: 'MAMBA',
      name: 'Mamba',
      icon: '🐍',
      price: '$19.99/month',
      features: ['All Viper features', 'Killshot calculator', 'Faceoff tool', 'Strike ranges'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card variant="dashboard">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Current Plan</h3>
            <Badge variant={tier === 'FREE' ? 'neutral' : tier === 'VIPER' ? 'venom' : 'strike'}>
              {plans.find((p) => p.id === tier)?.name || tier}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {plans.find((p) => p.id === tier)?.price || 'Free'}
            </div>
          </div>
        </div>

        {upgradeParam && (
          <div className="bg-strike-500/10 border border-strike-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-strike-500">
              Upgrade to unlock {upgradeParam === 'mamba' ? 'Mamba' : 'Viper'} features
            </p>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            variant={plan.id === tier ? 'stat' : 'dashboard'}
            className={plan.id === tier ? 'ring-2 ring-venom-500' : ''}
          >
            <div className="text-4xl mb-4">{plan.icon}</div>
            <h4 className="text-xl font-bold mb-2 text-white">{plan.name}</h4>
            <div className="text-3xl font-bold mb-4 text-white">{plan.price}</div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="h-4 w-4 text-venom-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === tier ? (
              <Button variant="secondary" disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button variant="primary" className="w-full">
                {plan.id === 'FREE' ? 'Downgrade' : 'Upgrade'}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Leagues Tab
function LeaguesTab() {
  return (
    <Card variant="dashboard">
      <h3 className="text-lg font-semibold mb-4 text-white">Connected Leagues</h3>
      <p className="text-gray-400">
        Connect your fantasy leagues to get personalized projections and insights.
      </p>
      <Button variant="primary" className="mt-4">
        <LinkIcon className="h-4 w-4 mr-2" />
        Connect League
      </Button>
    </Card>
  );
}

// Preferences Tab
function PreferencesTab() {
  return (
    <Card variant="dashboard">
      <h3 className="text-lg font-semibold mb-4 text-white">Preferences</h3>
      <p className="text-gray-400">User preferences coming soon.</p>
    </Card>
  );
}
