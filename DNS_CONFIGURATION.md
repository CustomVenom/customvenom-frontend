# 🌐 DNS Configuration for customvenom.com

**Date:** October 17, 2025  
**Status:** Ready to configure

---

## 📋 Your Specific DNS Records

These are the **exact DNS records** provided by Vercel for your domain:

### For Cloudflare DNS

**Go to:** https://dash.cloudflare.com → Select `customvenom.com` zone → DNS

**Add/Update these records:**

| Type      | Name    | Target/Value                             | Proxy Status        | TTL     | Notes                |
| --------- | ------- | ---------------------------------------- | ------------------- | ------- | -------------------- |
| **CNAME** | **www** | **b9eb6ad1e241f07c.vercel-dns-017.com.** | 🔘 DNS only (gray)  | 300-600 | Root domain → Vercel |
| A         | @       | 76.76.2.13                               | 🔘 DNS only (gray)  | 300-600 | Vercel IP (optional) |
| CNAME     | api     | (existing)                               | 🟠 Proxied (orange) | Auto    | Keep as-is           |

---

## ⚠️ Critical Settings

### 1. Proxy Status - MUST BE DNS ONLY (Gray Cloud)

For Vercel domains:

- ✅ **Gray cloud** (DNS only) - CORRECT
- ❌ **Orange cloud** (Proxied) - WILL NOT WORK

**Why:** Vercel needs direct control for SSL certificate provisioning.

### 2. CNAME Target - Must Include Trailing Dot

```
✅ Correct: b9eb6ad1e241f07c.vercel-dns-017.com.
❌ Wrong:   b9eb6ad1e241f07c.vercel-dns-017.com
```

The trailing dot `.` is important! Some DNS providers add it automatically, but verify.

### 3. Keep API Subdomain

Your existing `api.customvenom.com` is for Cloudflare Workers. **Keep it as-is:**

- Keep proxied (orange cloud) ✅
- Don't change any settings ✅

---

## 🚀 Step-by-Step Configuration

### Step 1: Go to Cloudflare DNS

1. Visit: https://dash.cloudflare.com
2. Click on your domain: `customvenom.com`
3. Go to **DNS** → **Records**

### Step 2: Add www CNAME Record

Click **"Add record"**:

```
Type:    CNAME
Name:    www
Target:  b9eb6ad1e241f07c.vercel-dns-017.com.
Proxy:   🔘 DNS only (click cloud to make it GRAY)
TTL:     Auto (or set to 300)
```

Click **"Save"**

### Step 3: Add Root Domain (Optional)

If you want `customvenom.com` (without www) to work:

Click **"Add record"**:

```
Type:    A
Name:    @
IPv4:    76.76.2.13
Proxy:   🔘 DNS only (GRAY)
TTL:     Auto (or set to 300)
```

Click **"Save"**

### Step 4: Verify Settings

Your DNS records should look like this:

```
┌──────────────────────────────────────────────────────────────┐
│ Type  │ Name │ Content                                │ Proxy│
├────────┼──────┼────────────────────────────────────────┼──────┤
│ CNAME │ www  │ b9eb6ad1e241f07c.vercel-dns-017.com.  │ 🔘   │
│ A     │ @    │ 76.76.2.13                             │ 🔘   │
│ CNAME │ api  │ (existing Workers config)              │ 🟠   │
└──────────────────────────────────────────────────────────────┘

Legend:
🔘 = DNS only (gray cloud) - For Vercel
🟠 = Proxied (orange cloud) - For Cloudflare Workers
```

---

## ⏱️ DNS Propagation

**Time to take effect:** 5 minutes to 48 hours (usually 15-30 minutes)

**Check propagation:**

- https://dnschecker.org/#CNAME/www.customvenom.com
- https://www.whatsmydns.net/#CNAME/www.customvenom.com

---

## ✅ Verification Steps

### 1. Check DNS Resolution

Wait 5-10 minutes after adding records, then test:

```powershell
# Check www CNAME
nslookup www.customvenom.com

# Expected output:
# www.customvenom.com
#   canonical name = b9eb6ad1e241f07c.vercel-dns-017.com
```

### 2. Check in Vercel

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/domains

You should see:

```
✅ www.customvenom.com - Valid Configuration
```

