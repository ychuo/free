# Dark Mode Redesign — Kami Warm Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace cool-toned dark mode CSS with warm Kami-aligned palette, and fix hardcoded colors in chart/rebalance components to use CSS variables.

**Architecture:** 4 files total — 1 CSS variables file (`.dark` block rewrite + `:root` destructive fix) and 3 React components (replace hardcoded hex values with Tailwind semantic classes and `var()` references). No structural, logic, or DOM changes.

**Tech Stack:** Tailwind CSS v4, React + TypeScript, Recharts, shadcn/ui

---

### Task 1: Rewrite `.dark` CSS block with warm Kami palette

**Files:**
- Modify: `web/src/index.css:79-115`

- [ ] **Step 1: Replace the `.dark` block**

Replace lines 79-115 (the entire `.dark { ... }` block) with:

```css
/* ── Dark mode: Kami warm palette ── */
.dark {
  --color-parchment: #141413;
  --color-ivory: #1c1c1a;
  --color-deep: #e4ddd0;
  --color-olive: #b0a99d;
  --color-stone: #959086;
  --color-sand: #2a2a27;
  --color-sand-soft: #21211e;
  --color-brand: #2D5A8A;
  --color-brand-light: #8ab8dd;
  --color-dark-surface: #1c1c1a;
  --color-dark-warm: #30302e;
  --background: #141413;
  --foreground: #e4ddd0;
  --card: #1c1c1a;
  --card-foreground: #e4ddd0;
  --popover: #1c1c1a;
  --popover-foreground: #e4ddd0;
  --primary: #2D5A8A;
  --primary-foreground: #faf9f5;
  --secondary: #30302e;
  --secondary-foreground: #e4ddd0;
  --muted: #21211e;
  --muted-foreground: #959086;
  --accent: #2D5A8A;
  --accent-foreground: #faf9f5;
  --destructive: #c96060;
  --border: #2a2a27;
  --input: #2a2a27;
  --ring: #2D5A8A;
  --chart-1: #6db58a;
  --chart-2: #c4a355;
  --chart-3: #5a8ab5;
  --chart-4: #9b7fc0;
  --chart-5: #cf7a7a;
}
```

- [ ] **Step 2: Verify the file parses correctly**

Run: `cd /Users/chao/workspace/free/web && npx tsc --noEmit --incremental false 2>&1 | head -5`

Expected: No new TypeScript errors (there may be pre-existing ones).

- [ ] **Step 3: Commit**

```bash
git add web/src/index.css
git commit -m "fix: warm Kami dark mode palette replacing cool obsidian tones

- Page bg #0f1117 → #141413 (olive-undertone near-black)
- Card bg #181a21 → #1c1c1a (warm paper-dark)
- Primary accent #699ecc → #2D5A8A (ink blue)
- Border #262830 → #2a2a27 (warm gray)
- Chart-3 #6ea5d6 → #5a8ab5 (warm ink blue)
- All surfaces follow Kami rule: warm undertone, no cool blue-grays"
```

---

### Task 2: Fix `:root` destructive red to match Kami

**Files:**
- Modify: `web/src/index.css:68`

- [ ] **Step 1: Replace `--destructive` in `:root`**

Change line 68 from:
```css
  --destructive: #b91c1c;
```
to:
```css
  --destructive: #B53333;
```

- [ ] **Step 2: Verify**

Run: `cd /Users/chao/workspace/free/web && npx tsc --noEmit --incremental false 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add web/src/index.css
git commit -m "fix: change light-mode destructive red #b91c1c → #B53333 (Kami warm red)"
```

---

### Task 3: Fix AllocationCompare.tsx hardcoded colors

**Files:**
- Modify: `web/src/components/AllocationCompare.tsx`

- [ ] **Step 1: Replace hardcoded colors with CSS variable references**

Make these changes in `AllocationCompare.tsx`:

**Line 21** — Grid stroke:
```tsx
// Before:
<CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" />
// After:
<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
```

**Lines 22-23** — Axis ticks:
```tsx
// Before:
<XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} unit="%" />
// After:
<XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="%" />
```

**Lines 25-27** — Tooltip style:
```tsx
// Before:
contentStyle={{
  background: '#faf9f5', border: '1px solid #e8e6dc', borderRadius: '8px',
  fontSize: '12px', fontFamily: 'var(--font-serif)',
}}
// After:
contentStyle={{
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px',
  fontSize: '12px', fontFamily: 'var(--font-serif)',
}}
```

**Line 31** — "当前" bar fill:
```tsx
// Before:
<Bar dataKey="当前" fill="#1B365D" radius={[3, 3, 0, 0]} maxBarSize={24} />
// After:
<Bar dataKey="当前" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={24} />
```

**Line 32** — "目标" bar fill:
```tsx
// Before:
<Bar dataKey="目标" fill="#e8e6dc" radius={[3, 3, 0, 0]} maxBarSize={24} />
// After:
<Bar dataKey="目标" fill="var(--secondary)" radius={[3, 3, 0, 0]} maxBarSize={24} />
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd /Users/chao/workspace/free/web && npx tsc --noEmit --incremental false 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add web/src/components/AllocationCompare.tsx
git commit -m "fix: replace hardcoded colors in AllocationCompare with CSS var references

Bar fills → var(--primary) / var(--secondary), grid → var(--border),
ticks → var(--muted-foreground), tooltip → var(--card)"
```

