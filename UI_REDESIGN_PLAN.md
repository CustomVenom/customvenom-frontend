# 🎨 UI Redesign Plan - Dark-First Fantasy Football Theme

**Goal**: Modern, dark-first UI inspired by Sleeper, ESPN Fantasy
**Principle**: NO white backgrounds, maximum readability, FF app aesthetics

---

## 🏈 Fantasy Football UI Patterns (Research)

### Sleeper (Best-in-class)

- **Background**: Near-black (#0D0D0D to #1A1A1A)
- **Cards**: Dark gray (#1E1E1E to #2A2A2A)
- **Text**: High contrast white/light gray
- **Accents**: Team colors + neon highlights
- **Data**: Big numbers, small labels, compact
- **Borders**: Minimal, uses shadows instead

### ESPN Fantasy

- **Background**: Charcoal (#1C1C1C)
- **Cards**: Slightly lighter gray (#282828)
- **Accents**: ESPN red + team colors
- **Stats**: Green up, red down (universal)
- **Layout**: Dense tables, sticky filters

### Yahoo Fantasy

- **Background**: Dark navy/gray
- **Cards**: Elevated panels
- **Purple accents** (brand)
- **Player photos** prominent

---

## 🎯 New Color System

### Background Layers

```css
--bg-base: #0a0e1a; /* Deep slate (almost black) */
--bg-elevated: #141827; /* Elevated panels */
--bg-card: #1e293b; /* Cards and containers */
--bg-hover: #2d3748; /* Hover states */
--bg-input: #0f172a; /* Input fields */
```

### Text Colors

```css
--text-primary: #f8fafc; /* Primary text - near white */
--text-secondary: #cbd5e1; /* Secondary - light gray */
--text-muted: #94a3b8; /* Muted - medium gray */
--text-dim: #64748b; /* Dim - labels */
```

### Semantic Colors

```css
--success: #22c55e; /* Green - positive stats */
--danger: #ef4444; /* Red - negative stats */
--warning: #f59e0b; /* Orange - alerts */
--info: #3b82f6; /* Blue - info */
```

### Brand (Keep but adjust)

```css
--cv-primary: #10b981; /* Emerald green (brighter) */
--cv-accent: #a3d977; /* Lime (keep) */
--cv-highlight: #fbbf24; /* Gold for premium */
```

---

## 🔧 Changes to Make

### 1. Global Dark-First

- Default to dark theme
- Remove light mode OR make dark default
- All backgrounds use new dark palette

### 2. Remove ALL White Backgrounds

Replace with dark alternatives:

- `bg-white` → `bg-[--bg-card]`
- `bg-white/80` → `bg-[--bg-elevated]/95`
- Input `bg-white` → `bg-[--bg-input]`

### 3. High-Contrast Text

- Primary text: Near-white (#F8FAFC)
- Labels: Light gray (#CBD5E1)
- Muted: Medium gray (#94A3B8)
- Never gray on gray

### 4. Fantasy Football Patterns

#### Player Cards

```
┌─────────────────────────┐
│ Patrick Mahomes    QB   │ ← Big name, position badge
│ KC vs DEN              │ ← Team + matchup
│ ──────────────────────  │
│ 22.5    18.2   28.1    │ ← Big numbers (median, floor, ceiling)
│ Median  Floor  Ceiling │ ← Small labels
│ ──────────────────────  │
│ 🟢 Usage ↑  ⚠️ Matchup │ ← Colored chips
└─────────────────────────┘
```

#### Tables (Dense like ESPN)

```
Player          Team  Pos   Proj   Floor  Ceil
────────────────────────────────────────────
Mahomes         KC    QB    22.5   18.2   28.1
Hurts           PHI   QB    24.2   19.5   29.8
```

#### Risk Modes (Like Sleeper's segments)

```
[  Protect  ] [ Neutral ] [  Chase  ]
     ↑ Selected (bright green bg)
```

---

## 📋 Implementation Checklist

### Phase 1: Color System (30 min)

- [ ] Update globals.css with new color variables
- [ ] Set dark theme as default
- [ ] Remove/minimize light mode styles

### Phase 2: Remove White Backgrounds (1 hour)

- [ ] Update all tool pages (Start/Sit, FAAB, Decisions)
- [ ] Update metrics dashboard
- [ ] Update header/footer
- [ ] Update all component cards
- [ ] Update input fields
- [ ] Update modals/drawers

### Phase 3: Typography & Contrast (30 min)

- [ ] Increase primary text brightness
- [ ] Add proper hierarchy (big numbers, small labels)
- [ ] Ensure 4.5:1 contrast ratio minimum
- [ ] Test readability on all pages

### Phase 4: Fantasy Football Patterns (1 hour)

- [ ] Redesign player cards (compact, stat-forward)
- [ ] Add colored stat indicators (green up, red down)
- [ ] Improve risk mode buttons (segment control style)
- [ ] Dense tables like ESPN
- [ ] Team color accents (if available)

### Phase 5: Polish (30 min)

- [ ] Add subtle shadows (instead of borders)
- [ ] Smooth transitions
- [ ] Hover states
- [ ] Loading states
- [ ] Test ALL buttons and options

---

## 🎯 Success Criteria

### Visual

- [x] NO white backgrounds (or <5 instances for specific cases)
- [ ] Dark theme feels natural, not forced
- [ ] Text is highly readable (WCAG AAA)
- [ ] Looks like a professional FF app

### Functional

- [ ] All buttons work
- [ ] All options work
- [ ] No broken layouts
- [ ] Responsive on mobile

### User Experience

- [ ] Feels modern and polished
- [ ] Easy to scan data quickly
- [ ] Clear visual hierarchy
- [ ] User-friendly interactions

---

## 🛡️ Tailwind Hardening

- **[Tailwind CSS Implementation Reference](./TAILWIND_IMPLEMENTATION_REFERENCE.md)** - Complete setup guide, FOUC prevention, safelist config, and validation snippets

## 🚀 Quick Wins First

1. Make dark theme default
2. Replace white with dark backgrounds
3. Brighten text for contrast
4. Test everything works

Then iterate on polish!
