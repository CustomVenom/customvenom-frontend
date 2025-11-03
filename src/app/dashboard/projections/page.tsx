import { redirect } from 'next/navigation';

export default function DashboardProjectionsPage() {
  // Redirect to canonical projections page
  redirect('/projections');
}
