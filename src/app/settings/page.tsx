// Settings Page
// Shows account details, role, and manage billing for Pro users

import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { LeagueImport } from '@/components/LeagueImport';
import styles from './page.module.css';

export const metadata = {
  title: 'Settings - CustomVenom',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const session = await requireAuth();

  if (!session) {
    redirect('/');
  }

  const { user } = session;
  const isPro = user.role === 'pro';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Account Settings</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <div className={styles.value}>{user.name || 'Not set'}</div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.value}>{user.email}</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Subscription</h2>
          <div className={styles.field}>
            <label className={styles.label}>Current Plan</label>
            <div className={styles.value}>
              <span className={isPro ? styles.proBadge : styles.freeBadge}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>

          {isPro ? (
            <form action="/api/stripe/portal" method="POST" className={styles.form}>
              <button type="submit" className={styles.manageButton}>
                Manage Billing
              </button>
              <p className={styles.hint}>
                Update payment method, view invoices, or cancel your subscription
              </p>
            </form>
          ) : (
            <div className={styles.upgradePrompt}>
              <p className={styles.upgradeText}>
                Upgrade to Pro to unlock advanced features and insights
              </p>
              <a href="/go-pro" className={styles.upgradeButton}>
                Upgrade to Pro
              </a>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>League Integration (Preview)</h2>
          <LeagueImport />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Danger Zone</h2>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className={styles.signOutButton}>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

