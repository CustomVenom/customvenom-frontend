import { redirect } from 'next/navigation';

/**
 * Redirect old /tools/projections route to NFL
 * Maintains backward compatibility
 */
export default function ProjectionsRedirect() {
  redirect('/tools/projections/nfl');
}
