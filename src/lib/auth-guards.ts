/**
 * Auth Guards - Protect routes and components based on permissions
 */

import { redirect } from 'next/navigation';
import { auth } from './auth';
import { getEntitlements } from './entitlements';
import { type Permission } from './rbac';

/**
 * Require authentication
 * Redirects to home if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/?error=auth_required');
  }
  
  return session;
}

/**
 * Require specific permission
 * Redirects to appropriate page if permission not granted
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const entitlements = await getEntitlements();
  
  if (!entitlements.features[getFeatureFromPermission(permission)]) {
    // Redirect based on what they're missing
    if (permission === 'ACCESS_OPS_DASHBOARD' || permission === 'VIEW_ALL_USERS') {
      redirect('/?error=admin_only');
    } else {
      redirect('/go-pro?error=permission_required');
    }
  }
  
  return { session, entitlements };
}

/**
 * Require admin access
 * Redirects to home if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const entitlements = await getEntitlements();
  
  if (!entitlements.isAdmin) {
    redirect('/?error=admin_only');
  }
  
  return { session, entitlements };
}

/**
 * Require Pro subscription
 * Redirects to upgrade page if not Pro
 */
export async function requirePro() {
  const session = await requireAuth();
  const entitlements = await getEntitlements();
  
  if (!entitlements.isPro) {
    redirect('/go-pro?error=pro_required');
  }
  
  return { session, entitlements };
}

/**
 * Get current user with entitlements
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  const entitlements = await getEntitlements();
  
  return {
    ...session.user,
    entitlements,
  };
}

// Helper to map permissions to feature keys
function getFeatureFromPermission(permission: Permission): keyof ReturnType<typeof getEntitlements>['features'] {
  const mapping: Record<Permission, keyof ReturnType<typeof getEntitlements>['features']> = {
    'VIEW_ANALYTICS': 'analytics',
    'USE_COMPARE_VIEW': 'compareView',
    'EXPORT_CSV': 'csvExport',
    'WEEKLY_RECAP_EMAIL': 'recapEmail',
    'IMPORT_LEAGUES': 'compareView', // Basic feature
    'MULTIPLE_LEAGUES': 'multipleLeagues',
    'VIEW_ALL_USERS': 'adminDashboard',
    'MANAGE_SUBSCRIPTIONS': 'adminDashboard',
    'VIEW_SYSTEM_METRICS': 'adminDashboard',
    'ACCESS_OPS_DASHBOARD': 'adminDashboard',
  };
  
  return mapping[permission] || 'compareView';
}

