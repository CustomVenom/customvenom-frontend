// ProLock Component
// Blurs content and shows unlock CTA for free users

'use client';

import { useRouter } from 'next/navigation';
import styles from './ProLock.module.css';

interface ProLockProps {
  children: React.ReactNode;
  isPro: boolean;
  message?: string;
}

export function ProLock({ children, isPro, message = 'Unlock Pro features' }: ProLockProps) {
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.blurred}>
        {children}
      </div>
      <div className={styles.overlay}>
        <div className={styles.cta}>
          <div className={styles.icon}>🔒</div>
          <h3 className={styles.title}>{message}</h3>
          <p className={styles.description}>
            Upgrade to Pro to access advanced features and insights
          </p>
          <button
            onClick={() => router.push('/go-pro')}
            className={styles.button}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

