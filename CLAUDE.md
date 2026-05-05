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

## Architecture

Monorepo managed by Bun workspaces + Turborepo. Three packages:

### shared (`shared/`)
Shared TypeScript types consumed by both server and web. Package name `@free/shared`, entry `src/types.ts`. Defines all domain types: `Asset`, `Liability`, `FireProfile`, `AllocationTarget`, `NetWorthSummary`, `Snapshot`, and their create/update input types.

### server (`server/`)
Fastify HTTP server on port 3001 (configurable via `PORT` env). Structure:
- `src/index.ts` — entry point, creates and starts the Fastify app
- `src/app.ts` — app factory: registers CORS + route plugins under `/api` prefix
- `src/config.ts` — env-derived config (port, hardcoded userId)
- `src/lib/prisma.ts` — Prisma client singleton using `@prisma/adapter-pg`
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

Prisma ORM with PostgreSQL. Schema has 5 models: `Asset`, `Liability`, `FireProfile`, `AllocationTarget`, `Snapshot` — all scoped to `userId`. Adapter is `@prisma/adapter-pg` (not the default `pg` pool).

### web (`web/`)
React 19 SPA, Vite dev server on port 5173 with `/api` proxy to `localhost:3001`. Three routes via react-router-dom:
- `/` — Asset overview (assets + liabilities + net worth + snapshots)
- `/fire` — FIRE tracker (fire number gauge, passive income timeline)
- `/allocation` — Allocation analysis (pie chart, target vs actual, rebalance suggestions)

**Data flow**: Each page uses custom hooks in `web/src/hooks/` (`useAssets`, `useLiabilities`, `useNetWorth`, `useFireProfile`, `useAllocation`) — they call the typed API client at `web/src/lib/api.ts`, manage local state, and return data + CRUD methods. After mutations, hooks refetch from the server.

**Styling**: Tailwind CSS v4 with a custom "Kami 紙" theme — warm parchment/ink aesthetic. Serif body font (TsangerJinKai02 stack), sans-serif UI font (Geist Variable). Light/dark mode via `.dark` class on `<html>`, persisted in `localStorage` key `free-theme`. Design tokens defined in `web/src/index.css`.

**UI Components**: shadcn/ui primitives in `web/src/components/ui/`. Application components in `web/src/components/` — modal forms for assets/liabilities, pie chart, FIRE gauge, allocation comparison, etc.

## Database

PostgreSQL. The connection string `DATABASE_URL` goes in `server/.env`. Prisma 7 with pg adapter. Run migrations before first use.

## Notes

- No auth — single-user mode, all data belongs to `userId: "default"`
- No automated tests are configured
- The `web/dist/` directory has build output; `dist/` is gitignored in root `.gitignore`
- The dark mode is applied via an inline script in `web/index.html` before React mounts to prevent FOUC
