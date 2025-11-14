# Projection Utilities

**Architecture Law #3: API is Contract, UI is Presentation**

This document describes the centralized projection utility functions that eliminate duplicate enhancement checking logic.

## Overview

The `projection-utils.ts` module provides centralized functions for working with projection data. Use these functions everywhere instead of duplicating logic.

## Functions

### `isEnhanced(projection)`

Determines if a projection has real enhancement data (not fallback or unavailable).

**Parameters**:

- `projection: ProjectionWithEnhancement` - The projection object to check

**Returns**: `boolean` - `true` if the projection has real enhancement data

**Example**:

```typescript
import { isEnhanced } from '@/lib/projection-utils';

if (isEnhanced(projection)) {
  // Show enhanced Strike Range
  return <ProjectionRibbon floor={projection.enhanced_floor} ceiling={projection.enhanced_ceiling} />;
} else {
  // Show baseline only with warning
  return <BaselineWarning />;
}
```

### `getFloor(projection, fallback?)`

Gets the floor value for a projection, preferring enhanced if available.

**Parameters**:

- `projection: ProjectionWithEnhancement & { floor?: number }` - The projection object
- `fallback?: number` - Fallback value if neither enhanced nor baseline floor is available (default: 0)

**Returns**: `number` - The floor value to use

**Example**:

```typescript
import { getFloor } from '@/lib/projection-utils';

const floor = getFloor(projection, 0);
```

### `getCeiling(projection, fallback?)`

Gets the ceiling value for a projection, preferring enhanced if available.

**Parameters**:

- `projection: ProjectionWithEnhancement & { ceiling?: number }` - The projection object
- `fallback?: number` - Fallback value if neither enhanced nor baseline ceiling is available (default: 0)

**Returns**: `number` - The ceiling value to use

**Example**:

```typescript
import { getCeiling } from '@/lib/projection-utils';

const ceiling = getCeiling(projection, 0);
```

## Enhancement Check Logic

A projection is considered "enhanced" if:

1. `enhanced_floor` is defined and not null
2. `enhancement_method` is not `'fallback'` or `'unavailable'`

This logic is centralized in `isEnhanced()` to prevent inconsistencies.

## Migration Guide

### Before (Duplicate Logic)

```typescript
// ❌ DON'T DO THIS - Duplicate logic
const hasEnhancement =
  projection.enhanced_floor !== undefined &&
  projection.enhanced_floor !== null &&
  projection.enhancement_method !== 'fallback' &&
  projection.enhancement_method !== 'unavailable';
```

### After (Centralized)

```typescript
// ✅ DO THIS - Use centralized function
import { isEnhanced } from '@/lib/projection-utils';

if (isEnhanced(projection)) {
  // Use enhanced data
}
```

## Files to Update

When migrating existing code, update these files to use `isEnhanced()`:

- `src/hooks/use-enhanced-projections.ts`
- `src/components/ProjectionsTable.tsx`
- `src/components/ProjectionRibbon.tsx`
- Any other components checking enhancement status

## References

- **Implementation**: `src/lib/projection-utils.ts`
- **Architecture Law**: `docs/ARCHITECTURE.md` (Law #3)
