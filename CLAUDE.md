# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`free` is a personal asset allocation & FIRE tracking tool. Chinese UI (zh-CN), single-user ("default" userId hardcoded in `server/src/config.ts`).

## Commands

```bash
bun dev          # Run server + web concurrently
bun run up       # Same, using `& wait` instead of turbo
bun run build    # Build all packages

# Lint & format (Biome)
bun run lint     # Check for errors
bun run format   # Auto-fix format + lint issues
bun run ci       # CI mode (checks only, no writes)

# Database (requires running PostgreSQL, DATABASE_URL in server/.env)
bun run db:migrate   # Apply Prisma migrations
bun run db:seed      # Seed sample data
bun run db:studio    # Open Prisma Studio GUI
```

The `dev`/`build` scripts at root delegate to `turbo run dev`/`build`. No test suite exists yet.

## Lint & Format

Biome is used for both linting and formatting. Configuration at `biome.json`:
- Single quotes, semicolons, trailing commas, 2-space indent, 100 char line width
- `bun run lint` checks; `bun run format` auto-fixes; `bun run ci` for strict CI mode
- `noConsole`, `noExplicitAny`, `noNonNullAssertion`, `noAssignInExpressions`, and `noLabelWithoutControl` are turned off to accommodate existing patterns

## UI Components (shadcn/ui)

**CRITICAL — Before using any native HTML form element (`<select>`, `<input type="range">`, `<input type="date">`, toggle `<button>`), check if shadcn has a corresponding component FIRST.**

This project uses `@base-ui/react` primitives (NOT Radix UI). shadcn components use the `render` prop pattern instead of `asChild`:

```tsx
// @base-ui/react pattern (correct):
<PopoverTrigger render={<Button ... />} />

// Radix pattern (NOT used in this project):
<PopoverTrigger asChild><Button ... /></PopoverTrigger>
```

Available shadcn components in `web/src/components/ui/`:

| Component | Primitive | When to use |
|-----------|-----------|-------------|
| Button | `@base-ui/react/button` | All buttons. Variants: default / outline / secondary / ghost / destructive / link |
| Select | `@base-ui/react/select` | Replace native `<select>`. Uses `onValueChange(v)` not native onChange |
| Slider | `@base-ui/react/slider` | Replace native `<input type="range">`. `value` is `number[]`, `onValueChange(v: number \| number[])` |
| DatePicker | react-day-picker + Popover | Replace native `<input type="date">`. `value: string`, `onChange(v: string)` |
| Calendar | react-day-picker | Month grid. Used inside DatePicker |
| Popover | `@base-ui/react/popover` | Floating panels. `PopoverTrigger` uses `render` prop |
| Input | native `<input>` | Styled text/number input wrapper |
| Badge | — | Inline status indicator |
| Card | — | Card layout container |
| Dialog | — | Modal dialog (alternative to custom Modal) |

To add a new shadcn component: run from `web/` directory:
```bash
bunx shadcn@latest add @shadcn/<name>
```
After adding, ALWAYS run `bun run format` — shadcn uses double quotes but this project uses single quotes.

## Architecture

Monorepo managed by Bun workspaces + Turborepo. Three packages:

### shared (`shared/`)
Shared TypeScript types consumed by both server and web. Package name `@free/shared`, entry `src/types.ts`. Defines all domain types: `Asset`, `Liability`, `FireProfile`, `AllocationTarget`, `NetWorthSummary`, `Snapshot`, plus v2 types: `MarketPrice`, `ExchangeRate`, `Transaction`, `ReturnAnalysis`, `RebalanceAlert`, `RebalanceAlertStatus`.

### server (`server/`)
Fastify HTTP server on port 3001 (configurable via `PORT` env). Structure:
- `src/index.ts` — entry point, creates and starts the Fastify app, registers price adapters and starts schedulers
- `src/app.ts` — app factory: registers CORS + 11 route plugins under `/api` prefix
- `src/config.ts` — env-derived config (port, hardcoded userId)
- `src/lib/prisma.ts` — Prisma client singleton using `@prisma/adapter-pg`
- `src/lib/calculations.ts` — pure calculation functions (sumTotalAssets, computeCategoryBreakdown, v2 rate-aware variants)
- `src/lib/exchangeRate.ts` — builds rate lookup map from ExchangeRate table (with fallback to properties.exchangeRate)
- `src/lib/PriceService.ts` — adapter registry, fetch scheduler (15min interval), price→asset sync
- `src/lib/ExchangeRateService.ts` — exchange rate fetch scheduler (24h interval)
- `src/lib/ReturnCalculator.ts` — TWR + simple return + contribution analysis
- `src/lib/RebalanceChecker.ts` — deviation threshold checking with ExchangeRate table
- `src/lib/adapters/` — PriceAdapter interface + 6 implementations (AStock, HStock, UStock, Fund, Crypto, ExchangeRate)
- `src/routes/*.ts` — route handler files, one per domain

