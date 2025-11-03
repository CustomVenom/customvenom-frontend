import { redirect } from 'next/navigation';

export default function LegacyWaiversRedirect() {
  redirect('/dashboard/waivers');
}