### 3. Test HTTPS

Once Vercel shows "Valid":

```powershell
# Test www subdomain
Invoke-WebRequest -Uri "https://www.customvenom.com" -Method Head

# Expected: 200 OK with Vercel headers
```

---

## 🔐 SSL Certificate

**Automatic:** Vercel provisions SSL certificates automatically via Let's Encrypt.

**Timeline:**

- DNS propagation: 5-30 minutes
- SSL provisioning: 5-15 minutes after DNS
- Total time: 10-45 minutes typically

**Check SSL status:**

- Go to Vercel domains page
- Look for green checkmark next to domain
- Test: `https://www.customvenom.com` should have valid SSL

---

## 🔄 What Happens Next

### After DNS is configured:

1. **DNS propagates** (5-30 min)
2. **Vercel detects DNS** → Shows "Valid Configuration"
3. **SSL certificate issued** (5-15 min)
4. **Site accessible** at https://www.customvenom.com
5. **Auto-redirect:** `www.customvenom.com` → `customvenom.com` (or vice versa)

### Update Environment Variables

Once domain is live, update in Vercel:

**Go to:** https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

**Update Production:**

```bash
NEXTAUTH_URL=https://www.customvenom.com
```

**Then redeploy Production.**

---

## 📊 Final Configuration Summary

| Domain                | Purpose         | Points To                           | Status              |
| --------------------- | --------------- | ----------------------------------- | ------------------- |
| `customvenom.com`     | Root (optional) | 76.76.2.13 (Vercel)                 | Configure if wanted |
| `www.customvenom.com` | Frontend        | b9eb6ad1e241f07c.vercel-dns-017.com | ✅ Configure this   |
| `api.customvenom.com` | Workers API     | Cloudflare Workers                  | ✅ Already working  |

---

## 🆘 Troubleshooting

### "Invalid DNS Configuration" in Vercel

**Causes:**

1. Cloudflare proxy is enabled (orange cloud)
2. DNS hasn't propagated yet
3. CNAME target is wrong

**Fix:**

1. Verify cloud is **gray** (not orange)
2. Wait 15-30 minutes for propagation
3. Double-check CNAME: `b9eb6ad1e241f07c.vercel-dns-017.com.`

### "Too Many Redirects"

**Cause:** Cloudflare proxy enabled on Vercel domain

**Fix:**

1. Go to Cloudflare DNS
2. Click orange cloud next to www record
3. Change to gray cloud (DNS only)
4. Wait 5 minutes

### "SSL Certificate Error"

**Cause:** Certificate not yet provisioned

**Fix:**

1. Wait 15 minutes after DNS is valid
2. Check Vercel domains page for SSL status
3. If still failing after 1 hour, remove and re-add domain in Vercel

---

## 📝 Quick Checklist

Before starting:

- [ ] Access to Cloudflare DNS (https://dash.cloudflare.com)
- [ ] Access to Vercel domains (https://vercel.com/incarcers-projects/customvenom-frontend/settings/domains)
- [ ] Domain already added in Vercel

Configuration steps:

- [ ] Add www CNAME record in Cloudflare
- [ ] Set proxy to DNS only (gray cloud)
- [ ] Add root A record (optional)
- [ ] Wait 15-30 minutes for DNS propagation
- [ ] Verify "Valid Configuration" in Vercel
- [ ] Wait for SSL certificate (green checkmark)
- [ ] Test https://www.customvenom.com
- [ ] Update NEXTAUTH_URL in Vercel Production
- [ ] Redeploy Production
- [ ] Update Google OAuth redirect URI

Google OAuth Update:

- [ ] Add `https://www.customvenom.com/api/auth/callback/google` to Google Console

---

## 📚 Additional Resources

- **Vercel Custom Domains:** https://vercel.com/docs/projects/domains/add-a-domain
- **Cloudflare DNS:** https://developers.cloudflare.com/dns/
- **DNS Checker:** https://dnschecker.org
- **SSL Certificate Status:** Check in Vercel domains page

---

**Last Updated:** October 17, 2025  
**Your Unique CNAME:** `b9eb6ad1e241f07c.vercel-dns-017.com.`  
**Status:** Ready to configure DNS  
**Next Action:** Add CNAME record in Cloudflare DNS
