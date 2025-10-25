# Reasons Adapter - Quick Start

## TL;DR

New production-ready adapter handles API reason data with **Zod validation** + **effect clamping**.

```tsx
import { ReasonChipsAdapter } from '@/components/ReasonChipsAdapter';

// Old way (manual typing)
<ReasonChips reasons={typedArray} />

// New way (raw API data)
<ReasonChipsAdapter reasons={apiData.reasons} />
```

---

## What Changed

### Files Added

```
src/lib/reasons/
  ├── schema.ts               # Zod validation
  ├── adapter.ts              # Conversion logic
  └── adapter.test.ts         # 12 unit tests ✅

src/components/
  └── ReasonChipsAdapter.tsx  # Component wrapper
```

### Dependencies Added

```bash
npm i zod  # Runtime validation
```

---

## API Format Required

Your backend should return:

```json
{
  "reasons": [
    {
      "key": "usage:increase",
      "label": "Usage trending up",
      "effect": 0.021
    }
  ]
}
```

- `key` (required): Identifier like `"usage:increase"` or `"weather:adverse"`
- `label` (optional): Display text. If missing, key is humanized
- `effect` (optional): Number. Can be decimal (0.021) or percent (2.1)

---

## Quick Test

```bash
# 1. Run unit tests
npx vitest run src/lib/reasons/adapter.test.ts

# 2. Start dev server
npm run dev

# 3. Visit projections
# http://localhost:3000/projections

# 4. Check console for validation warnings
# [reasons] invalid payload: ...
```

---

## What It Does

1. **Validates** input with Zod (returns `[]` on bad data)
2. **Converts** fractions to % (0.021 → 2.1%)
3. **Clamps** effects to ±3.5%
4. **Limits** to max 2 chips
5. **Sorts** by absolute impact
6. **Maps** to Badge colors (positive/warning/neutral)

---

## Usage in /projections

**Already integrated!** Just ensure your API returns the right format.

```tsx
// Line 103 & 328 in page.tsx
<ReasonChipsAdapter reasons={decision.reasons} />
<ReasonChipsAdapter reasons={projection.reasons} />
```

---

## If API Still Returns Strings

Add temporary adapter:

```typescript
// In page.tsx
function legacyAdapter(reasons: any) {
  if (!reasons || typeof reasons[0] !== 'string') return reasons;
  return reasons.map((r: string) => ({
    key: r.toLowerCase().replace(/\s+/g, '_'),
    label: r,
    effect: 0,
  }));
}

// Use it:
<ReasonChipsAdapter reasons={legacyAdapter(apiData.reasons)} />
```

---

## Acceptance

✅ All tests pass (12/12)  
✅ No linter errors  
✅ Zod catches bad data  
✅ Effects clamped to ±3.5%  
✅ Max 2 chips shown

---

## Next Steps

1. Test at `/projections`
2. Update API format (if needed)
3. Add labels to `LABEL_MAP` in `adapter.ts`
4. Deploy!

See `REASONS_ADAPTER.md` for full docs.
