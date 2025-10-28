# Authentication & Pro Paywalls Implementation

## Overview

Complete authentication system with social login (Google, X/Twitter, Facebook) and Stripe-powered Pro subscription paywalls.

## Architecture

### Authentication Flow

```
User clicks "Sign in with Google"
  → NextAuth.js handles OAuth flow
  → User record created/updated in database
  → Session created with user role
  → Redirect to /settings
```

### Payment Flow

```
User clicks "Upgrade to Pro"
  → /go-pro page
  → Stripe Checkout session created
  → User completes payment
  → Stripe webhook fired
  → User role updated to 'pro'
  → Redirect to /settings
```

## Files Structure

### Core Configuration

- `prisma/schema.prisma` - Database schema (User, Account, Session, VerificationToken)
- `src/lib/db.ts` - Prisma client singleton
- `src/lib/auth.ts` - NextAuth.js configuration
- `src/lib/auth-helpers.ts` - Server-side auth helpers

### API Routes

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js handler
- `src/app/api/stripe/checkout/route.ts` - Create Stripe checkout session
- `src/app/api/stripe/webhook/route.ts` - Handle Stripe webhooks
- `src/app/api/stripe/portal/route.ts` - Customer portal access

### Middleware

- `src/middleware.ts` - Route protection (Pro-only routes)

### UI Components

- `src/components/AuthButtons.tsx` - Sign in/out buttons
- `src/components/ProLock.tsx` - Blur + unlock CTA for free users

### Pages

- `src/app/settings/page.tsx` - Account settings, role display, manage billing
- `src/app/go-pro/page.tsx` - Upgrade page with Stripe checkout

### Type Definitions

- `src/types/next-auth.d.ts` - Extended NextAuth types

## Database Schema

### User Model

```prisma
model User {
  id               String    @id @default(cuid())
  name             String?
  email            String?   @unique
  emailVerified    DateTime?
  image            String?
  role             String    @default("free") // free | pro
  stripeCustomerId String?   @unique

  accounts         Account[]
  sessions         Session[]

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## Environment Variables

### Required for Development

#### NextAuth

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

#### OAuth Providers

```env
# Google
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Twitter (X)
TWITTER_CLIENT_ID=<from Twitter Developer Portal>
TWITTER_CLIENT_SECRET=<from Twitter Developer Portal>

# Facebook
FACEBOOK_CLIENT_ID=<from Facebook Developer Portal>
FACEBOOK_CLIENT_SECRET=<from Facebook Developer Portal>
```

#### Database

```env
DATABASE_URL=postgresql://username:password@localhost:5432/customvenom
```

#### Stripe

```env
# Server-side
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Redirect URLs
STRIPE_SUCCESS_URL=http://localhost:3000/settings
STRIPE_CANCEL_URL=http://localhost:3000/go-pro
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install next-auth@beta @prisma/client prisma stripe @auth/prisma-adapter
```

### 2. Configure Database

```bash
# Initialize Prisma
npx prisma init

# Create database tables
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Configure OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

#### Twitter (X) OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Add callback URL: `http://localhost:3000/api/auth/callback/twitter`
5. Copy Client ID and Secret to `.env.local`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and Secret to `.env.local`

### 4. Configure Stripe

#### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys (test mode)
3. Create a subscription product and price
4. Copy Price ID to `NEXT_PUBLIC_STRIPE_PRICE_ID`

#### Configure Webhook

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Forward webhooks to local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run Development Server

```bash
npm run dev
```

## Usage

### Protecting Routes (Middleware)

```typescript
// Add to PRO_ROUTES array in middleware.ts
const PRO_ROUTES = [
  '/pro',
  '/advanced-analytics',
  // Add more Pro-only routes
];
```

### Require Authentication (Server Components)

```typescript
import { requireAuth, requirePro } from '@/lib/auth-helpers';

// Require any authenticated user
const session = await requireAuth();

// Require Pro subscription
const session = await requirePro();
```

### Conditional Rendering

```typescript
import { isPro, isAuthenticated } from '@/lib/auth-helpers';

const userIsPro = await isPro();
const userIsAuthenticated = await isAuthenticated();
```

### Using ProLock Component

