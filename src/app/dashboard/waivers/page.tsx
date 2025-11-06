import { redirect } from 'next/navigation';

export default function LegacyDashboardWaiversRedirect() {
  redirect('/dashboard/players');
}