---

### Task 4: Fix AllocationHistory.tsx hardcoded colors

**Files:**
- Modify: `web/src/components/AllocationHistory.tsx`

- [ ] **Step 1: Replace the COLORS array**

Line 4 — change from:
```tsx
const COLORS = ['#1B365D', '#2d6a4f', '#b08d4b', '#6b4c8a', '#b5454a', '#3d7a8a', '#78716c'];
```
to:
```tsx
const COLORS = ['var(--chart-3)', 'var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-3)', 'var(--chart-2)'];
```

**Line 41** — Grid stroke:
```tsx
// Before:
<CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" />
// After:
<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
```

**Lines 42-43** — Axis ticks:
```tsx
// Before:
<XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} unit="%" />
// After:
<XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="%" />
```

**Lines 44-47** — Tooltip style:
```tsx
// Before:
contentStyle={{
  background: '#faf9f5', border: '1px solid #e8e6dc', borderRadius: '8px',
  fontSize: '12px', fontFamily: 'var(--font-serif)',
}}
// After:
contentStyle={{
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px',
  fontSize: '12px', fontFamily: 'var(--font-serif)',
}}
```

**Line 51** — Legend formatter:
```tsx
// Before:
<Legend formatter={(value: string) => <span style={{ fontSize: '11px', color: '#6b6a64' }}>{value}</span>} />
// After:
<Legend formatter={(value: string) => <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{value}</span>} />
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd /Users/chao/workspace/free/web && npx tsc --noEmit --incremental false 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add web/src/components/AllocationHistory.tsx
git commit -m "fix: replace hardcoded colors in AllocationHistory with CSS var references

Line colors → var(--chart-N), grid → var(--border),
ticks/legend → var(--muted-foreground), tooltip → var(--card)"
```

---

### Task 5: Fix RebalanceList.tsx hardcoded colors

**Files:**
- Modify: `web/src/components/RebalanceList.tsx`

- [ ] **Step 1: Replace all hardcoded color references**

**Line 20** — CheckCircle icon color:
```tsx
// Before:
<CheckCircle2 className="h-8 w-8 text-[#2d6a4f] mb-2" />
// After:
<CheckCircle2 className="h-8 w-8 text-chart-1 mb-2" />
```

**Line 39** — Severe/non-severe container className:
```tsx
// Before:
severe ? 'border-[#b91c1c]/20 bg-red-50/30' : 'border-sand/60 bg-parchment/50'
// After:
severe ? 'border-destructive/20 bg-destructive/10' : 'border-sand/60 bg-parchment/50'
```

**Lines 44-46** — Arrow icons:
```tsx
// Before:
<ArrowUpRight className={cn('h-3.5 w-3.5', severe ? 'text-[#b91c1c]' : 'text-[#b08d4b]')} />
// After:
<ArrowUpRight className={cn('h-3.5 w-3.5', severe ? 'text-destructive' : 'text-chart-2')} />

// Before:
<ArrowDownRight className={cn('h-3.5 w-3.5', severe ? 'text-[#b91c1c]' : 'text-[#2d6a4f]')} />
// After:
<ArrowDownRight className={cn('h-3.5 w-3.5', severe ? 'text-destructive' : 'text-chart-1')} />
```

**Line 51** — Deviation percentage text:
```tsx
// Before:
<p className={cn('text-[12px] font-medium', a.deviation > 0 ? 'text-[#b91c1c]' : 'text-[#2d6a4f]')}>
// After:
<p className={cn('text-[12px] font-medium', a.deviation > 0 ? 'text-destructive' : 'text-chart-1')}>
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd /Users/chao/workspace/free/web && npx tsc --noEmit --incremental false 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add web/src/components/RebalanceList.tsx
git commit -m "fix: replace hardcoded colors in RebalanceList with Tailwind semantic classes

Severe over-allocation → text-destructive/bg-destructive,
under-allocation → text-chart-1, over-allocation icon → text-chart-2"
```

---

### Task 6: Visual verification

- [ ] **Step 1: Start dev server**

```bash
cd /Users/chao/workspace/free/web && npx vite --port 5173 &
sleep 3
```

- [ ] **Step 2: Verify light mode**

Open http://localhost:5173 in a browser. Check:
- Overview page: cards show parchment bg, ink blue accent
- Allocation page: bar chart uses ink blue "当前" bar, sand "目标" bar
- Destructive red is warm `#B53333` (not the old `#b91c1c`)

- [ ] **Step 3: Toggle dark mode and verify**

Toggle to dark mode and check:
- Page background is warm near-black (not cool blue-black)
- Card surfaces are warm dark (`#1c1c1a`)
- Accent is ink blue (`#2D5A8A`), not sky blue (`#699ecc`)
- Bar chart fills adapt to dark mode
- Rebalance list uses `text-destructive`/`text-chart-1`/`text-chart-2` from CSS vars
- All text is warm cream, never pure white
- Borders are warm gray, never cool gray

- [ ] **Step 4: Commit if any fixes needed, or confirm done**