Route mapping:
| File | Prefix |
|------|--------|
| `routes/assets.ts` | `/api/assets` |
| `routes/liabilities.ts` | `/api/liabilities` |
| `routes/netWorth.ts` | `/api/net-worth` |
| `routes/fireProfile.ts` | `/api` (registers `/fire-profile`, `/fire-progress`) |
| `routes/allocation.ts` | `/api` (registers `/allocation-targets`, `/allocation-analysis`) |
| `routes/snapshots.ts` | `/api/snapshots` |
| `routes/prices.ts` | `/api/prices` (GET /, POST /refresh, POST /refresh/:id) |
| `routes/exchangeRates.ts` | `/api/exchange-rates` (GET /, POST /refresh) |
| `routes/transactions.ts` | `/api/transactions` (CRUD + costBasis recalculation) |
| `routes/returns.ts` | `/api/returns` (GET /, GET /:assetId) |
| `routes/rebalanceAlerts.ts` | `/api/rebalance-alerts` (GET /, PUT /) |

Prisma ORM with PostgreSQL. Schema has 9 models: `Asset`, `Liability`, `FireProfile`, `AllocationTarget`, `Snapshot`, `MarketPrice`, `ExchangeRate`, `Transaction`, `RebalanceAlert` — all scoped to `userId`. Adapter is `@prisma/adapter-pg` (not the default `pg` pool).

Asset model has v2 fields: `tickerSymbol`, `exchangeCode`, `priceSource` (MANUAL/AUTO), `costBasis`, `priceUpdatedAt`.

### web (`web/`)
React 19 SPA, Vite dev server on port 5173 with `/api` proxy to `localhost:3001`. Five routes via react-router-dom:
- `/` — Asset overview (assets + liabilities + net worth + snapshots + price refresh)
- `/fire` — FIRE tracker (fire number gauge, passive income timeline)
- `/allocation` — Allocation analysis (pie chart, target vs actual, rebalance suggestions, threshold alerts)
- `/returns` — Return attribution (TWR, per-asset return & contribution)
- `/transactions` — Transaction list (buy/sell/dividend/fee CRUD)

**Data flow**: Each page uses custom hooks in `web/src/hooks/` (`useAssets`, `useLiabilities`, `useNetWorth`, `useFireProfile`, `useAllocation`, `usePrices`, `useTransactions`, `useReturns`, `useRebalanceAlerts`) — they call the typed API client at `web/src/lib/api.ts`, manage local state, and return data + CRUD methods. After mutations, hooks refetch from the server.

**Styling**: Tailwind CSS v4 with a custom "Kami 紙" theme — warm parchment/ink aesthetic. Serif body font (TsangerJinKai02 stack), sans-serif UI font (Geist Variable). Light/dark mode via `.dark` class on `<html>`, persisted in `localStorage` key `free-theme`. Design tokens defined in `web/src/index.css`.

**UI Components**: shadcn/ui primitives in `web/src/components/ui/`. Application components in `web/src/components/` — PriceBadge, AssetForm/LiabilityForm, AssetList/LiabilityList, TransactionForm, AssetPieChart, FireGauge, FireTimeline, AllocationCompare, AllocationHistory, RebalanceList, NetWorthCard, Skeleton, ConfirmDialog, Modal.

## Database

PostgreSQL. The connection string `DATABASE_URL` goes in `server/.env`. Prisma 7 with pg adapter. Run migrations before first use.

## Notes

- No auth — single-user mode, all data belongs to `userId: "default"`
- No automated tests are configured
- The `web/dist/` directory has build output; `dist/` is gitignored in root `.gitignore`
- The dark mode is applied via an inline script in `web/index.html` before React mounts to prevent FOUC
- Alpha Vantage API key for US stocks is in `server/.env` as `ALPHA_VANTAGE_API_KEY`
- After merging schema changes, run `bun run prisma generate` in `server/` to regenerate Prisma client
- Price adapters register on server start; schedulers run automatically (prices: 15min, rates: 24h)
