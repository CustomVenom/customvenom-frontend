# CustomVenom Design System v2.0

**Status**: Complete redesign with new branding, colors, and component system

**Created**: November 2, 2025

---

## 🐍 Brand Identity

### The Venom Concept

**Two Worlds, One Weapon:**

- **Public Hub**: The lure — inviting, professional, showcasing our analytical venom
- **Dashboard Hub**: The strike — intense, focused, your tactical war room

### Visual Metaphor

**Venom = Decisive Advantage**

- Not poison (negative), but *precision strike* (strategic)
- Clean lines with venomous accents
- Data that bites back against your opponents

---

## 🎨 Color System

### Primary Palette

```css
/* Venom Green (Primary) */
--venom-50: #ecfdf5;
--venom-100: #d1fae5;
--venom-400: #34d399;  /* Light actions */
--venom-500: #10b981;  /* Primary brand */
--venom-600: #059669;  /* Hover states */
--venom-700: #047857;  /* Active states */
--venom-900: #064e3b;  /* Dark accents */

/* Strike Gold (Accent) */
--strike-400: #fbbf24;
--strike-500: #f59e0b;  /* Dashboard accent */
--strike-600: #d97706;

/* Field Dark (Backgrounds) */
--field-900: #0a0f0b;   /* Deepest background */
--field-800: #111827;   /* Card backgrounds */
--field-700: #1f2937;   /* Elevated surfaces */
--field-600: #374151;   /* Borders */

/* Trust Blue (Data reliability) */
--trust-500: #3b82f6;
--trust-600: #2563eb;

/* Alert Red (Warnings) */
--alert-500: #ef4444;
--alert-600: #dc2626;
```

### Semantic Colors

```css
/* Backgrounds */
--bg-public: #ffffff;           /* Public hub - light */
--bg-dashboard: #0a0f0b;        /* Dashboard hub - dark */
--bg-card-public: #f9fafb;
--bg-card-dashboard: #111827;
--bg-elevated: #1f2937;

/* Text */
--text-primary-light: #111827;
--text-primary-dark: #f9fafb;
--text-secondary-light: #6b7280;
--text-secondary-dark: #9ca3af;
--text-muted: #6b7280;

/* Interactive */
--interactive-primary: var(--venom-500);
--interactive-hover: var(--venom-600);
--interactive-active: var(--venom-700);
```

---

## 🔤 Typography

### Font Stack

```css
/* Headings - Bold, Impactful */
--font-heading: 'Inter', system-ui, sans-serif;
--font-heading-weight: 700;

/* Body - Readable, Dense Data */
--font-body: 'Inter', system-ui, sans-serif;
--font-body-weight: 400;

/* Mono - Stats, Numbers */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

```css
/* Display - Hero sections */
--text-display: 3.75rem;  /* 60px */
--text-display-line: 1;

/* H1 - Page titles */
--text-h1: 2.25rem;  /* 36px */
--text-h1-line: 1.2;

/* H2 - Section headers */
--text-h2: 1.875rem;  /* 30px */
--text-h2-line: 1.3;

/* H3 - Subsections */
--text-h3: 1.5rem;  /* 24px */
--text-h3-line: 1.4;

/* Body */
--text-base: 1rem;  /* 16px */
--text-base-line: 1.5;

/* Small - Labels, captions */
--text-sm: 0.875rem;  /* 14px */
--text-sm-line: 1.4;

/* Tiny - Metadata */
--text-xs: 0.75rem;  /* 12px */
--text-xs-line: 1.3;
```

---

## 🎭 Component System

### Button Variants

```tsx
// Primary - Main CTAs
<button className="bg-venom-500 hover:bg-venom-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-venom-500/30 transition-all hover:shadow-venom-500/50 hover:scale-105">
  Strike Zone
</button>

// Secondary - Supporting actions
<button className="bg-field-700 hover:bg-field-600 text-gray-100 font-medium px-5 py-2.5 rounded-lg border border-field-600 transition-colors">
  View Details
</button>

// Ghost - Subtle actions
<button className="text-venom-400 hover:text-venom-300 hover:bg-venom-500/10 px-4 py-2 rounded-md transition-colors">
  Learn More
</button>

// Danger - Destructive actions
<button className="bg-alert-500 hover:bg-alert-600 text-white px-5 py-2.5 rounded-lg">
  Remove
</button>
```

### Card Variants

```tsx
// Public Hub Card - Light, airy
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
  {children}
</div>

// Dashboard Card - Dark, focused
<div className="bg-field-800 rounded-xl border border-field-600 p-6 hover:border-venom-500/50 transition-colors">
  {children}
</div>

// Stat Card - Highlighted
<div className="bg-gradient-to-br from-venom-500 to-venom-700 rounded-xl p-6 text-white shadow-xl">
  {children}
</div>

// Alert Card
<div className="bg-strike-500/10 border-l-4 border-strike-500 p-4 rounded-r-lg">
  {children}
</div>
```

### Badge System

```tsx
// Trust Badge
<span className="inline-flex items-center gap-1.5 bg-trust-500/10 text-trust-600 text-xs font-medium px-2.5 py-1 rounded-full border border-trust-500/20">
  <svg className="w-3 h-3">✓</svg>
  High Confidence
</span>

// Strike Badge (Premium feature)
<span className="inline-flex items-center gap-1 bg-gradient-to-r from-strike-400 to-strike-600 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
  ⚡ VIPER
</span>

// Status Badges
<span className="bg-venom-500/10 text-venom-400 px-2 py-0.5 rounded text-xs font-medium">
  Active
</span>
```

---

## 📐 Spacing & Layout

### Container Widths

```css
--container-sm: 640px;   /* Forms, narrow content */
--container-md: 768px;   /* Standard content */
--container-lg: 1024px;  /* Wide content */
--container-xl: 1280px;  /* Dashboard layouts */
--container-2xl: 1536px; /* Full-width tables */
```

### Spacing Scale

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-24: 6rem;    /* 96px */
```

---

## ✨ Special Effects

### Venom Glow

```css
/* Hover glow effect */
.venom-glow:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4),
              0 0 40px rgba(16, 185, 129, 0.2);
}

/* Pulsing badge */
@keyframes venom-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.venom-pulse {
  animation: venom-pulse 2s ease-in-out infinite;
}
```

### Scale Pattern (Dashboard texture)

```css
/* Subtle reptilian texture for dashboard */
.scale-pattern {
  background-image: 
    radial-gradient(circle at 20px 20px, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 60px 60px, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: 0 0, 40px 40px;
}
```

### Yard Line Pattern (Public hub)

```css
/* Football field lines for public sections */
.yard-lines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 49px,
    rgba(16, 185, 129, 0.08) 49px,
    rgba(16, 185, 129, 0.08) 51px
  );
}
```

---

## 🎯 Usage Guidelines

### When to Use Each Hub Style

**Public Hub (Light Mode)**

- Landing page
- General projections
- Trust snapshot
- Marketing content
- Unauthenticated views

**Dashboard Hub (Dark Mode)**

- User dashboard
- Roster view
- Player analysis tools
- Start/sit decisions
- All authenticated user data

### Accessibility

```tsx
// Minimum contrast ratios (WCAG AA)
// Background: #0a0f0b (dark) + Text: #f9fafb (light) = 19.4:1 ✓
// Background: #ffffff (light) + Text: #111827 (dark) = 18.8:1 ✓

// Focus states - always visible
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-venom-500 focus:ring-offset-2 focus:ring-offset-field-900;
}

// Touch targets - minimum 44x44px
// Skip links for keyboard navigation
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Phones landscape */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptop */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large displays */
```

