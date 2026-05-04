# Dark Mode Redesign — Kami Warm Palette

## Goal

Replace the current cool-toned dark mode with a warm, Kami-aligned palette. The light mode stays substantially intact (one minor fix: destructive red).

## Scope

- **1 CSS file**: `web/src/index.css` — `.dark` block + `:root` destructive fix
- **3 component files**: `AllocationCompare.tsx`, `AllocationHistory.tsx`, `RebalanceList.tsx` — replace hardcoded colors with CSS variable references
- **No structural changes**: no DOM, layout, or logic changes

---

## 1. CSS Token Changes

### 1.1 Dark mode (`.dark` block)

Replace every cool-gray/blue value with warm equivalents:

| Token | Current | New | Rationale |
|-------|---------|-----|-----------|
| `--color-parchment` | `#0f1117` | `#141413` | Page bg: warm near-black with olive undertone |
| `--color-ivory` | `#181a21` | `#1c1c1a` | Card bg: warm paper-dark |
| `--color-deep` | `#e4e0d7` | `#e4ddd0` | Foreground text: warm cream |
| `--color-olive` | `#b0a99d` | `#b0a99d` | Secondary text (unchanged) |
| `--color-stone` | `#959086` | `#959086` | Muted text (unchanged) |
| `--color-sand` | `#262830` | `#2a2a27` | Border: warm gray |
| `--color-sand-soft` | `#1d1f27` | `#21211e` | Muted surface: warm dark |
| `--color-brand` | `#699ecc` | `#2D5A8A` | Primary accent: ink blue (Kami) |
| `--color-brand-light` | `#8ab8dd` | `#8ab8dd` | Link on dark (unchanged) |
| `--color-dark-surface` | `#181a21` | `#1c1c1a` | Dark surface alias |
| `--color-dark-warm` | `#262830` | `#30302e` | Secondary surface (Kami dark surface) |

Shadcn CSS variables follow the same mapping:

| Variable | Current | New |
|----------|---------|-----|
| `--background` | `#0f1117` | `#141413` |
| `--foreground` | `#e4e0d7` | `#e4ddd0` |
| `--card` | `#181a21` | `#1c1c1a` |
| `--card-foreground` | `#e4e0d7` | `#e4ddd0` |
| `--popover` | `#181a21` | `#1c1c1a` |
| `--popover-foreground` | `#e4e0d7` | `#e4ddd0` |
| `--primary` | `#699ecc` | `#2D5A8A` |
| `--primary-foreground` | `#0f1117` | `#faf9f5` |
| `--secondary` | `#262830` | `#30302e` |
| `--secondary-foreground` | `#e4e0d7` | `#e4ddd0` |
| `--muted` | `#1d1f27` | `#21211e` |
| `--muted-foreground` | `#959086` | `#959086` |
| `--accent` | `#699ecc` | `#2D5A8A` |
| `--accent-foreground` | `#0f1117` | `#faf9f5` |
| `--destructive` | `#c96060` | `#c96060` (unchanged) |
| `--border` | `#262830` | `#2a2a27` |
| `--input` | `#262830` | `#2a2a27` |
| `--ring` | `#699ecc` | `#2D5A8A` |

### 1.2 Chart colors (dark mode)

| Token | Current | New | Rationale |
|-------|---------|-----|-----------|
| `--chart-1` | `#6db58a` | `#6db58a` | Warm green, keep |
| `--chart-2` | `#c4a355` | `#c4a355` | Warm gold, keep |
| `--chart-3` | `#6ea5d6` | `#5a8ab5` | **Sky blue → warm ink blue** |
| `--chart-4` | `#9b7fc0` | `#9b7fc0` | Warm purple, keep |
| `--chart-5` | `#cf7a7a` | `#cf7a7a` | Warm red, keep |

### 1.3 Light mode fix (`:root`)

| Variable | Current | New | Rationale |
|----------|---------|-----|-----------|
| `--destructive` | `#b91c1c` | `#B53333` | Match Kami "深暖红，不刺眼" |

---

## 2. Component Hardcoded Color Fixes

### 2.1 AllocationCompare.tsx

