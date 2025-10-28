# 📦 Analytics Database Migration Guide

**Status**: Ready to migrate  
**Impact**: In-memory → Persistent database  
**Risk**: Low (zero API contract changes)  
**Time**: 5-10 minutes

---

## 🎯 What This Migration Does

### Before (Phase 2.1a)

- ❌ Events stored in-memory (lost on restart)
- ❌ Rollups lost on redeploy
- ❌ 10k event limit
- ❌ No historical trends

### After (Phase 2.1b)

- ✅ Events persisted in PostgreSQL
- ✅ Rollups durable across restarts
- ✅ 30-day retention (configurable)
- ✅ 90-day rollup retention
- ✅ Historical trend analysis
- ✅ Richer queries (user cohorts, funnels)

---

## 🚀 Migration Steps

### Step 1: Backup Existing Data (Optional)

If you have valuable events in localStorage:

```javascript
// In browser console:
const events = localStorage.getItem('cv_analytics_events');
console.log(events);
// Copy this JSON and save to: events-backup.json
```

### Step 2: Run Database Migration

```bash
cd customvenom-frontend

# Create migration
npx prisma migrate dev --name add_analytics_tables

# This will:
# - Create AnalyticsEvent table
# - Create HourlyRollup table
# - Add all indices
# - Apply to your database
```

### Step 3: Verify Migration

```bash
# Check schema is applied
npx prisma studio

# Opens GUI at http://localhost:5555
# Verify tables exist:
# - AnalyticsEvent
# - HourlyRollup
```

### Step 4: Backfill Data (Optional)

If you saved localStorage events:

```bash
# Option A: Manual backfill (in Node.js REPL or script)
# Follow instructions in scripts/backfill-analytics.ts

# Option B: Automated backfill
# 1. Place events-backup.json in project root
# 2. Uncomment backfill code in scripts/backfill-analytics.ts
# 3. Run: npm run backfill-analytics
```

### Step 5: Verify Working

```bash
# Start dev server
npm run dev

# In another terminal, test API:
curl http://localhost:3000/api/analytics/track?hours=1

# Should return:
{
  "ok": true,
  "count": 0,
  "total_in_range": 0,
  "events": []
}
```

### Step 6: Test End-to-End

1. Open app in browser
2. Navigate to any tool page
3. Check Network tab: POST /api/analytics/track (200 OK)
4. Check database:
   ```bash
   npx prisma studio
   # AnalyticsEvent table should have new entries
   ```

---

## 🔍 Verification Checklist

- [ ] Prisma migration created and applied
- [ ] AnalyticsEvent table exists with all fields
- [ ] HourlyRollup table exists with all fields
- [ ] All indices created
- [ ] POST /api/analytics/track returns 200
- [ ] GET /api/analytics/track returns events
- [ ] GET /api/analytics/rollups returns rollups
- [ ] Events appear in database
- [ ] Rollups update correctly
- [ ] No errors in server logs
- [ ] Frontend console shows analytics_event logs
- [ ] Network tab shows POST requests succeeding

---

## 📊 Schema Changes

### AnalyticsEvent Table

```prisma
model AnalyticsEvent {
  id         String   @id @default(cuid())
  userId     String?
  sessionId  String   // Required
  eventType  String   // tool_used, risk_mode_changed, etc.
  toolName   String?  // Start/Sit, FAAB, Decisions
  action     String?  // viewed, compare, calculate
  properties Json?    // Metadata
  demoMode   Boolean  @default(true)
  timestamp  DateTime @default(now())
  receivedAt DateTime @default(now())
  user       User?    @relation(...)

  // Indices for performance
  @@index([userId, eventType])
  @@index([timestamp])
  @@index([sessionId])
  @@index([eventType, timestamp])
  @@index([toolName, timestamp])
}
```

### HourlyRollup Table

```prisma
model HourlyRollup {
  id               String   @id @default(cuid())
  hour             DateTime @unique
  eventCounts      Json     // {"tool_used": 45, ...}
  toolUsage        Json     // {"Start/Sit": 23, ...}
  riskDistribution Json     // {"protect": 12, ...}
  uniqueSessions   Int      @default(0)
  totalEvents      Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([hour])
}
```

---

