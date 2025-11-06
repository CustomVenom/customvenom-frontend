import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AccountContent } from './AccountContent';

export const metadata: Metadata = {
  title: 'Account Settings · CustomVenom',
  description: 'Manage your account, subscription, and preferences.',
};

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/account');
  }

  return <AccountContent session={session} />;
}
