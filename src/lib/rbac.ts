/**
 * Role-Based Access Control (RBAC) System
 * Defines roles, permissions, and access control logic
 */

// Role hierarchy (higher = more access)
export const ROLES = {
  ADMIN: 'admin',      // Full system access (you)
  TEAM: 'team',        // Team tier customers
  PRO: 'pro',          // Pro tier customers
  FREE: 'free',        // Free tier users
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Admin emails (YOU - hardcoded for security)
// These emails will ALWAYS have admin access, regardless of database state
const ADMIN_EMAILS = [
  'jdewett81@gmail.com',
];

// Check if an email is a hardcoded admin
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Role hierarchy levels
const ROLE_LEVELS: Record<Role, number> = {
  [ROLES.ADMIN]: 100,
  [ROLES.TEAM]: 30,
  [ROLES.PRO]: 20,
  [ROLES.FREE]: 10,
};

// Check if role has minimum required level
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

// Get effective role (overrides with admin email check)
export function getEffectiveRole(userRole: Role, email?: string | null): Role {
  // Admin emails ALWAYS get admin role
  if (isAdminEmail(email)) {
    return ROLES.ADMIN;
  }
  return userRole;
}

// Permissions by feature
export const PERMISSIONS = {
  // Analytics & Metrics
  VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.PRO, ROLES.TEAM],
  
  // Tool Features
  USE_COMPARE_VIEW: [ROLES.ADMIN, ROLES.PRO, ROLES.TEAM],
  EXPORT_CSV: [ROLES.ADMIN, ROLES.PRO, ROLES.TEAM],
  WEEKLY_RECAP_EMAIL: [ROLES.ADMIN, ROLES.PRO, ROLES.TEAM],
  
  // League Management
  IMPORT_LEAGUES: [ROLES.ADMIN, ROLES.FREE, ROLES.PRO, ROLES.TEAM], // Everyone
  MULTIPLE_LEAGUES: [ROLES.ADMIN, ROLES.PRO, ROLES.TEAM],
  
  // Admin Features
  VIEW_ALL_USERS: [ROLES.ADMIN],
  MANAGE_SUBSCRIPTIONS: [ROLES.ADMIN],
  VIEW_SYSTEM_METRICS: [ROLES.ADMIN],
  ACCESS_OPS_DASHBOARD: [ROLES.ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Check if user has permission
export function hasPermission(
  userRole: Role,
  permission: Permission,
  email?: string | null
): boolean {
  const effectiveRole = getEffectiveRole(userRole, email);
  return PERMISSIONS[permission].includes(effectiveRole);
}

// Get user entitlements based on role
export function getEntitlementsFromRole(
  role: Role,
  email?: string | null
) {
  const effectiveRole = getEffectiveRole(role, email);
  
  return {
    role: effectiveRole,
    isAdmin: effectiveRole === ROLES.ADMIN,
    isPro: hasMinimumRole(effectiveRole, ROLES.PRO),
    isTeam: effectiveRole === ROLES.TEAM,
    isFree: effectiveRole === ROLES.FREE && !isAdminEmail(email),
    features: {
      compareView: hasPermission(effectiveRole, 'USE_COMPARE_VIEW', email),
      csvExport: hasPermission(effectiveRole, 'EXPORT_CSV', email),
      recapEmail: hasPermission(effectiveRole, 'WEEKLY_RECAP_EMAIL', email),
      analytics: hasPermission(effectiveRole, 'VIEW_ANALYTICS', email),
      multipleLeagues: hasPermission(effectiveRole, 'MULTIPLE_LEAGUES', email),
      adminDashboard: hasPermission(effectiveRole, 'ACCESS_OPS_DASHBOARD', email),
    },
  };
}

// Subscription status helpers
export function isActiveSubscription(subscriptionStatus?: string | null): boolean {
  if (!subscriptionStatus) return false;
  return ['active', 'trialing'].includes(subscriptionStatus);
}

// Determine role from Stripe subscription
export function getRoleFromSubscription(
  subscriptionStatus?: string | null,
  tier?: string | null
): Role {
  if (!isActiveSubscription(subscriptionStatus)) {
    return ROLES.FREE;
  }
  
  // Map tier to role
  switch (tier?.toLowerCase()) {
    case 'team':
      return ROLES.TEAM;
    case 'pro':
      return ROLES.PRO;
    default:
      return ROLES.FREE;
  }
}