| Element | Current | Replace with |
|---------|---------|-------------|
| "当前" bar `fill` | `"#1B365D"` | `"var(--primary)"` |
| "目标" bar `fill` | `"#e8e6dc"` | `"var(--secondary)"` |
| Grid `stroke` | `"#e8e6dc"` | `"var(--border)"` |
| XAxis tick `fill` | `"#6b6a64"` | `"var(--muted-foreground)"` |
| YAxis tick `fill` | `"#6b6a64"` | `"var(--muted-foreground)"` |
| Tooltip `background` | `"#faf9f5"` | `"var(--card)"` |
| Tooltip `border` | `"1px solid #e8e6dc"` | `"1px solid var(--border)"` |

### 2.2 AllocationHistory.tsx

| Element | Current | Replace with |
|---------|---------|-------------|
| Line `COLORS` array | `['#1B365D', '#2d6a4f', '#b08d4b', '#6b4c8a', '#b5454a', '#3d7a8a', '#78716c']` | `['var(--chart-3)','var(--chart-1)','var(--chart-2)','var(--chart-4)','var(--chart-5)','var(--chart-3)','var(--chart-2)']` |
| Grid `stroke` | `"#e8e6dc"` | `"var(--border)"` |
| XAxis tick `fill` | `"#6b6a64"` | `"var(--muted-foreground)"` |
| YAxis tick `fill` | `"#6b6a64"` | `"var(--muted-foreground)"` |
| Tooltip `background` | `"#faf9f5"` | `"var(--card)"` |
| Tooltip `border` | `"1px solid #e8e6dc"` | `"1px solid var(--border)"` |
| Legend text `color` | `"#6b6a64"` | `"var(--muted-foreground)"` |

Note: CSS custom properties in Recharts `stroke` props work because Recharts passes them through to SVG elements where the browser resolves them.

### 2.3 RebalanceList.tsx

| Element | Current | Replace with | Note |
|---------|---------|-------------|------|
| Severe border | `border-[#b91c1c]/20` | `border-destructive/20` | Tailwind resolves `--destructive` |
| Severe bg | `bg-red-50/30` | `bg-destructive/10` | Tailwind opacity modifier on CSS var |
| Severe text/icon | `text-[#b91c1c]` | `text-destructive` | Already a Tailwind semantic token |
| Under-allocated icon/text | `text-[#2d6a4f]` | `text-chart-1` | Tailwind resolves `--chart-1` |
| Over-allocated icon | `text-[#b08d4b]` | `text-chart-2` | Tailwind resolves `--chart-2` |
| CheckCircle icon | `text-[#2d6a4f]` | `text-chart-1` | Same as under-allocated |
| Non-severe border | `border-sand/60` | keep | `--color-sand` already adapts to mode |
| Non-severe bg | `bg-parchment/50` | keep | `--color-parchment` already adapts to mode |

Tailwind classes like `text-destructive`, `bg-destructive/10`, `text-chart-1` work because
the `@theme inline` block in `index.css` maps each `--<name>` to a Tailwind color token.

### 2.4 Components requiring no changes

- `AssetPieChart.tsx` — already uses `var(--chart-1)` through `var(--chart-5)`
- `FireGauge.tsx` — dynamically picks `var(--chart-1)`, `var(--chart-2)`, `var(--destructive)`
- `NetWorthCard.tsx` — uses `text-chart-1`, `text-destructive`, `text-brand` (Tailwind tokens mapped to CSS vars)
- `FireTimeline.tsx` — uses `bg-brand` (CSS var)

---

## 3. Design Principles (from Kami)

- All grays must have warm (yellow-brown) undertone — no cool blue-grays
- Ink blue accent coverage under 5% of any page
- Dark background never pure black — retain olive undertone
- Text on dark is warm cream, never pure white
- Destructive red is deep warm red, not harsh bright

---

## 4. What Stays the Same

- Light mode palette (except destructive `#b91c1c` → `#B53333`)
- All DOM structure, component logic, API calls
- Font system (serif for headings, sans for UI)
- Paper texture overlay
- All layout, spacing, animations
- NavBar, Layout, forms, modals, buttons (already driven by shadcn CSS vars)