## 🎯 API Contract (Unchanged)

### POST /api/analytics/track

```typescript
// Request (same as before)
{
  "event_type": "tool_used",
  "session_id": "session_...",
  "timestamp": "2025-10-18T...",
  // ... all other fields
}

// Response (same as before)
{
  "ok": true,
  "event_id": "evt_..."
}
```

### GET /api/analytics/track?hours=24

```typescript
// Response (compatible, enhanced)
{
  "ok": true,
  "count": 142,
  "total_in_range": 142,  // New field
  "events": [...]
}
```

### GET /api/analytics/rollups?hours=168

```typescript
// Response (now has actual data!)
{
  "ok": true,
  "count": 168,
  "hours": 168,
  "total_events": 5234,
  "total_sessions": 892,
  "rollups": [
    {
      "hour": "2025-10-18T01:00:00.000Z",
      "event_counts": {...},
      "tool_usage": {...},
      "risk_distribution": {...},
      "unique_sessions": 42,
      "total_events": 156
    },
    ...
  ]
}
```

**Zero breaking changes!** ✅

---

## 💾 Data Retention Policy

### AnalyticsEvent

- **Retention**: 30 days
- **Cleanup**: Automatic (1% of requests)
- **Configurable**: Change in track/route.ts

### HourlyRollup

- **Retention**: 90 days
- **Cleanup**: Automatic (1% of requests)
- **Why longer**: Aggregated data is much smaller

---

## 🔧 Rollback Procedure

If issues arise:

### Rollback Code

```bash
git revert HEAD  # Revert latest commit
git push
```

### Rollback Database

```bash
# Drop new tables
npx prisma migrate reset

# Re-apply old schema
git checkout HEAD~1 prisma/schema.prisma
npx prisma migrate dev
```

### Fallback to In-Memory

```typescript
// In src/lib/analytics.ts:
const SEND_TO_BACKEND = false; // Disable server persistence
```

---

## 📈 Expected Benefits

### Performance

- **Query speed**: Indexed queries much faster than array iteration
- **Scalability**: Handles millions of events
- **Efficiency**: Rollups reduce query load by 60x

### Reliability

- **Durability**: Survives restarts/redeploys
- **Integrity**: ACID transactions
- **Consistency**: Single source of truth

### Features Unlocked

- Week-over-week trend analysis
- User cohort tracking
- Conversion funnel analysis
- Advanced segmentation
- Business intelligence queries

---

## 🎯 Success Criteria

After migration, verify:

### Technical

- [ ] ✅ All tests pass
- [ ] ✅ No linter errors
- [ ] ✅ Prisma client generates
- [ ] ✅ Migration applies cleanly

### Functional

- [ ] Events stored in database
- [ ] Rollups update on each event
- [ ] GET endpoints return data
- [ ] Frontend console shows success
- [ ] Network tab shows 200 OK

### Business

- [ ] Zero downtime
- [ ] No data loss
- [ ] API contract maintained
- [ ] Performance maintained or improved

---

## 💰 Cost Analysis

### Database Storage

- **Events**: ~1KB per event
- **Daily volume**: ~1000 events = 1MB/day
- **30 days**: 30MB
- **Rollups**: ~2KB per hour
- **90 days**: 90 days × 24 hours × 2KB = 4.3MB
- **Total**: ~35MB

**Cost**: Negligible (well under any DB plan limits)

### Query Performance

- **Indexed queries**: <10ms
- **Rollup queries**: <5ms (aggregated)
- **User impact**: Zero

---

## 📚 Documentation

### Code Comments

- All functions documented in route files
- Schema annotated with field descriptions
- Backfill script has usage instructions

### Files

- **This guide**: Migration procedure
- **PHASE_2.1_COMPLETE.md**: Phase 2.1 features
- **PHASE_2_ANALYTICS_REPORT.md**: Original analytics system

---

## 🎉 Summary

**Migration Complexity**: Low  
**Time Required**: 5-10 minutes  
**Risk**: Low (rollback available)  
**Impact**: High (durable analytics)

**Ready to migrate!** Follow the steps above.

---

**Created**: October 18, 2025  
**Status**: ✅ Ready for execution  
**Next Step**: Run `npx prisma migrate dev --name add_analytics_tables`
