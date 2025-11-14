# @customvenom/shared-types

**Frontend Type Definitions**

This package provides TypeScript types for the frontend application.

## Architecture Law #1: Single Source of Truth for Types

**IMPORTANT:** The authoritative source of truth for API contracts is `@customvenom/contracts` in the `customvenom-workers-api` repository. This package should maintain alignment with those contracts.

### Type Alignment Policy

- **API Response Types:** Must match schemas defined in `@customvenom/contracts`
- **Frontend-Only Types:** Can be defined here (UI state, component props, etc.)
- **When Types Change:** Update both `@customvenom/contracts` (source of truth) and this package

### Current Alignment Status

- ✅ `projections.ts` - Aligned with `contracts/schemas/projections.ts` and `contracts/schemas/common.ts`
- ✅ `enums.ts` - Aligned with `contracts/schemas/common.ts`
- ✅ `api.ts` - Aligned with `contracts/schemas/api.ts`
- ⚠️ Other types (mapping, league, etc.) - Frontend-specific, can remain here

### Migration Path

To fully consolidate types:

1. Ensure all API contract types are defined in `@customvenom/contracts` with Zod schemas
2. This package should re-export or mirror those types
3. Frontend code should import from this package (not directly from contracts, since repos are separate)

## Usage

```typescript
import type { ProjectionContract, EnrichedProjection } from '@customvenom/shared-types';
```
