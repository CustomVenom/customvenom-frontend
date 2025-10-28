# Security & Access Control System

## Overview

CustomVenom uses a comprehensive Role-Based Access Control (RBAC) system with multiple layers of security to protect user data and ensure proper access control.

---

## 🔐 Master Access Setup (IMPORTANT - DO THIS FIRST!)

### Give Yourself Admin Access

1. **Open** `src/lib/rbac.ts`
2. **Find** the `ADMIN_EMAILS` array (around line 19)
3. **Add your email:**

```typescript
const ADMIN_EMAILS = [
  'your.email@gmail.com', // ← Add your actual email here
];
```

4. **Save the file**
5. **Sign out and sign in again** - You'll automatically get admin role

### Why This Works

- Your email is **hardcoded** in the application
- When you sign in, the system checks if your email is in `ADMIN_EMAILS`
- If yes, you **automatically get admin role** in the database
- Even if someone manually changes your role in the database, the system will override it
- This ensures you **NEVER** get locked out of your own system

---

## 👥 Role Hierarchy

```
ADMIN (100)  ← YOU - Full system access
  ↓
TEAM (30)    ← Team tier customers
  ↓
PRO (20)     ← Pro tier customers
  ↓
FREE (10)    ← Free tier users
```

Higher roles inherit all permissions from lower roles.

---

## 🎫 Permission System

### Current Permissions

| Permission           | Admin | Team | Pro | Free |
| -------------------- | ----- | ---- | --- | ---- |
| View Analytics       | ✅    | ✅   | ✅  | ❌   |
| Compare View         | ✅    | ✅   | ✅  | ❌   |
| CSV Export           | ✅    | ✅   | ✅  | ❌   |
| Weekly Recap Email   | ✅    | ✅   | ✅  | ❌   |
| Multiple Leagues     | ✅    | ✅   | ✅  | ❌   |
| Import Leagues       | ✅    | ✅   | ✅  | ✅   |
| Access Ops Dashboard | ✅    | ❌   | ❌  | ❌   |
| View All Users       | ✅    | ❌   | ❌  | ❌   |
| Manage Subscriptions | ✅    | ❌   | ❌  | ❌   |

### Adding New Permissions

Edit `src/lib/rbac.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions

  MY_NEW_FEATURE: [ROLES.ADMIN, ROLES.PRO], // Pro+ only
} as const;
```

---

## 🛡️ Protecting Pages & Routes

### Protect a Server Component/Page

```typescript
// app/admin/page.tsx
import { requireAdmin } from '@/lib/auth-guards';

export default async function AdminPage() {
  const { session, entitlements } = await requireAdmin();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
    </div>
  );
}
```

### Available Guards

```typescript
// Require any authenticated user
await requireAuth();

// Require Pro subscription or higher
await requirePro();

// Require admin role
await requireAdmin();

// Require specific permission
await requirePermission('VIEW_ANALYTICS');

// Get current user (returns null if not logged in)
const user = await getCurrentUser();
```

### Protect Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getEntitlements } from '@/lib/entitlements';

export function ProFeature() {
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    getEntitlements().then(setEntitlements);
  }, []);

  if (!entitlements?.isPro) {
    return <div>Pro feature - upgrade to access</div>;
  }

  return <div>Pro content here</div>;
}
```

---

## 🔒 Security Best Practices

### 1. Email Addresses Are Sensitive

- Store admin emails in `ADMIN_EMAILS` array
- Never log or expose admin emails in error messages
- Use environment variables for additional security if needed

### 2. Database Security

Your Prisma setup includes:

- ✅ SSL/TLS connections (`sslmode=require`)
- ✅ Channel binding for extra security
- ✅ Unique indexes on email/session tokens
- ✅ Cascade deletes to prevent orphaned data

### 3. Session Security

- Sessions are stored in database (not JWT)
- Automatic session cleanup on user deletion
- Session tokens are unique and indexed

### 4. Stripe Webhook Security

Always verify webhook signatures:

```typescript
// app/api/stripe/webhook/route.ts
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
```

### 5. API Route Protection

```typescript
// app/api/admin/route.ts
import { requireAdmin } from '@/lib/auth-guards';

export async function GET() {
  await requireAdmin(); // Throws if not admin

  // Admin-only logic here
  return Response.json({ data: 'sensitive info' });
}
```

---

## 💳 Subscription Management

### How Roles Are Assigned

1. **Free Tier**: Default for all users
2. **Pro/Team**: Assigned via Stripe webhook when subscription becomes active
3. **Admin**: Assigned automatically for emails in `ADMIN_EMAILS`

### Subscription Flow

```
User clicks "Go Pro"
  ↓
Stripe Checkout Session created
  ↓