```tsx
import { ProLock } from '@/components/ProLock';
import { isPro } from '@/lib/auth-helpers';

export default async function Page() {
  const userIsPro = await isPro();

  return (
    <ProLock isPro={userIsPro} message="Unlock advanced analytics">
      <AdvancedContent />
    </ProLock>
  );
}
```

## Stripe Webhooks

### Events Handled

- `checkout.session.completed` - Upgrade user to Pro, store customer ID
- `customer.subscription.created` - Ensure Pro status
- `customer.subscription.updated` - Update Pro status
- `customer.subscription.deleted` - Downgrade to free

### Testing Webhooks Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger test events
stripe trigger checkout.session.completed
```

## User Roles

### Free (Default)

- Basic features
- Limited access
- Can view public content

### Pro

- All features unlocked
- Advanced analytics
- FAAB bid guidance
- Waiver wire rankings
- Priority support

## Security Considerations

### Session Security

- Sessions stored in database
- Session tokens hashed
- Automatic session expiration

### API Route Protection

- All sensitive API routes require authentication
- Stripe customer portal requires Pro role
- Webhook signature verification

### Environment Variables

- Never commit `.env.local`
- Use strong secrets
- Rotate keys regularly

## Deployment (Vercel)

### Environment Variables

Set all environment variables in Vercel dashboard:

- NEXTAUTH_URL → `https://your-domain.com`
- All OAuth credentials
- Stripe keys (use production keys)
- DATABASE_URL (use production database)

### Database

- Use managed PostgreSQL (e.g., Supabase, Neon, Railway)
- Run migrations: `npx prisma db push`
- Generate client: `npx prisma generate`

### Stripe Webhook

1. Create production webhook in Stripe Dashboard
2. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Select events: checkout.session.completed, customer.subscription.\*
4. Copy webhook secret to Vercel

## Troubleshooting

### "Adapter is not assignable to type"

- Ensure `@auth/prisma-adapter` is installed
- Cast adapter: `PrismaAdapter(prisma) as any`

### OAuth Redirect URI Mismatch

- Verify callback URLs in provider settings
- Format: `{NEXTAUTH_URL}/api/auth/callback/{provider}`

### Webhook Signature Failed

- Check `STRIPE_WEBHOOK_SECRET` matches webhook secret
- Verify raw body is passed to `constructEvent`

### Session Not Persisting

- Check `DATABASE_URL` is correct
- Verify session table exists: `npx prisma studio`
- Check `NEXTAUTH_SECRET` is set

## Testing Checklist

### Authentication

- [ ] Google sign-in works
- [ ] Twitter sign-in works
- [ ] Facebook sign-in works
- [ ] User created in database
- [ ] Session created
- [ ] Redirect to /settings
- [ ] Sign out works

### Settings Page

- [ ] Displays user email
- [ ] Shows role badge (Free/Pro)
- [ ] "Upgrade to Pro" button visible (free users)
- [ ] "Manage Billing" button visible (Pro users)
- [ ] Sign out button works

### Pro Upgrade Flow

- [ ] /go-pro page loads
- [ ] Features displayed
- [ ] "Start Checkout" creates session
- [ ] Redirects to Stripe Checkout
- [ ] Test payment succeeds
- [ ] Webhook fires
- [ ] User role updated to 'pro'
- [ ] Redirects to /settings
- [ ] "Manage Billing" button appears

### Route Protection

- [ ] /pro route redirects free users to /go-pro
- [ ] /pro route accessible for Pro users
- [ ] Unauthenticated users redirect to home

### ProLock Component

- [ ] Blurs content for free users
- [ ] Shows unlock CTA
- [ ] "Upgrade to Pro" button redirects to /go-pro
- [ ] Shows content for Pro users

## Next Steps

### Additional Features

- Email verification
- Password reset
- Account deletion
- Usage analytics
- Referral system
- Team/group accounts

### Enhanced Pro Features

- Multiple subscription tiers
- Annual billing discount
- Trial period
- Promo codes
- Usage limits

## Support

For issues or questions:

1. Check environment variables
2. Review Prisma schema
3. Verify OAuth provider settings
4. Test Stripe webhooks locally
5. Check server logs

---

**Status**: ✅ Implementation Complete
**Last Updated**: October 16, 2025
