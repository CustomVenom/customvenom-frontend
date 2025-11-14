'use client';
import { usePathname } from 'next/navigation';
import PublicTrustFooter from './PublicTrustFooter';

// Public routes that should show PublicTrustFooter
const PUBLIC_ROUTES = [
  '/',
  '/features',
  '/pricing',
  '/about',
  '/legal/terms',
  '/legal/privacy',
  '/contact',
];

export default function PublicTrustFooterWrapper() {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Only render on public routes
  if (!isPublicRoute) return null;

  return <PublicTrustFooter />;
}