User completes payment
  ↓
Stripe sends webhook to /api/stripe/webhook
  ↓
System updates user:
  - subscriptionStatus: 'active'
  - tier: 'pro' or 'team'
  - role: 'pro' or 'team'
  - stripeCustomerId: (from Stripe)
  ↓
User now has Pro/Team access
```

### Webhook Events to Handle

- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_failed` - Payment failed

---

## 🗄️ Database Schema Security

### User Model

```prisma
model User {
  id               String   @id @default(cuid())
  email            String?  @unique  // ← Unique, indexed
  role             String   @default("free")
  subscriptionStatus String?
  tier             String?
  stripeCustomerId String?  @unique  // ← Unique, indexed

  // Relations
  accounts         Account[]  // Cascade delete
  sessions         Session[]  // Cascade delete

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Key Security Features

1. **Cascade Deletes**: When user is deleted, all related data is automatically removed
2. **Unique Indexes**: Prevents duplicate emails/customer IDs
3. **No Sensitive Data in Events**: Analytics events link to userId with `onDelete: SetNull`

---

## 🚨 Common Issues & Solutions

### "I'm locked out of admin features"

1. Check `src/lib/rbac.ts` - is your email in `ADMIN_EMAILS`?
2. Sign out completely and sign back in
3. Check database: `SELECT email, role FROM "User" WHERE email = 'your@email.com'`
4. If role isn't 'admin', the next sign-in will fix it

### "User still has Pro access after canceling"

- Check Stripe webhook is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- Test webhooks in Stripe Dashboard

### "Session not persisting"

- Check `DATABASE_URL` is set correctly
- Verify Prisma migrations are up to date: `npx prisma db push`
- Check Session table exists: `npx prisma studio`

---

## 🔍 Testing Access Control

### Test Admin Access

```typescript
// Create test file: scripts/test-admin.ts
import { isAdminEmail, getEntitlementsFromRole, ROLES } from '@/lib/rbac';

const testEmail = 'your@email.com';
console.log('Is admin?', isAdminEmail(testEmail));
console.log('Admin entitlements:', getEntitlementsFromRole(ROLES.ADMIN, testEmail));
```

Run: `npx tsx scripts/test-admin.ts`

### Test in Browser

1. Open DevTools Console
2. Check session: `fetch('/api/auth/session').then(r => r.json())`
3. Should show `role: "admin"` if you're logged in as admin

---

## 📊 Monitoring & Auditing

### Recommended Monitoring

1. **Track admin actions** via analytics events:

```typescript
trackEvent('admin_action', {
  action: 'user_role_changed',
  targetUser: userId,
  newRole: 'pro',
});
```

2. **Log subscription changes**:

```typescript
console.log(`User ${userId} subscription changed: ${oldStatus} → ${newStatus}`);
```

3. **Monitor failed auth attempts** (future enhancement)

---

## 🚀 Production Deployment Checklist

- [ ] Add your email to `ADMIN_EMAILS` in `src/lib/rbac.ts`
- [ ] Set `DATABASE_URL` in Vercel environment variables
- [ ] Set `STRIPE_SECRET_KEY` in Vercel
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Configure Stripe webhook endpoint
- [ ] Test admin login works
- [ ] Test Pro subscription flow
- [ ] Test subscription cancellation
- [ ] Verify analytics events are stored
- [ ] Test all protected routes

---

## 🆘 Emergency Access

If you ever get completely locked out:

1. **Database Direct Access**:

```sql
UPDATE "User"
SET role = 'admin'
WHERE email = 'your@email.com';
```

2. **Temporary Override** (emergency only):

```typescript
// src/lib/entitlements.ts - Add at top of getEntitlements()
if (process.env.EMERGENCY_ADMIN === 'true') {
  return getEntitlementsFromRole(ROLES.ADMIN);
}
```

Then set `EMERGENCY_ADMIN=true` in Vercel (remove after regaining access!)

---

## 📚 Additional Resources

- **Prisma Security**: https://www.prisma.io/docs/guides/security
- **NextAuth.js Security**: https://next-auth.js.org/configuration/options#security
- **Stripe Security**: https://stripe.com/docs/security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## ✅ Summary

Your CustomVenom application now has:

1. ✅ **Admin email system** - You'll never get locked out
2. ✅ **Role-based access control** - Granular permissions
3. ✅ **Stripe integration** - Automatic role assignment
4. ✅ **Secure sessions** - Database-backed, not JWT
5. ✅ **Database security** - SSL, unique indexes, cascade deletes
6. ✅ **API protection** - Guard functions for routes
7. ✅ **User data security** - Proper isolation and cleanup

**Next Step**: Add your email to `ADMIN_EMAILS` and sign in to test!
