import { redirect } from 'next/navigation';

export default function LegacyRosterRedirect() {
  redirect('/dashboard/roster');
}
