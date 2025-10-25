# Synthetics Monitoring Setup

## ✅ Quick Setup - UptimeRobot (Free)

### Step 1: Create Account

1. Go to https://uptimerobot.com
2. Sign up (free tier: 50 monitors, 5-min intervals)
3. Upgrade to Pro for 1-min intervals ($7/month)

### Step 2: Create Health Monitor

**Dashboard → Add New Monitor**

```
Monitor Type: HTTP(s)
Friendly Name: CustomVenom API - Health
URL: https://customvenom-workers-api.jdewett81.workers.dev/health
Monitoring Interval: Every 1 minute (Pro) or 5 minutes (Free)
Monitor Timeout: 30 seconds
HTTP Method: GET (HEAD)

Advanced Settings:
✅ Keyword Monitoring: Enabled
   - Keyword: "ok":true
   - Alert if keyword exists: NO
   - Alert if keyword not exists: YES

Alert Contacts: [Your Email]
```

### Step 3: Create Projections Monitor

```
Monitor Type: HTTP(s)
Friendly Name: CustomVenom API - Projections
URL: https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET (HEAD)

Advanced Settings:
✅ Keyword Monitoring: Enabled
   - Keyword: schema_version
   - Alert if keyword exists: NO
   - Alert if keyword not exists: YES

Alert Contacts: [Your Email]
```

### Step 4: Alert Rules

**Dashboard → Settings → Alert Contacts**

```
Email: [Your on-call email]
Notification Settings:
✅ When down (after 3 consecutive failures)
✅ When back up
✅ SSL certificate expires (14 days before)

Optional: Add Slack webhook for instant alerts
```

### Success Criteria

- ✅ Status code 200
- ✅ Response contains expected keywords
- ✅ Response time < 300ms (p95)
- ✅ Uptime target: 99.9%

---

## 🚀 Alternative: Better Stack (More Features)

### Step 1: Create Account

1. Go to https://betterstack.com/uptime
2. Sign up (free tier: 10 monitors, 3-min intervals)

### Step 2: Create Monitors

**Dashboard → Create Monitor**

#### Health Monitor

```
URL: https://customvenom-workers-api.jdewett81.workers.dev/health
Name: API Health Check
Interval: 60 seconds
Timeout: 30 seconds
Method: GET

Assertions:
✅ Status code is 200
✅ Response body contains: "ok":true
✅ Response time < 300ms

Regions: Multiple (auto)
```

#### Projections Monitor

```
URL: https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06
Name: API Projections
Interval: 300 seconds (5 minutes)
Timeout: 30 seconds
Method: GET

Assertions:
✅ Status code is 200
✅ Response body contains: "schema_version"
✅ Response time < 500ms

Regions: Multiple (auto)
```

### Step 3: Incident Policies

**Settings → Incident Policies → Create Policy**

```
Name: API Critical
Trigger: After 3 consecutive failures
Escalation:
  - 0 min: Email to [your-email]
  - 5 min: Slack (optional)
  - 15 min: PagerDuty (optional, paid)

Recovery notification: Yes
```

### Step 4: Performance Alerts

**Dashboard → Alerts → Create Alert**

```
Name: API Slow Response
Condition: p95 response time > 300ms for 5 minutes
Action: Send email notification
```

---

## 📊 Monitoring Dashboard

### Key Metrics to Track

**Uptime**

- Target: 99.9% (43 minutes downtime/month)
- Current: [Will show after setup]

**Response Time**

- Health endpoint p95: < 300ms
- Projections endpoint p95: < 500ms

**Error Rate**

- Target: < 0.1%
- Alert on: > 0.5% for 5 minutes

**Incident Response**

- Time to detect: < 3 minutes
- Time to acknowledge: < 15 minutes
- Time to resolve: < 1 hour (non-critical)

---

## 🔔 Alert Configuration

### Email Alerts (Minimum)

```
To: jdewett81@gmail.com
When:
  - 3 consecutive failures
  - Response time > 300ms for 5 minutes
  - SSL cert expiring soon
Format: [Status] [Service] - [Details]
Example: [DOWN] API Health - Connection timeout after 30s
```

### Slack Alerts (Optional)

```
Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Channel: #alerts or #ops
Format:
  🔴 DOWN: API Health Check
  ⏱️ Response time: 2500ms (threshold: 300ms)
  📍 Region: us-east-1
  🔗 Incident: [link]
```

---

## ✅ Setup Checklist

### UptimeRobot Setup

- [ ] Account created
- [ ] Health monitor configured (1-min interval)
- [ ] Projections monitor configured (5-min interval)
- [ ] Keyword assertions added
- [ ] Email alerts configured
- [ ] Test both monitors (they should be "up")

### Better Stack Setup

- [ ] Account created
- [ ] Health monitor with assertions
- [ ] Projections monitor with assertions
- [ ] Incident policy created
- [ ] Performance alerts configured
- [ ] Slack webhook added (optional)

### Validation

- [ ] Monitors show "UP" status
- [ ] Response times < thresholds
- [ ] Test alert (pause a monitor temporarily)
- [ ] Receive email notification
- [ ] Monitor recovers after unpause

---

## 🧪 Test Your Monitors

### Simulate Downtime

```bash
# Temporarily break the health endpoint (do this on staging first!)
# Option 1: Deploy broken code
# Option 2: Pause the Worker in Cloudflare Dashboard
# Option 3: Set a firewall rule blocking your monitor IPs

# Wait for alerts (should receive within 3-5 minutes)
# Restore service
# Verify recovery notification
```

### Simulate Slow Response

```bash
# Add artificial delay to API route
# Wait for performance alert
# Remove delay
# Verify alert clears
```

---

## 📈 Week 1 Baseline

Track these metrics for the first week:

**Uptime**

- Day 1-7 uptime: \_\_\_\_%
- Total incidents: \_\_\_
- Mean time to recovery: \_\_\_ minutes

**Performance**

- Health p50: \_\_\_ ms
- Health p95: \_\_\_ ms
- Projections p50: \_\_\_ ms
- Projections p95: \_\_\_ ms

**Error Rate**

- 4xx errors: \_\_\_\_%
- 5xx errors: \_\_\_\_%
- Timeout errors: \_\_\_

---

## 🎯 Target SLOs (Service Level Objectives)

### Availability

- **Target:** 99.9% uptime
- **Budget:** 43 minutes downtime/month
- **Action:** If SLO breached, post-mortem required

### Latency

- **Health endpoint:**
  - p50 < 100ms
  - p95 < 300ms
  - p99 < 500ms
- **Projections endpoint:**
  - p50 < 200ms
  - p95 < 500ms
  - p99 < 1000ms

### Error Rate

- **Target:** < 0.1% of requests
- **Action:** Alert on > 0.5% for 5 minutes

---

## 🔗 Quick Links

**UptimeRobot:**

- Dashboard: https://uptimerobot.com/dashboard
- Pricing: https://uptimerobot.com/pricing
- API Docs: https://uptimerobot.com/api

**Better Stack:**

- Dashboard: https://betterstack.com/uptime
- Docs: https://betterstack.com/docs/uptime
- Pricing: https://betterstack.com/pricing

**Alternative Options:**

- Pingdom: https://www.pingdom.com
- StatusCake: https://www.statuscake.com
- Checkly: https://www.checklyhq.com (best for API monitoring)

---

## 📝 Next Steps

After setup:

1. ✅ Confirm monitors are "UP"
2. ✅ Add dashboard link to team wiki
3. ✅ Document escalation process
4. ✅ Set up weekly uptime report
5. ✅ Review and adjust alert thresholds after 1 week

**Estimated Setup Time:** 15-20 minutes