### Mobile Optimizations

```tsx
// Compact spacing on mobile
<div className="p-4 md:p-6 lg:p-8">

// Stack on mobile, grid on desktop  
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Smaller text on mobile
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

## 🔧 Implementation Notes

### Tailwind Config

```jsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        venom: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        strike: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        field: {
          600: '#374151',
          700: '#1f2937',
          800: '#111827',
          900: '#0a0f0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

### CSS Variables

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Public Hub - Light */
    --bg-public: 255 255 255;
    --text-public: 17 24 39;
  }
  
  .dashboard-hub {
    /* Dashboard Hub - Dark */
    --bg-dashboard: 10 15 11;
    --text-dashboard: 249 250 251;
  }
}
```

---

**Design System Complete** ✅

All components, colors, and patterns ready for implementation across both Public and Dashboard hubs.

# Public Hub - Complete Implementation

**Route**: `/` (root)

**Purpose**: Inviting storefront for unauthenticated users

**Style**: Light mode, professional, showcasing analytical power

---

## 📄 File: `src/app/page.tsx`

```tsx
import { HeroSection } from '@/components/public/HeroSection'
import { ProjectionsShowcase } from '@/components/public/ProjectionsShowcase'
import { TrustSection } from '@/components/public/TrustSection'
import { FeaturesGrid } from '@/components/public/FeaturesGrid'
import { CTASection } from '@/components/public/CTASection'
import { PublicFooter } from '@/components/public/PublicFooter'

export const metadata = {
  title: 'Custom Venom | Fantasy Football Analytics with Bite',
  description: 'Probabilistic projections and explainable AI for fantasy football. See the floor, median, and ceiling for every player.'
}

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Above the fold */}
      <HeroSection />
      
      {/* Live Projections Preview - Filterable by scoring format */}
      <ProjectionsShowcase />
      
      {/* Trust Section - Our analytical moat */}
      <TrustSection />
      
      {/* Features - What you get */}
      <FeaturesGrid />
      
      {/* CTA - Get started */}
      <CTASection />
      
      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
