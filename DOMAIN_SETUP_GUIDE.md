# 🌐 Custom Domain Setup Guide

**Problem:** `customvenom.com` shows "site can't be reached"  
**Solution:** Connect domain to Vercel frontend

---

## 📊 Current Status

| Domain | Status | Destination |
|--------|--------|-------------|
| `customvenom.com` | ❌ Not configured | Parked (76.76.21.21) |
| `api.customvenom.com` | ✅ Working | Cloudflare Workers |
| `customvenom-frontend.vercel.app` | ✅ Working | Vercel default URL |

---

## 🎯 Goal

Connect `customvenom.com` to your Vercel frontend so users can access your app at:
- **Frontend:** `https://customvenom.com`
- **API:** `https://api.customvenom.com` (already working)

---

## 🚀 Step-by-Step Setup

### Option 1: Use Root Domain (Recommended)

**Result:** `customvenom.com` → Frontend

#### Step 1: Add Domain in Vercel

1. Go to your Vercel project:
   ```
   https://vercel.com/incarcers-projects/customvenom-frontend/settings/domains
   ```

2. Click **"Add Domain"**

3. Enter: `customvenom.com`

4. Click **"Add"**

5. Vercel will show you DNS records to configure

#### Step 2: Configure DNS in Cloudflare

**Where:** https://dash.cloudflare.com → Select `customvenom.com` zone → DNS

**Add these records:**

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ | 76.76.2.13 | DNS only (gray cloud) | 300-600 |
| CNAME | www | b9eb6ad1e241f07c.vercel-dns-017.com. | DNS only (gray cloud) | 300-600 |

**Note:** Use the CNAME record provided by Vercel (see table above). Each domain gets a unique CNAME target.

**Important:** 
- Do NOT proxy through Cloudflare (keep cloud gray, not orange)
- Keep existing `api` subdomain as-is (it's working)

#### Step 3: Verify in Vercel

1. Return to Vercel Domains page
2. Wait 30-60 seconds
3. Vercel should show: ✅ Valid Configuration

---

### Option 2: Use App Subdomain

**Result:** `app.customvenom.com` → Frontend

If you want to keep root domain available for marketing/landing page:

#### Add in Vercel:
```
app.customvenom.com
```

#### DNS in Cloudflare:
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | app | cname.vercel-dns.com | DNS only |

---

## 🔒 SSL Certificate

Vercel automatically provisions SSL certificates (Let's Encrypt). Once DNS propagates:
- ✅ `https://customvenom.com` will work with SSL
- ✅ Certificate auto-renews

---

## ⏱️ DNS Propagation

**Time:** 5 minutes to 48 hours (usually 15-30 minutes)

**Check status:**
```bash
# Check DNS
nslookup customvenom.com

# Test HTTPS
https://customvenom.com
```

**Tools to verify:**
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 📋 Final Configuration

After setup, your domains will be:

| Domain | Purpose | Service |
|--------|---------|---------|
| `customvenom.com` | Frontend (Next.js) | Vercel |
| `www.customvenom.com` | Redirects to root | Vercel |
| `api.customvenom.com` | Workers API | Cloudflare |

---

## 🔧 Update Environment Variables

After domain is live, update in Vercel:

**Go to:** https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

**Update:**
```bash
NEXTAUTH_URL=https://customvenom.com
```

**Redeploy** to apply changes.

---

## 🧪 Testing

### 1. Test Frontend
```bash
# Should load your Next.js app
https://customvenom.com
```

### 2. Test API (already working)
```bash
curl https://api.customvenom.com/health
```

### 3. Test OAuth Redirects
Update redirect URIs in:
- Google Console: `https://customvenom.com/api/auth/callback/google`
- Stripe Dashboard: Update webhook URL if needed

---

## ⚠️ Important Notes

### DNS Records to Keep
- ✅ Keep: `api.customvenom.com` (Cloudflare Workers)
- ✅ Keep: Any email records (MX, TXT)
- ✅ Add: Root domain for Vercel

### Cloudflare Proxy
- ❌ Don't proxy Vercel domains (keep gray cloud)
- ✅ Can proxy `api` subdomain (already working)

### Existing Setup
Your Cloudflare Workers will continue working at `api.customvenom.com` - no changes needed!

---

## 🆘 Troubleshooting

### "Domain already in use"
**Solution:** Domain might be added to another Vercel project. Remove it there first.

### "Invalid DNS Configuration"
**Solution:** 
1. Verify DNS records in Cloudflare
2. Wait 5-10 minutes for propagation
3. Check cloud icon is gray (not orange)

### "Too Many Redirects"
**Solution:** 
1. Disable Cloudflare proxy (gray cloud)
2. Clear browser cache
3. Check no redirect rules in Cloudflare Page Rules

### "NET::ERR_CERT_COMMON_NAME_INVALID"
**Solution:** 
1. Wait for Vercel to provision SSL (takes 5-15 minutes)
2. Check domain shows as "Valid" in Vercel
3. Force refresh certificate in Vercel settings

---

## 📸 Screenshot Guide

### Vercel - Add Domain
```
┌─────────────────────────────────────────┐
│  Domains                                 │
├─────────────────────────────────────────┤
│  [customvenom.com          ] [Add]      │
│                                          │
│  customvenom-frontend.vercel.app         │
│  ✅ Production                           │
└─────────────────────────────────────────┘
```

### Cloudflare DNS
```
┌─────────────────────────────────────────────────┐
│ Type │ Name │ Content              │ Proxy     │
├──────┼──────┼─────────────────────┼───────────┤
│ A    │ @    │ 76.76.2.13          │ DNS only  │
│ CNAME│ www  │ cname.vercel-dns.com│ DNS only  │
│ CNAME│ api  │ (existing Workers)   │ Proxied   │
└─────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

Once complete:
- [ ] `https://customvenom.com` loads frontend
- [ ] `https://www.customvenom.com` redirects to root
- [ ] `https://api.customvenom.com/health` returns 200
- [ ] SSL certificate shows valid (green lock)
- [ ] OAuth login works with new domain
- [ ] Vercel shows domain as "Valid Configuration"

---

## 📞 Quick Reference

**Vercel Dashboard:**
https://vercel.com/incarcers-projects/customvenom-frontend

**Cloudflare DNS:**
https://dash.cloudflare.com

**Vercel Docs:**
https://vercel.com/docs/projects/domains/add-a-domain

---

**Last Updated:** October 17, 2025  
**Status:** Waiting for domain configuration

