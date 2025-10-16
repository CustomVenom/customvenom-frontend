# UI Features Documentation

This document describes the four new UI features added to the CustomVenom frontend.

## Features Overview

### 1. Density Toggle (Compact vs Comfortable)

**Location**: Header (top-right, next to ThemeToggle)

**Description**: Allows users to switch between compact and comfortable spacing throughout the app.

**Files**:
- `src/hooks/useDensity.ts` - React hook for density state management
- `src/components/DensityToggle.tsx` - Toggle button component
- `src/app/globals.css` - CSS variables for spacing

**Usage in components**:
The density is controlled via CSS custom properties and applies automatically to tables with `td` and `th` elements.

```css
/* Automatically applied */
:root { --row-py: 0.5rem; --row-px: 0.75rem; }
[data-density='compact'] { --row-py: 0.25rem; --row-px: 0.5rem; }
```

**Persistence**: Uses localStorage, persists between sessions.

---

### 2. Loading Skeletons

**Description**: Animated placeholder components that prevent layout shift during data loading.

**Files**:
- `src/components/ui/Skeleton.tsx` - Base skeleton component
- `src/components/ui/TableSkeleton.tsx` - Table-specific skeleton

**Usage**:

```tsx
import { TableSkeleton } from '@/components/ui/TableSkeleton'

{isLoading ? (
  <TableSkeleton rows={8} cols={4} />
) : (
  <YourTableComponent />
)}
```

**Props**:
- `rows` (default: 8) - Number of skeleton rows
- `cols` (default: 4) - Number of skeleton columns
- `className` (optional) - Additional CSS classes for Skeleton

---

### 3. Reason Chips with Clamping

**Description**: Displays driver factors (reasons) for projection adjustments with automatic filtering and clamping.

**Files**:
- `src/lib/reasonsClamp.ts` - Utility function for filtering and clamping reasons
- `src/components/ReasonChips.tsx` - Visual component for displaying reasons

**Business Rules**:
- Filters reasons with confidence ≥ 0.65
- Sorts by absolute effect (highest impact first)
- Shows maximum 2 chips
- Clamps total visible effect to ±3.5%

**Usage**:

```tsx
import { ReasonChips } from '@/components/ReasonChips'
import { Reason } from '@/lib/reasonsClamp'

const reasons: Reason[] = [
  { label: 'Usage ↑', effect: 2.1, confidence: 0.78 },
  { label: 'Weather ↓', effect: -1.4, confidence: 0.72 },
]

<ReasonChips reasons={reasons} />
```

**Type Definition**:

```typescript
type Reason = {
  label: string      // Display text
  effect: number     // Signed percent, e.g. +1.2 or -0.8
  confidence: number // 0..1 (filtered at 0.65 threshold)
}
```

---

### 4. Glossary Tooltips

**Description**: Provides accessible tooltip definitions for domain-specific terms.

**Files**:
- `src/lib/glossary.ts` - Centralized term definitions
- `src/components/ui/GlossaryTip.tsx` - Tooltip wrapper component

**Available Terms**:
- Range band
- Coverage
- Driver chip
- Trust snapshot
- Baseline
- Density

**Usage**:

```tsx
import { GlossaryTip } from '@/components/ui/GlossaryTip'

<p>
  The <GlossaryTip term="Baseline" /> projection shows the median outcome.
</p>

// Custom children text
<GlossaryTip term="Range band">prediction range</GlossaryTip>
```

**Accessibility**: 
- Keyboard navigable (tabIndex={0})
- Screen reader friendly
- Clear visual affordance (dotted underline + info icon)

---

## Demo Page

**URL**: `/demo`

The demo page showcases all four features in action with:
- Interactive examples for each feature
- Combined example showing features working together
- Live "reload data" button to see skeletons in action
- Acceptance criteria checklist

**To view**: Navigate to `http://localhost:3000/demo` in your browser.

---

## Integration Examples

### Example 1: Projections Table with All Features

```tsx
'use client'
import { useState } from 'react'
import { Table } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { ReasonChips } from '@/components/ReasonChips'
import { GlossaryTip } from '@/components/ui/GlossaryTip'

export function ProjectionsTable({ data, isLoading }) {
  if (isLoading) {
    return <TableSkeleton rows={10} cols={5} />
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Player</th>
          <th><GlossaryTip term="Baseline">Baseline</GlossaryTip></th>
          <th><GlossaryTip term="Range band">Range</GlossaryTip></th>
          <th>Drivers</th>
        </tr>
      </thead>
      <tbody>
        {data.map(player => (
          <tr key={player.id}>
            <td>{player.name}</td>
            <td>{player.baseline}</td>
            <td>{player.floor}–{player.ceiling}</td>
            <td><ReasonChips reasons={player.reasons} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
```

---

## Acceptance Criteria ✓

- [x] Density toggle switches padding globally and persists between sessions
- [x] Skeletons appear before data and prevent layout jumps
- [x] Reason chips never exceed 2 visible items and total effect stays within ±3.5%
- [x] Tooltip definitions render on hover/focus and are accessible with screen readers

---

## Adding New Glossary Terms

To add a new term:

1. Open `src/lib/glossary.ts`
2. Add your term to the `GLOSSARY` object:

```typescript
export const GLOSSARY: Record<string, string> = {
  // ... existing terms
  'Your New Term': 'Definition of your new term.',
}
```

3. Use it anywhere:

```tsx
<GlossaryTip term="Your New Term" />
```

---

## Customization

### Adjusting Reason Chip Limits

Edit `src/lib/reasonsClamp.ts`:

```typescript
export function clampReasons(
  reasons: Reason[],
  { 
    maxChips = 3,        // Change from 2 to 3
    maxAbsTotal = 5.0    // Change from 3.5 to 5.0
  }: { maxChips?: number; maxAbsTotal?: number } = {}
) {
  // ...
}
```

### Changing Density Spacing

Edit `src/app/globals.css`:

```css
:root { 
  --row-py: 0.75rem;  /* Increase comfortable spacing */
  --row-px: 1rem; 
}
[data-density='compact'] { 
  --row-py: 0.125rem; /* Decrease compact spacing */
  --row-px: 0.25rem; 
}
```

---

## Testing

Run the development server and navigate to `/demo`:

```bash
npm run dev
```

Then open: http://localhost:3000/demo

Test each feature:
1. Click density toggle and observe table padding changes
2. Click "Reload Data" to see skeleton animations
3. Verify reason chips show max 2 items with proper badges
4. Hover over glossary terms to see tooltips