```

---

## 🎭 Component: `HeroSection.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden yard-lines">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-venom-50/50 to-white pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Logo + Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <VenomLogo size="lg" />
                <span className="text-sm font-medium text-venom-600 tracking-wide uppercase">
                  Fantasy Analytics
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Pick Your
                <span className="block text-venom-600">Poison</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                See <strong>floor, median, and ceiling</strong> projections for every player. 
                Understand the <em>why</em> behind the numbers.
              </p>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 bg-venom-500 hover:bg-venom-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg shadow-venom-500/30 transition-all hover:shadow-venom-500/50 hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                href="#projections" 
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-medium px-8 py-4 rounded-lg border-2 border-gray-200 transition-colors"
              >
                View Projections
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-500">Projections Weekly</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl font-bold text-gray-900">2025</div>
                <div className="text-sm text-gray-500">NFL Season</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-venom-600">✓</span>
                  <span className="text-sm font-medium text-gray-700">Calibrated</span>
                </div>
                <div className="text-sm text-gray-500">Live Data</div>
              </div>
            </div>
          </div>
          
          {/* Right: Visual */}
          <div className="relative">
            {/* Projection card preview */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-venom-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    RB
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Christian McCaffrey</div>
                    <div className="text-sm text-gray-500">SF vs ARI</div>
                  </div>
                </div>
                <div className="bg-venom-50 text-venom-700 text-xs font-medium px-2 py-1 rounded">Week 9</div>
              </div>
              
              {/* Floor-Median-Ceiling visual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Floor</span>
                  <span className="font-mono font-semibold text-gray-900">14.2</span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-venom-200 via-venom-400 to-venom-600 rounded-lg" style=width: '85%' />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">Median: 21.5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ceiling</span>
                  <span className="font-mono font-semibold text-gray-900">32.8</span>
                </div>
              </div>
              
              {/* Reasons */}
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-venom-50 text-venom-700 text-xs font-medium px-2 py-1 rounded border border-venom-200">
                  ↑ 85% Rush Share
                </span>
                <span className="inline-flex items-center gap-1 bg-trust-50 text-trust-700 text-xs font-medium px-2 py-1 rounded border border-trust-200">
                  • Positive Game Script
                </span>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-strike-400 to-strike-600 text-gray-900 px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-pulse">
              <Zap className="w-4 h-4" />
              Live Data
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## 📊 Component: `ProjectionsShowcase.tsx`

```tsx
'use client'

import { useState } from 'react'
import { TrustSnapshot } from '@/components/TrustSnapshot'

type ScoringFormat = '0.5ppr' | 'standard' | 'ppr'

export function ProjectionsShowcase() {
  const [format, setFormat] = useState<ScoringFormat>('0.5ppr')
  const [position, setPosition] = useState<string>('ALL')
  
  return (
    <section id="projections" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Week 9 Projections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See probabilistic ranges and explainable drivers for every player.
            Filter by scoring format to match your league.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          {/* Scoring format toggle */}
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {(['0.5ppr', 'standard', 'ppr'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  format === fmt
                    ? 'bg-venom-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {fmt === '0.5ppr' ? '½ PPR' : fmt === 'standard' ? 'Standard' : 'Full PPR'}
              </button>
            ))}
          </div>
          
          {/* Position filter */}
          <div className="flex gap-2">
            {['ALL', 'QB', 'RB', 'WR', 'TE'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  position === pos
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
        
        {/* Projections Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Median</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ceiling</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Sample rows - replace with actual data */}
                <ProjectionRow
                  player="Christian McCaffrey"
                  team="SF"
                  position="RB"
                  floor={14.2}
                  median={21.5}
                  ceiling={32.8}
                  drivers={['↑ 85% Rush Share', '• Positive Script']}
                />
                <ProjectionRow
                  player="CeeDee Lamb"
                  team="DAL"
                  position="WR"
                  floor={11.8}
                  median={18.3}
                  ceiling={29.5}
                  drivers={['↑ Target Share 28%', '↓ Tough DB']}
                />
                {/* More rows... */}
              </tbody>
            </table>
          </div>
          
          {/* View more CTA */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-venom-600 hover:text-venom-700 font-medium text-sm"
            >
              View All Projections + Your Roster
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjectionRow({ player, team, position, floor, median, ceiling, drivers }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-venom-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
            {position}
          </div>
          <div className="font-medium text-gray-900">{player}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{team}</td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono text-sm text-gray-600">{floor}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono font-semibold text-gray-900">{median}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-mono text-sm text-gray-600">{ceiling}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1 flex-wrap">
          {[drivers.map](http://drivers.map)((d: string, i: number) => (
            <span key={i} className="inline-block bg-venom-50 text-venom-700 text-xs px-2 py-0.5 rounded border border-venom-200">
              {d}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}
```

---

## 🛡️ Component: `TrustSection.tsx`

```tsx
export function TrustSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Trust Snapshot */}
          <div>
            <TrustSnapshot />
          </div>
          
          {/* Right: Explanation */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-trust-50 text-trust-600 px-3 py-1 rounded-full border border-trust-200 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              Calibrated Weekly
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Our Projections Bite Harder
            </h2>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Most sites give you a single number. We give you the **full picture**: 
                floor, median, and ceiling outcomes based on thousands of simulations.
              </p>
              
              <p>
                Every projection comes with <strong>explainable drivers</strong> — 
                see exactly why a player's outlook changed this week.
              </p>
              
              <p>
                Our Trust Snapshot shows real-time calibration. When we say 70% confidence, 
                we hit that target historically. No smoke and mirrors.
              </p>
            </div>
            
            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">89%</div>
                <div className="text-sm text-gray-500">In-Range Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">±2.3</div>
                <div className="text-sm text-gray-500">Avg Median Error</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-venom-600">Weekly</div>
                <div className="text-sm text-gray-500">Data Refresh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

**Public Hub Complete** ✅

All components ready for landing page with live projections showcase.


# Dashboard Hub - Complete Implementation

**Route**: `/dashboard`

**Purpose**: Private tactical command center for authenticated users

**Style**: Dark mode, focused, data-dense "war room"

---

## 📄 File: `src/app/dashboard/page.tsx`

```tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { TeamSelector } from '@/components/dashboard/TeamSelector'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { ToolTabs } from '@/components/dashboard/ToolTabs'
import { ConnectLeaguePrompt } from '@/components/dashboard/ConnectLeaguePrompt'

export const metadata = {
  title: 'Dashboard | Custom Venom',
  description: 'Your fantasy football command center'
}

export default async function DashboardPage() {
  const session = await getServerSession()
  
  // Not authenticated - redirect to home
  if (!session) {
    redirect('/?signin=required')
  }
  
  // Authenticated but no league connected
  if (!session.yahooAccessToken) {
    return (
      <div className="min-h-screen bg-field-900 scale-pattern">
        <DashboardHeader />
        <ConnectLeaguePrompt />
      </div>
    )
  }
  
  // Authenticated but no team selected
  if (!session.teamKey) {
    return (
      <div className="min-h-screen bg-field-900 scale-pattern">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-field-800 rounded-xl border border-field-600 p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-100">Select Your Team</h2>
            <p className="text-gray-400">Choose which team you want to analyze</p>
            <TeamSelector />
          </div>
        </div>
      </div>
    )
  }
  
  // Fully authenticated + team selected - show dashboard
  return (
    <div className="min-h-screen bg-field-900 scale-pattern">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Team Selector + Quick Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-1">War Room</h1>
            <p className="text-gray-400">Your tactical command center</p>
          </div>
          <TeamSelector />
        </div>
        
        {/* Quick Stats Overview */}
        <QuickStats teamKey={session.teamKey} />
        
        {/* Tool Tabs - All tools in one place */}
        <ToolTabs teamKey={session.teamKey} />
      </div>
    </div>
  )
}
```

---

## 🎛️ Component: `DashboardHeader.tsx`

```tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { VenomLogo } from '@/components/VenomLogo'
import { Zap, User, LogOut, Settings } from 'lucide-react'

export function DashboardHeader() {
  const { data: session } = useSession()
  
  return (
    <header className="bg-field-800 border-b border-field-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <VenomLogo size="md" variant="dark" />
            <span className="text-lg font-bold text-gray-100">Custom Venom</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-gray-300 hover:text-venom-400 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/roster" 
              className="text-gray-300 hover:text-venom-400 transition-colors font-medium"
            >
              Roster
            </Link>
            <Link 
              href="/dashboard/players" 
              className="text-gray-300 hover:text-venom-400 transition-colors font-medium"
            >
              Players
            </Link>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center gap-4">
            {session?.user?.isPro && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-strike-400 to-strike-600 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                <Zap className="w-3 h-3" />
                VIPER
              </span>
            )}
            
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {session?.user?.name || 'Account'}
                </span>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-field-700 border border-field-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link 
                  href="/settings" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-field-600 rounded-t-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-field-600 rounded-b-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

---

## 📊 Component: `QuickStats.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Trophy, DollarSign } from 'lucide-react'

interface QuickStatsProps {
  teamKey: string
}

interface TeamStats {
  record: string
  pointsFor: number
  pointsAgainst: number
  rank: number
  faabRemaining: number
}

export function QuickStats({ teamKey }: QuickStatsProps) {
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/league/stats?teamKey=${teamKey}`)
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [teamKey])
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-field-800 rounded-xl border border-field-600 p-6 animate-pulse">
            <div className="h-20" />
          </div>
        ))}
      </div>
    )
  }
  
  if (!stats) return null
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Record */}
      <StatCard
        label="Record"
        value={stats.record}
        icon={<Trophy className="w-5 h-5" />}
        color="venom"
      />
      
      {/* Points For */}
      <StatCard
        label="Points For"
        value={stats.pointsFor.toFixed(1)}
        icon={<TrendingUp className="w-5 h-5" />}
        color="venom"
      />
      
      {/* Rank */}
      <StatCard
        label="League Rank"
        value={`#${stats.rank}`}
        icon={<Trophy className="w-5 h-5" />}
        color="strike"
      />
      
      {/* FAAB */}
      <StatCard
        label="FAAB Budget"
        value={`$${stats.faabRemaining}`}
        icon={<DollarSign className="w-5 h-5" />}
        color="trust"
      />
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
  const colorClasses = {
    venom: 'bg-venom-500/10 text-venom-400 border-venom-500/20',
    strike: 'bg-strike-500/10 text-strike-400 border-strike-500/20',
    trust: 'bg-trust-500/10 text-trust-400 border-trust-500/20',
  }
  
  return (
    <div className="bg-field-800 rounded-xl border border-field-600 p-6 hover:border-venom-500/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
    </div>
  )
}
```

---

## 🔧 Component: `ToolTabs.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Target, Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { ImportantDecisions } from './tools/ImportantDecisions'
import { StartSitAnalyzer } from './tools/StartSitAnalyzer'
import { FAABHelper } from './tools/FAABHelper'
import { RosterOverview } from './tools/RosterOverview'
import { ProjectionsView } from './tools/ProjectionsView'

type TabId = 'overview' | 'decisions' | 'startsit' | 'faab' | 'projections'

interface ToolTabsProps {
  teamKey: string
}

export function ToolTabs({ teamKey }: ToolTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  
  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: Users },
    { id: 'decisions' as TabId, label: 'Kill Shots', icon: AlertCircle },
    { id: 'startsit' as TabId, label: 'Face-Off', icon: Target },
    { id: 'faab' as TabId, label: 'Bid Hunter', icon: DollarSign },
    { id: 'projections' as TabId, label: 'Strike Ranges', icon: TrendingUp },
  ]
  
  return (
    <div className="bg-field-800 rounded-xl border border-field-600 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-field-600 bg-field-900/50">
        <div className="flex overflow-x-auto">
          {[tabs.map](http://tabs.map)(tab => {
            const Icon = tab.icon
            const isActive = activeTab === [tab.id](http://tab.id)
            
            return (
              <button
                key={[tab.id](http://tab.id)}
                onClick={() => setActiveTab([tab.id](http://tab.id))}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'text-venom-400 border-b-2 border-venom-400 bg-field-800' 
                    : 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <RosterOverview teamKey={teamKey} />}
        {activeTab === 'decisions' && <ImportantDecisions teamKey={teamKey} />}
        {activeTab === 'startsit' && <StartSitAnalyzer teamKey={teamKey} />}
        {activeTab === 'faab' && <FAABHelper teamKey={teamKey} />}
        {activeTab === 'projections' && <ProjectionsView teamKey={teamKey} />}
      </div>
    </div>
  )
}
```

---

## 🎯 Component: `ConnectLeaguePrompt.tsx`

```tsx
'use client'

import { Zap, Shield, TrendingUp, Target } from 'lucide-react'

export function ConnectLeaguePrompt() {
  const handleConnect = () => {
    window.location.href = `${[process.env.NEXT](http://process.env.NEXT)_PUBLIC_API_BASE}/api/yahoo/connect?redirect=/dashboard`
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-venom-500/10 rounded-2xl flex items-center justify-center border border-venom-500/20">
            <Zap className="w-10 h-10 text-venom-400" />
          </div>
        </div>
        
        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-100">
            Connect Your Fantasy League
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Link your Yahoo Fantasy league to unlock AI-powered projections, 
            lineup recommendations, and waiver wire analysis.
          </p>
        </div>
        
        {/* CTA */}
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 bg-venom-500 hover:bg-venom-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg shadow-venom-500/30 transition-all hover:shadow-venom-500/50 hover:scale-105"
        >
          <Zap className="w-5 h-5" />
          Connect Yahoo Fantasy
        </button>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Floor-Median-Ceiling"
            description="See probabilistic ranges for every player on your roster"
          />
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Important Decisions"
            description="AI identifies your toughest weekly lineup calls"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Secure & Private"
            description="We never make changes to your team. Read-only access."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-field-800 rounded-xl border border-field-600 p-6 space-y-3">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-venom-500/10 rounded-lg flex items-center justify-center text-venom-400">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-gray-100">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}
```

---

**Dashboard Hub Complete** ✅

All dashboard components ready with dark theme, tool tabs, and secure authentication flow.


# Complete Component Library

**Location**: `src/components/`

**Purpose**: Reusable, type-safe components for both hubs

---

## 🐍 Component: `VenomLogo.tsx`

```tsx
import { FC } from 'react'

interface VenomLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
  className?: string
}

export const VenomLogo: FC<VenomLogoProps> = ({ 
  size = 'md', 
  variant = 'light',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  const colors = {
    light: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#047857'
    },
    dark: {
      primary: '#34d399',
      secondary: '#10b981',
      accent: '#059669'
    }
  }
  
  const c = colors[variant]
  
  return (
    <svg 
      className={`${sizes[size]} ${className}`}
      viewBox="0 0 64 64" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Snake head with fang */}
      <path
        d="M32 8C22 8 14 16 14 26C14 32 16 36 20 40L24 44V52C24 54 26 56 28 56H36C38 56 40 54 40 52V44L44 40C48 36 50 32 50 26C50 16 42 8 32 8Z"
        fill={c.primary}
      />
      
      {/* Eyes */}
      <circle cx="24" cy="22" r="3" fill="#0a0f0b" />
      <circle cx="40" cy="22" r="3" fill="#0a0f0b" />
      
      {/* Fang highlights */}
      <path
        d="M28 32L26 42H30L28 32Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M36 32L34 42H38L36 32Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Scale pattern */}
      <circle cx="32" cy="16" r="2" fill={c.secondary} opacity="0.3" />
      <circle cx="26" cy="14" r="1.5" fill={c.accent} opacity="0.2" />
      <circle cx="38" cy="14" r="1.5" fill={c.accent} opacity="0.2" />
    </svg>
  )
}
```

---

## 🔘 Component: `Button.tsx`

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-venom-500 hover:bg-venom-600 text-white shadow-lg shadow-venom-500/30 hover:shadow-venom-500/50 hover:scale-105 focus:ring-venom-500',
        secondary: 'bg-field-700 hover:bg-field-600 text-gray-100 border border-field-600 focus:ring-field-500',
        ghost: 'text-venom-400 hover:text-venom-300 hover:bg-venom-500/10 focus:ring-venom-500',
        danger: 'bg-alert-500 hover:bg-alert-600 text-white focus:ring-alert-500',
        outline: 'border-2 border-venom-500 text-venom-500 hover:bg-venom-500 hover:text-white focus:ring-venom-500'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-5 py-2.5 text-base rounded-lg',
        lg: 'px-8 py-4 text-lg rounded-lg',
        icon: 'p-2 rounded-md'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

---

## 📦 Component: `Card.tsx`

```tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'public' | 'dashboard' | 'stat' | 'alert'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'public', children, ...props }, ref) => {
    const variants = {
      public: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow',
      dashboard: 'bg-field-800 rounded-xl border border-field-600 p-6 hover:border-venom-500/50 transition-colors',
      stat: 'bg-gradient-to-br from-venom-500 to-venom-700 rounded-xl p-6 text-white shadow-xl',
      alert: 'bg-strike-500/10 border-l-4 border-strike-500 p-4 rounded-r-lg'
    }
    
    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'
```

---

## 🏷️ Component: `Badge.tsx`

```tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full border',
  {
    variants: {
      variant: {
        trust: 'bg-trust-500/10 text-trust-600 border-trust-500/20',
        venom: 'bg-venom-500/10 text-venom-400 border-venom-500/20',
        strike: 'bg-gradient-to-r from-strike-400 to-strike-600 text-gray-900 border-0 shadow-md',
        alert: 'bg-alert-500/10 text-alert-600 border-alert-500/20',
        neutral: 'bg-gray-100 text-gray-600 border-gray-200'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md'
    }
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'
```

---

## ⚡ Component: `LoadingSpinner.tsx`

```tsx
import { FC } from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  text,
  className 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn(
          'animate-spin text-venom-500',
          sizes[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  )
}
```

---

## 🚨 Component: `EmptyState.tsx`

```tsx
import { FC, ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-field-700 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

## 🔍 Component: `SearchInput.tsx`

```tsx
'use client'

import { FC, InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

export const SearchInput: FC<SearchInputProps> = ({
  className,
  onClear,
  value,
  ...props
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        className={cn(
          'w-full pl-10 pr-10 py-2 bg-white dark:bg-field-800 border border-gray-200 dark:border-field-600 rounded-lg',
          'text-gray-900 dark:text-gray-100 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-venom-500 focus:border-transparent',
          'transition-colors',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
```

---

**Component Library Complete** ✅

All reusable components ready with TypeScript types, variants, and dark/light mode support.



**Purpose**: Lightweight auth framework for CustomVenom MVP. Supports tiers (Free/Viper/Mamba), paywalls, and role-based access without blocking data flow.

---

## Architecture Overview

### Design Principles

1. **Data-first**: Auth never blocks live player data ingestion or display
2. **Progressive enhancement**: Free users see core projections, paid users unlock tools
3. **Framework only**: MVP ships with structure in place, full implementation comes later
4. **Venom-themed**: No generic "Pro" language—use Strike Force, Viper Tier, Mamba Tier

### Three-Tier System

**🆓 Free (Hatchling)**

- Public projections page (filterable by scoring format)
- Trust snapshot widget
- Limited to top 100 players
- Read-only access

**⚡ Viper Tier ($9.99/month)**

- Full player database with search
- Start/Sit tool
- FAAB Bid Helper
- Connect Yahoo league
- Export to CSV

**🐍 Mamba Tier ($19.99/month)**

- Everything in Viper
- Face-Off (head-to-head matchup analyzer)
- Kill Shots (trade analyzer)
- Strike Ranges (advanced projections)
- API access (100 requests/day)
- Priority support

---

## Tech Stack

### Authentication

- **NextAuth.js v5** (Auth.js) with Prisma adapter
- **Database**: Neon Postgres (existing)
- **Session**: JWT + database sessions (hybrid)
- **Providers**:
    - Email/password (primary)
    - Yahoo OAuth (for league connection, not login)

### Authorization

- **Middleware**: Edge middleware checks tier before route access
- **Component-level**: `<StrikeForce>` wrapper component replaces old "Go Pro" buttons
- **API-level**: Workers API validates session token and tier

---

## Database Schema (Prisma)

```tsx
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String    // bcrypt hashed
  name          String?
  image         String?
  tier          UserTier  @default(FREE)
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  leagues       League[]
  subscription  Subscription?
}

enum UserTier {
  FREE      // Hatchling
  VIPER     // $9.99/month
  MAMBA     // $19.99/month
}

enum UserRole {
  USER       // Standard user
  ADMIN      // Full access + user management
  DEVELOPER  // API access + debug tools
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

model League {
  id          String   @id @default(cuid())
  userId      String
  provider    String   // 'yahoo', 'espn', 'sleeper'
  leagueKey   String
  leagueName  String
  season      Int
  gameType    String   // 'nfl', 'nba' (future)
  connected   Boolean  @default(true)
  lastSync    DateTime @default(now())
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, provider, leagueKey])
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  tier              UserTier
  status            String   // 'active', 'canceled', 'past_due'
  currentPeriodEnd  DateTime
  cancelAtPeriodEnd Boolean  @default(false)
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Route Protection

### Middleware (middleware.ts)

```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const TIER_ROUTES = {
  FREE: ['/'],
  VIPER: ['/dashboard', '/dashboard/roster', '/dashboard/players'],
  MAMBA: ['/dashboard/killshots', '/dashboard/faceoff', '/dashboard/strike-ranges']
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl
  
  // Public routes - always allow
  if (pathname === '/' || pathname.startsWith('/api/auth')) {
    return [NextResponse.next](http://NextResponse.next)()
  }
  
  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check tier access
    const userTier = token.tier as string
    
    // Mamba routes (most restrictive)
    if (pathname.match(/\/(killshots|faceoff|strike-ranges)/)) {
      if (userTier !== 'MAMBA') {
        return NextResponse.redirect(new URL('/dashboard?upgrade=mamba', request.url))
      }
    }
    
    // Viper routes (basic dashboard access)
    if (userTier === 'FREE') {
      return NextResponse.redirect(new URL('/?upgrade=viper', request.url))
    }
  }
  
  return [NextResponse.next](http://NextResponse.next)()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Environment Variables

```bash
# NextAuth
NEXTAUTH_URL=https://customvenom.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Yahoo OAuth (for league connection)
YAHOO_CLIENT_ID=<from-yahoo-developer>
YAHOO_CLIENT_SECRET=<from-yahoo-developer>

# Email (for passwordless/verification)
EMAIL_SERVER=smtp://user:[pass@smtp.example.com:587](mailto:pass@smtp.example.com:587)
[EMAIL_FROM=noreply@customvenom.com](mailto:EMAIL_FROM=noreply@customvenom.com)
```

---

## Development Flow

### Phase 1: Framework (This Sprint)

1. ✅ Define schema and tiers
2. ⏳ Set up NextAuth with email/password
3. ⏳ Create login/signup pages
4. ⏳ Add middleware protection
5. ⏳ Build `<StrikeForce>` paywall component

### Phase 2: Data Integration (Next Sprint)

1. Wire live player projections API
2. Implement tier-based filtering (Free sees top 100)
3. Add "upgrade to unlock" states in UI
4. Test with real data flow

### Phase 3: Payments (Later)

1. Integrate Stripe
2. Subscription management
3. Webhook handlers
4. Billing portal

---

## Key Files

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts   # NextAuth config
│   ├── login/page.tsx                     # Login page
│   ├── signup/page.tsx                    # Signup page
│   ├── account/page.tsx                   # Account management
│   └── dashboard/                         # Protected routes
├── components/
│   ├── auth/
│   │   ├── StrikeForce.tsx               # Paywall wrapper
│   │   ├── LoginForm.tsx                 # Email/password form
│   │   └── UserMenu.tsx                  # User dropdown
│   └── ui/                                # Existing components
├── lib/
│   ├── auth.ts                            # NextAuth utilities
│   ├── permissions.ts                     # Tier checking
│   └── prisma.ts                          # Prisma client
├── middleware.ts                          # Route protection
└── prisma/
    └── schema.prisma                      # Database schema
```

---

## Acceptance Criteria

- [ ]  Prisma schema defined with User, Session, Subscription models
- [ ]  NextAuth configured with email/password provider
- [ ]  Login and signup pages functional (framework)
- [ ]  Middleware protects `/dashboard` routes by tier
- [ ]  `<StrikeForce>` component replaces "Go Pro" buttons
- [ ]  Free users can view public projections without blocking
- [ ]  Account page shows current tier and upgrade options
- [ ]  Role check (ADMIN) grants bypass for development
- [ ]  No auth logic blocks live data ingestion or API calls


**Purpose**: Venom-themed paywall component that replaces generic "Go Pro" buttons. Contextual, beautiful, and conversion-focused.

---

## Design Philosophy

### Venom Naming (No Generic "Pro")

- ❌ "Go Pro" or "Upgrade to Pro"
- ✅ "Unleash Full Venom"
- ✅ "Strike Force Access"
- ✅ "Unlock Viper Tools"
- ✅ "Ascend to Mamba"

### Visual Style

- **Dark mode**: Strike Gold (#f59e0b) glow on hover
- **Light mode**: Venom Green (#10b981) with scale pattern
- **Animation**: Subtle pulse on CTA, no annoying blocks
- **Placement**: Inline where feature would appear, not modal popup

---

## Component API

### StrikeForce.tsx

```tsx
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Lock, Zap } from 'lucide-react'

type Tier = 'FREE' | 'VIPER' | 'MAMBA'

interface StrikeForceProps {
  /** Minimum tier required to access */
  requiredTier: Tier
  
  /** Feature name for messaging */
  featureName: string
  
  /** Children shown when user has access */
  children: ReactNode
  
  /** Variant: 'inline' (shows in place) or 'blur' (blurs content) */
  variant?: 'inline' | 'blur'
  
  /** Custom upgrade message */
  upgradeMessage?: string
  
  /** Show feature preview/screenshot */
  preview?: ReactNode
}

const TIER_HIERARCHY = { FREE: 0, VIPER: 1, MAMBA: 2 }

export function StrikeForce({
  requiredTier,
  featureName,
  children,
  variant = 'inline',
  upgradeMessage,
  preview
}: StrikeForceProps) {
  const { data: session, status } = useSession()
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-venom-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  
  // Not authenticated
  if (!session) {
    return (
      <div className="border-2 border-dashed border-strike-500/30 rounded-lg p-8 text-center">
        <Lock className="h-12 w-12 text-strike-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Connect Your League to Unlock</h3>
        <p className="text-gray-400 mb-6">
          {featureName} requires a connected fantasy league.
        </p>
        <Button href="/login" variant="primary">
          Connect League
        </Button>
      </div>
    )
  }
  
  // Check tier access
  const userTier = session.user.tier as Tier
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]
  
  // User has access - show feature
  if (hasAccess) {
    return <>{children}</>
  }
  
  // User needs upgrade
  const tierName = requiredTier === 'MAMBA' ? 'Mamba' : 'Viper'
  const tierPrice = requiredTier === 'MAMBA' ? '$19.99' : '$9.99'
  const tierIcon = requiredTier === 'MAMBA' ? '🐍' : '⚡'
  
  const defaultMessage = upgradeMessage || 
    `Unlock ${featureName} with ${tierName} tier access.`
  
  if (variant === 'blur') {
    return (
      <div className="relative">
        {/* Blurred content preview */}
        <div className="filter blur-sm pointer-events-none select-none opacity-40">
          {preview || children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-field-900 via-field-900/95 to-transparent">
          <div className="text-center max-w-md px-6">
            <Badge variant="strike" className="mb-4">
              {tierIcon} {tierName} Only
            </Badge>
            <h3 className="text-2xl font-bold mb-2">{featureName}</h3>
            <p className="text-gray-400 mb-6">{defaultMessage}</p>
            <Button 
              href={`/account?upgrade=${requiredTier.toLowerCase()}`}
              variant="primary"
              className="group"
            >
              <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Unleash Full Venom · {tierPrice}/mo
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Inline variant (default)
  return (
    <div className="border-2 border-strike-500/30 bg-gradient-to-br from-strike-900/10 to-transparent rounded-lg p-8 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-strike-500/10 mb-4">
        <Lock className="h-8 w-8 text-strike-500" />
      </div>
      
      <Badge variant="strike" className="mb-3">
        {tierIcon} {tierName} Feature
      </Badge>
      
      <h3 className="text-xl font-bold mb-2">{featureName}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        {defaultMessage}
      </p>
      
      {preview && (
        <div className="mb-6 rounded-lg overflow-hidden border border-gray-800">
          {preview}
        </div>
      )}
      
      <Button 
        href={`/account?upgrade=${requiredTier.toLowerCase()}`}
        variant="primary"
        className="group"
      >
        <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
        Upgrade to {tierName} · {tierPrice}/mo
      </Button>
      
      <p className="text-xs text-gray-500 mt-4">
        7-day free trial · Cancel anytime
      </p>
    </div>
  )
}
```

---

## Usage Examples

### Example 1: Protect Entire Tool Page

```tsx
// app/dashboard/killshots/page.tsx
import { StrikeForce } from '@/components/auth/StrikeForce'
import { KillShotsContent } from './KillShotsContent'

export default function KillShotsPage() {
  return (
    <StrikeForce 
      requiredTier="MAMBA"
      featureName="Kill Shots Trade Analyzer"
      variant="inline"
    >
      <KillShotsContent />
    </StrikeForce>
  )
}
```

### Example 2: Blur Premium Feature

```tsx
// app/dashboard/players/page.tsx
import { StrikeForce } from '@/components/auth/StrikeForce'

export default function PlayersPage() {
  return (
    <div>
      <h1>Player Database</h1>
      
      {/* Free users see top 100 */}
      <PlayerTable limit={100} />
      
      {/* Premium feature: Advanced filters */}
      <StrikeForce
        requiredTier="VIPER"
        featureName="Advanced Filters"
        variant="blur"
        upgradeMessage="Filter by injury status, matchup grade, and custom projections."
        preview={
          <img 
            src="/images/filters-preview.png" 
            alt="Advanced filters preview"
            className="w-full"
          />
        }
      >
        <AdvancedFilters />
      </StrikeForce>
    </div>
  )
}
```

### Example 3: Inline Feature Teaser

```tsx
// app/dashboard/page.tsx
import { StrikeForce } from '@/components/auth/StrikeForce'

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Available tools */}
      <ToolCard title="Start/Sit" href="/dashboard/startsit" />
      <ToolCard title="FAAB Helper" href="/dashboard/faab" />
      
      {/* Premium tools with paywall */}
      <StrikeForce
        requiredTier="MAMBA"
        featureName="Kill Shots"
        variant="inline"
      >
        <ToolCard title="Kill Shots" href="/dashboard/killshots" />
      </StrikeForce>
      
      <StrikeForce
        requiredTier="MAMBA"
        featureName="Face-Off"
        variant="inline"
      >
        <ToolCard title="Face-Off" href="/dashboard/faceoff" />
      </StrikeForce>
    </div>
  )
}
```

---

## Visual Variants

### Tier Badges

```tsx
// Badge color mapping
const TIER_BADGES = {
  VIPER: 'bg-venom-500/10 text-venom-500 border-venom-500/30',
  MAMBA: 'bg-strike-500/10 text-strike-500 border-strike-500/30'
}
```

### Glow Animation (Tailwind)

```css
/* globals.css */
@keyframes venom-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 163, 74, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 163, 74, 0.6); }
}

.venom-glow {
  animation: venom-glow 2s ease-in-out infinite;
}

@keyframes strike-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.strike-pulse {
  animation: strike-pulse 2s ease-in-out infinite;
}
```

---

## Messaging Guide

### Tone & Voice

- **Confident, not pushy**: "Unlock" not "Buy Now"
- **Value-focused**: Emphasize what they gain
- **Thematic**: Use venom/snake/strike language
- **Honest**: "7-day trial, cancel anytime" always visible

### Copy Templates

**Viper Tier (Basic Dashboard Access)**

- Headline: "Connect Your League"
- Body: "Link your fantasy league and unlock personalized projections, Start/Sit analysis, and waiver recommendations."
- CTA: "Connect League · Free Trial"

**Mamba Tier (Advanced Tools)**

- Headline: "Ascend to Mamba Tier"
- Body: "Unlock advanced analytics: trade analyzer, head-to-head matchups, and API access for power users."
- CTA: "Unleash Full Venom · $19.99/mo"

**Feature-Specific**

- Kill Shots: "Identify winning trades with confidence scores and risk analysis."
- Face-Off: "Predict head-to-head matchups with advanced opponent modeling."
- Strike Ranges: "See projection uncertainty bands and understand the risk in every start."

---

## Accessibility

- Semantic HTML with `role="alert"` for tier locks
- Keyboard navigation: all CTAs focusable
- Screen reader text: "This feature requires [Tier] access"
- Color contrast: WCAG AA compliant (4.5:1 minimum)
- No animation for `prefers-reduced-motion`

---

## Analytics Events

```tsx
// Track paywall interactions
const trackPaywall = {
  view: (feature: string, tier: string) => {
    // analytics.track('paywall_viewed', { feature, tier })
  },
  
  click: (feature: string, tier: string, cta: string) => {
    // analytics.track('paywall_clicked', { feature, tier, cta })
  }
}
```

---

## Acceptance Criteria

- [ ]  Component renders correctly for all tiers (FREE, VIPER, MAMBA)
- [ ]  Inline variant shows upgrade card with feature description
- [ ]  Blur variant overlays blurred content with centered CTA
- [ ]  Loading state shows spinner
- [ ]  Unauthenticated state shows "Connect League" prompt
- [ ]  All CTAs link to account page with `?upgrade=` param
- [ ]  Venom/Strike theming applied (no generic "Pro" language)
- [ ]  Animations smooth, respects reduced motion
- [ ]  Mobile responsive and touch-friendly
- [ ]  Screen reader accessible


**Purpose**: Sitewide authentication pages with email/password. Venom-themed, secure, and mobile-first.

---

## Route Structure

```
/login       - Sign in page
/signup      - Create account page
/account     - Account management (authenticated)
/api/auth/*  - NextAuth endpoints
```

---

## Login Page

### app/login/page.tsx

```tsx
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { VenomLogo } from '@/components/ui/VenomLogo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In · CustomVenom',
  description: 'Sign in to access your fantasy football analytics.'
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-venom-900 via-field-900 to-field-950 p-12 items-center justify-center relative overflow-hidden">
        {/* Scale pattern background */}
        <div className="absolute inset-0 opacity-10" style= backgroundImage: 'url(/patterns/scales.svg)'  />
        
        <div className="relative z-10 max-w-md">
          <VenomLogo size="lg" variant="full" className="mb-8" />
          
          <h1 className="text-4xl font-bold mb-4">
            Your Fantasy Edge,<br />Backed by Data
          </h1>
          
          <p className="text-gray-300 text-lg mb-8">
            Connect your league and unlock personalized projections, waiver recommendations, and lineup optimization.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Calibrated Projections</h3>
                <p className="text-sm text-gray-400">Confidence ranges that actually match reality</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">League-Specific Insights</h3>
                <p className="text-sm text-gray-400">Scoring format and roster settings baked in</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-venom-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-venom-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Built for Decisions</h3>
                <p className="text-sm text-gray-400">Start/Sit, FAAB, trades—all in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-field-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <VenomLogo size="sm" variant="icon" className="mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-venom-500 hover:text-venom-400 font-medium">
              Sign up
            </Link>
          </p>
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
```

---

## Login Form Component

### components/auth/LoginForm.tsx

```tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }
      
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail([e.target](http://e.target).value)}
          placeholder="[you@example.com](mailto:you@example.com)"
          icon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword([e.target](http://e.target).value)}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
        />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            className="rounded border-gray-700 bg-field-800 text-venom-500 focus:ring-venom-500"
          />
          <span className="text-gray-400">Remember me</span>
        </label>
        
        <a href="/forgot-password" className="text-venom-500 hover:text-venom-400">
          Forgot password?
        </a>
      </div>
      
      <Button 
        type="submit" 
        variant="primary" 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-field-900 text-gray-400">or continue with</span>
        </div>
      </div>
      
      {/* OAuth providers (future) */}
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        disabled
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
        Google (Coming Soon)
      </Button>
    </form>
  )
}
```

---

## Signup Page

### app/signup/page.tsx

```tsx
import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'
import { VenomLogo } from '@/components/ui/VenomLogo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account · CustomVenom',
  description: 'Start your 7-day free trial of fantasy football analytics.'
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-field-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <VenomLogo size="sm" variant="icon" className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Start Your Free Trial</h2>
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-venom-500 hover:text-venom-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
        
        <SignupForm />
        
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-400">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### components/auth/SignupForm.tsx

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
    { label: 'Contains uppercase & lowercase', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) }
  ]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    if (!passwordRequirements.every(req => req.met)) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: [formData.name](http://formData.name),
          email: [formData.email](http://formData.email),
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setLoading(false)
        return
      }
      
      // Redirect to login
      router.push('/login?signup=success')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <Input
          id="name"
          type="text"
          value={[formData.name](http://formData.name)}
          onChange={(e) => setFormData(prev => ({ ...prev, name: [e.target](http://e.target).value }))}
          placeholder="John Doe"
          icon={<User className="h-4 w-4" />}
          required
          autoComplete="name"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={[formData.email](http://formData.email)}
          onChange={(e) => setFormData(prev => ({ ...prev, email: [e.target](http://e.target).value }))}
          placeholder="[you@example.com](mailto:you@example.com)"
          icon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: [e.target](http://e.target).value }))}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          required
          autoComplete="new-password"
        />
        
        {/* Password requirements */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            {[passwordRequirements.map](http://passwordRequirements.map)((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Check className={`h-3 w-3 ${req.met ? 'text-venom-500' : 'text-gray-600'}`} />
                <span className={req.met ? 'text-gray-400' : 'text-gray-600'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: [e.target](http://e.target).value }))}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          required
          autoComplete="new-password"
        />
      </div>
      
      <Button 
        type="submit" 
        variant="primary" 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Start Free Trial'}
      </Button>
      
      <div className="bg-venom-500/10 border border-venom-500/30 rounded-lg p-4">
        <p className="text-sm text-center">
          ⚡ 7-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </form>
  )
}
```

---

## NextAuth Configuration

### app/api/auth/[...nextauth]/route.ts

```tsx
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: [credentials.email](http://credentials.email) }
        })
        
        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }
        
        const isValid = await [bcrypt.compare](http://bcrypt.compare)(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        return {
          id: [user.id](http://user.id),
          email: [user.email](http://user.email),
          name: [user.name](http://user.name),
          tier: user.tier,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tier = user.tier
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.tier = token.tier as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }
```

### app/api/auth/signup/route.ts

```tsx
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    
    // Validate
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tier: 'FREE',
        role: 'USER'
      }
    })
    
    return NextResponse.json(
      { success: true, userId: [user.id](http://user.id) },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
```

---

## Acceptance Criteria

- [ ]  Login page renders with left branding panel (desktop) and form
- [ ]  Login form validates email/password and shows errors
- [ ]  Successful login redirects to `/dashboard` or `callbackUrl`
- [ ]  Signup page shows form with password requirements
- [ ]  Password requirements update in real-time
- [ ]  Signup creates user with FREE tier and redirects to login
- [ ]  NextAuth configured with credentials provider
- [ ]  JWT includes tier and role for authorization checks
- [ ]  Pages are mobile-responsive and touch-friendly
- [ ]  All forms are keyboard accessible
- [ ]  "Remember me" checkbox persists session (optional)
- [ ]  Venom theming consistent across all auth pages


**Purpose**: Central account settings page. Shows current tier, upgrade options, connected leagues, and preferences.

---

## Route

```
/account - Account management (requires authentication)
```

---

## Page Implementation

### app/account/page.tsx

```tsx
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AccountContent } from './AccountContent'

export const metadata: Metadata = {
  title: 'Account Settings · CustomVenom',
  description: 'Manage your account, subscription, and preferences.'
}

export default async function AccountPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login?callbackUrl=/account')
  }
  
  return <AccountContent session={session} />
}
```

### app/account/AccountContent.tsx

```tsx
'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  Link as LinkIcon,
  Settings,
  LogOut,
  Check,
  Zap
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AccountContentProps {
  session: Session
}

export function AccountContent({ session }: AccountContentProps) {
  const searchParams = useSearchParams()
  const upgradeParam = searchParams.get('upgrade')
  
  const [activeTab, setActiveTab] = useState(
    upgradeParam ? 'billing' : 'profile'
  )
  
  const tier = session.user.tier as string
  const role = session.user.role as string
  
  return (
    <div className="min-h-screen bg-field-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400">
            Manage your profile, subscription, and preferences
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 mb-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'leagues', label: 'Connected Leagues', icon: LinkIcon },
            { id: 'preferences', label: 'Preferences', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={[tab.id](http://tab.id)}
                onClick={() => setActiveTab([tab.id](http://tab.id))}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === [tab.id](http://tab.id)
                    ? 'border-venom-500 text-venom-500'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'profile' && <ProfileTab session={session} />}
        {activeTab === 'billing' && <BillingTab tier={tier} upgradeParam={upgradeParam} />}
        {activeTab === 'leagues' && <LeaguesTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
      </div>
    </div>
  )
}

// Profile Tab
function ProfileTab({ session }: { session: Session }) {
  const [name, setName] = useState([session.user.name](http://session.user.name) || '')
  const [loading, setLoading] = useState(false)
  
  const handleSave = async () => {
    setLoading(true)
    // TODO: API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }
  
  return (
    <div className="space-y-6">
      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={name}
              onChange={(e) => setName([e.target](http://e.target).value)}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              value={[session.user.email](http://session.user.email) || ''}
              disabled
              icon={<Mail className="h-4 w-4" />}
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change your email
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <div className="flex items-center gap-2">
              <Badge variant="venom">
                <Shield className="h-3 w-3 mr-1" />
                {session.user.role}
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
      
      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        
        <div className="space-y-4">
          <Button variant="outline">
            Change Password
          </Button>
          
          <Button 
            variant="danger"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Billing Tab
function BillingTab({ tier, upgradeParam }: { tier: string; upgradeParam: string | null }) {
  const plans = [
    {
      id: 'viper',
      name: 'Viper',
      icon: '⚡',
      price: 9.99,
      features: [
        'Full player database',
        'Start/Sit tool',
        'FAAB Bid Helper',
        'Connect Yahoo league',
        'Export to CSV'
      ]
    },
    {
      id: 'mamba',
      name: 'Mamba',
      icon: '🐍',
      price: 19.99,
      popular: true,
      features: [
        'Everything in Viper',
        'Face-Off matchup analyzer',
        'Kill Shots trade analyzer',
        'Strike Ranges projections',
        'API access (100 req/day)',
        'Priority support'
      ]
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card variant="dashboard">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-gray-400 text-sm">Manage your subscription</p>
          </div>
          <Badge variant={tier === 'MAMBA' ? 'strike' : tier === 'VIPER' ? 'venom' : 'default'}>
            {tier === 'FREE' ? '🆓 Hatchling' : tier === 'VIPER' ? '⚡ Viper' : '🐍 Mamba'}
          </Badge>
        </div>
        
        {tier === 'FREE' && (
          <div className="bg-venom-500/10 border border-venom-500/30 rounded-lg p-4">
            <p className="text-sm">
              You're currently on the free tier. Upgrade to unlock advanced analytics and tools.
            </p>
          </div>
        )}
        
        {(tier === 'VIPER' || tier === 'MAMBA') && (
          <div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-sm text-gray-400">Billing cycle</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-sm text-gray-400">Next billing date</span>
              <span className="font-medium">December 1, 2025</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-400">Payment method</span>
              <span className="font-medium">•••• 4242</span>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button variant="outline" size="sm">
                Update Payment Method
              </Button>
              <Button variant="ghost" size="sm">
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Upgrade Plans */}
      {tier !== 'MAMBA' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[plans.map](http://plans.map)(plan => (
              <Card 
                key={[plan.id](http://plan.id)}
                variant="dashboard"
                className={`relative ${
                  upgradeParam === [plan.id](http://plan.id) ? 'ring-2 ring-venom-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="strike">
                      <Zap className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{[plan.name](http://plan.name)}</h4>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg text-gray-400 font-normal">/mo</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {[plan.features.map](http://plan.features.map)((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-venom-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="primary" 
                  className="w-full"
                  disabled={tier === [plan.id](http://plan.id).toUpperCase()}
                >
                  {tier === [plan.id](http://plan.id).toUpperCase() ? 'Current Plan' : `Upgrade to ${[plan.name](http://plan.name)}`}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-3">
                  7-day free trial · Cancel anytime
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Leagues Tab
function LeaguesTab() {
  const leagues = [
    { id: '1', name: 'Main League 2025', provider: 'Yahoo', status: 'connected', lastSync: '2 hours ago' },
    { id: '2', name: 'Dynasty League', provider: 'Yahoo', status: 'connected', lastSync: '5 hours ago' }
  ]
  
  return (
    <div className="space-y-6">
      <Card variant="dashboard">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Connected Leagues</h3>
            <p className="text-gray-400 text-sm">Manage your fantasy football leagues</p>
          </div>
          <Button variant="primary" size="sm">
            <LinkIcon className="h-4 w-4 mr-2" />
            Connect New League
          </Button>
        </div>
        
        <div className="space-y-4">
          {[leagues.map](http://leagues.map)(league => (
            <div 
              key={[league.id](http://league.id)}
              className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
            >
              <div>
                <h4 className="font-medium mb-1">{[league.name](http://league.name)}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{league.provider}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-venom-500" />
                    {league.status}
                  </span>
                  <span>·</span>
                  <span>Synced {league.lastSync}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Sync Now
                </Button>
                <Button variant="ghost" size="sm">
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Preferences Tab
function PreferencesTab() {
  return (
    <div className="space-y-6">
      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme across the site</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-gray-400">Reduce spacing for more content</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </Card>
      
      <Card variant="dashboard">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive weekly lineup suggestions</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Injury Alerts</p>
              <p className="text-sm text-gray-400">Get notified when your players are injured</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </Card>
    </div>
  )
}
```

---

## Acceptance Criteria

- [ ]  Account page requires authentication (redirects to login if not signed in)
- [ ]  Displays current tier badge (Hatchling/Viper/Mamba)
- [ ]  Profile tab shows name, email, role
- [ ]  Billing tab shows current plan and upgrade options
- [ ]  Upgrade cards highlight if `?upgrade=` param present
- [ ]  Leagues tab shows connected fantasy leagues
- [ ]  Preferences tab has toggles for dark mode, compact mode, notifications
- [ ]  Sign out button works correctly
- [ ]  Mobile responsive with proper tab navigation
- [ ]  Venom theming consistent throughout


**Purpose**: Complete database schema for users, authentication, permissions, and subscriptions. Ready for live data integration.

---

## Prisma Schema (Full)

### prisma/schema.prisma

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String    // bcrypt hashed, nullable for OAuth-only users
  name          String?
  image         String?
  
  // Authorization
  tier          UserTier  @default(FREE)
  role          UserRole  @default(USER)
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  leagues       League[]
  subscription  Subscription?
  preferences   UserPreferences?
  apiKeys       ApiKey[]
  
  @@index([email])
  @@index([tier])
}

enum UserTier {
  FREE      // Hatchling - public projections only
  VIPER     // $9.99/month - full dashboard access
  MAMBA     // $19.99/month - advanced tools + API
}

enum UserRole {
  USER       // Standard user
  ADMIN      // Full access + user management
  DEVELOPER  // API access + debug tools (bypass paywalls in dev)
}

// NextAuth Account (OAuth providers)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String   // 'oauth' | 'email' | 'credentials'
  provider          String   // 'yahoo', 'google', etc.
  providerAccountId String
  
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

// NextAuth Session
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([sessionToken])
}

// Email verification tokens
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  
  // Subscription details
  tier              UserTier
  status            SubscriptionStatus @default(ACTIVE)
  
  // Billing
  stripeCustomerId       String? @unique
  stripeSubscriptionId   String? @unique
  stripePriceId          String?
  
  // Dates
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  cancelAtPeriodEnd      Boolean  @default(false)
  canceledAt             DateTime?
  trialStart             DateTime?
  trialEnd               DateTime?
  
  // Metadata
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}

enum SubscriptionStatus {
  ACTIVE          // Paying and active
  TRIALING        // In free trial
  PAST_DUE        // Payment failed
  CANCELED        // User canceled
  INCOMPLETE      // Stripe checkout incomplete
  INCOMPLETE_EXPIRED
}

// ============================================
// FANTASY LEAGUES
// ============================================

model League {
  id          String   @id @default(cuid())
  userId      String
  
  // Provider info
  provider    LeagueProvider
  leagueKey   String        // Provider's league ID
  leagueName  String
  
  // Season & sport
  season      Int           // e.g., 2025
  gameType    String        // 'nfl' (future: 'nba')
  
  // Scoring settings (stored for local calculations)
  scoringType String        // 'PPR', 'HALF_PPR', 'STANDARD'
  
  // Connection status
  connected   Boolean       @default(true)
  lastSync    DateTime      @default(now())
  syncError   String?
  
  // Metadata
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  rosters     Roster[]
  
  @@unique([userId, provider, leagueKey])
  @@index([userId])
  @@index([provider])
}

enum LeagueProvider {
  YAHOO
  ESPN
  SLEEPER
}

// User's roster in a league
model Roster {
  id              String   @id @default(cuid())
  leagueId        String
  
  // Team info
  teamKey         String   // Provider's team ID
  teamName        String
  
  // Current players (JSON array of player
```