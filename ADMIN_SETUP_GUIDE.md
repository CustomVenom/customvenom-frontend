# Admin Setup Guide - Get Master Access in 2 Minutes

## 🎯 Quick Setup

### Step 1: Add Your Email (30 seconds)

1. Open `src/lib/rbac.ts`
2. Find line ~19 with `ADMIN_EMAILS`
3. Add your email:

```typescript
const ADMIN_EMAILS = [
  'your.actual.email@gmail.com',  // ← Replace with YOUR email
];
```

4. Save the file

### Step 2: Sign In (30 seconds)

1. If already signed in → **Sign out first**
2. Go to http://localhost:3000
3. Click "Sign In"
4. Sign in with **the same email you added above**

### Step 3: Verify (30 seconds)

1. Go to http://localhost:3000/ops/metrics
2. You should see the full analytics dashboard
3. ✅ You now have master admin access!

---

## 🔍 How It Works

```
You sign in
  ↓
System checks: Is your email in ADMIN_EMAILS?
  ↓ YES
Database updated: role = 'admin'
  ↓
Every request checks your role
  ↓
Admin email override: Even if DB role changes, you stay admin
  ↓
✅ You can NEVER be locked out
```

---

## 🛡️ Security Features

### ✅ What's Protected

1. **User Data**
   - Emails are unique (can't have duplicates)
   - Sessions stored in database (secure)
   - SSL encryption on all database connections
   - Automatic data cleanup on user deletion

2. **Admin Access**
   - Hardcoded email list (can't be changed via database)
   - Automatic role assignment on sign-in
   - Override protection (you always stay admin)

3. **Subscription Data**
   - Stripe customer IDs are unique
   - Webhook signature verification
   - Subscription status validated before granting access

### ✅ Privacy Guarantees

- **Analytics events**: Linked to userId with `onDelete: SetNull` (anonymous if user deleted)
- **User deletion**: All related data automatically removed (accounts, sessions, preferences, leagues)
- **No data leakage**: Users can only see their own data
- **Admin separation**: Your admin access is separate from subscriptions

---

## 👥 User Role Management

### Current Users Get Roles Via:

1. **Free Users**: Default for all new signups
2. **Pro/Team Users**: Via Stripe subscription
3. **Admins**: Via `ADMIN_EMAILS` hardcode (you)

### How Subscriptions Work

```
User subscribes on Stripe
  ↓
Stripe webhook → /api/stripe/webhook
  ↓
Database updated:
  - subscriptionStatus: 'active'
  - tier: 'pro' or 'team'
  - role: 'pro' or 'team'
  - stripeCustomerId: (from Stripe)
  ↓
User gets Pro/Team features
```

### Manual Role Changes (Emergency)

If you need to manually grant someone access:

```sql
-- Connect to your Neon database
-- Update user role
UPDATE "User" 
SET role = 'pro', tier = 'pro'
WHERE email = 'user@example.com';
```

⚠️ **Note**: This won't work for admin emails - use `ADMIN_EMAILS` instead.

---

## 🚀 Production Deployment

### Vercel Environment Variables

Set these in your Vercel project:

```bash
# Database
DATABASE_URL="postgresql://..." # Your Neon connection string

# Auth
NEXTAUTH_URL="https://yourdomain.com"
AUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="..." # Same as AUTH_SECRET

# Google OAuth (required)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy signing secret → Set as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Testing Your Setup

### Test 1: Admin Access

```bash
# Sign in with your admin email
# Go to: http://localhost:3000/ops/metrics
# ✅ Should see full dashboard
```

### Test 2: Non-Admin Access

```bash
# Sign in with a different email (not in ADMIN_EMAILS)
# Go to: http://localhost:3000/ops/metrics
# ✅ Should see "Pro Feature" paywall
```

### Test 3: Database Check

```bash
# Open Prisma Studio
cd customvenom-frontend
npx prisma studio

# Open User table
# Find your email
# ✅ role should be "admin"
```

---

## 📊 Monitoring Your System

### Check Current Users

Use Prisma Studio or SQL:

```sql
SELECT 
  email,
  role,
  tier,
  subscriptionStatus,
  createdAt
FROM "User"
ORDER BY createdAt DESC;
```

### Check Active Subscriptions

```sql
SELECT 
  email,
  role,
  subscriptionStatus,
  stripeCustomerId
FROM "User"
WHERE subscriptionStatus = 'active';
```

### Check Analytics Events

```sql
SELECT 
  eventType,
  COUNT(*) as count
FROM "AnalyticsEvent"
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY eventType
ORDER BY count DESC;
```

---

## 🆘 Troubleshooting

### "I'm still seeing the paywall after adding my email"

1. Did you **sign out completely**?
2. Did you **sign back in** with the email you added?
3. Check the file was saved: `cat src/lib/rbac.ts | grep ADMIN_EMAILS`
4. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### "My role in the database shows 'free' but I should be admin"

This is OK! The `ADMIN_EMAILS` override happens at runtime. As long as your email is in the list, you'll have admin access even if the DB says 'free'.

### "I want to add another admin"

Add their email to `ADMIN_EMAILS`:

```typescript
const ADMIN_EMAILS = [
  'you@example.com',
  'cofounder@example.com',  // ← Add here
];
```

They'll get admin access on their next sign-in.

---

## ✅ Checklist

- [ ] Added my email to `ADMIN_EMAILS` in `src/lib/rbac.ts`
- [ ] Saved the file
- [ ] Signed out (if I was signed in)
- [ ] Signed in with my admin email
- [ ] Verified I can access /ops/metrics
- [ ] Checked database shows my role
- [ ] Read SECURITY_AND_ACCESS_CONTROL.md for full details
- [ ] Set up Vercel environment variables (for production)
- [ ] Configured Stripe webhook (for production)

---

## 📚 Next Steps

1. **Read**: `SECURITY_AND_ACCESS_CONTROL.md` for comprehensive security docs
2. **Customize**: Add/remove permissions in `src/lib/rbac.ts`
3. **Protect**: Use auth guards on your routes (see examples in docs)
4. **Monitor**: Set up Sentry or logging for production
5. **Test**: Test subscription flows thoroughly before launch

---

## 💡 Pro Tips

1. **Never commit `.env.local`** - It's in .gitignore
2. **Rotate secrets regularly** - Especially `AUTH_SECRET`
3. **Use Stripe test mode** until ready for production
4. **Test webhook locally** with Stripe CLI
5. **Monitor failed auth attempts** for security
6. **Back up your database** regularly (Neon does this automatically)

---

**You're all set! 🎉**

Your CustomVenom app now has enterprise-grade access control and you'll never get locked out of your own system.

