# v2 智能化阶段 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现市场行情接入、价格自动更新、收益归因（完整版含 TWR）、动态再平衡提醒

**Architecture:** 适配器模式 — PriceAdapter 接口统一各市场数据源，PriceService 注册调度，ReturnCalculator 基于 Transaction 表计算 TWR，RebalanceChecker 检测偏离度阈值

**Tech Stack:** Fastify + Prisma + PostgreSQL (server), React 19 + Vite + Tailwind CSS v4 + shadcn/ui (web), Bun + Turborepo (monorepo)

---

## File Map

| Module | Files | What |
|--------|-------|------|
| Data | `server/prisma/schema.prisma` | Add 5 fields to Asset, 4 new models |
| Shared | `shared/src/types.ts` | All new types, enums, JSON schemas |
| Adapters | `server/src/lib/adapters/*.ts` (7 files) | PriceAdapter interface + 6 implementations |
| Services | `server/src/lib/{PriceService,ExchangeRateService,ReturnCalculator,RebalanceChecker}.ts` | Business logic |
| Routes | `server/src/routes/{prices,exchangeRates,transactions,returns,rebalanceAlerts}.ts` (5 files) | API endpoints |
| App | `server/src/{app,index}.ts`, `server/src/lib/calculations.ts` | Registration + scheduler + calc update |
| Web API | `web/src/lib/api.ts` | New endpoints |
| Hooks | `web/src/hooks/{usePrices,useTransactions,useReturns,useRebalanceAlerts}.ts` (4 files) | Data hooks |
| Pages | `web/src/pages/{ReturnAttribution,TransactionList}.tsx` (2 new) | New pages |
| Components | `web/src/components/{PriceBadge,TransactionForm}.tsx` (2 new) | New components |
| Enhanced | `AssetOverview.tsx`, `AllocationAnalysis.tsx`, `AssetList.tsx`, `AssetForm.tsx`, `NavBar.tsx`, `App.tsx` | Modified files |

## Dependency Graph

```
Phase 1 (Foundation, sequential):
  Task 1 → Task 2 → Task 3

Phase 2 (Parallel after Task 2):
  Task 4 (remaining adapters), Task 6 (ReturnCalculator), Task 7 (RebalanceChecker)

Phase 3 (Depends on Task 4):
  Task 5 (PriceService + ExchangeRateService)

Phase 4 (Depends on Task 5+6+7):
  Task 8, 9, 10 (API routes) — parallel

Phase 5 (Depends on Task 8+9+10):
  Task 11 (register routes + scheduler)

Phase 6 (Depends on Task 11):
  Task 12 (API client + hooks)

Phase 7 (Depends on Task 12):
  Task 13, 14, 15, 16, 17 (frontend UI) — parallel
```

---

### Task 1: Data model — Prisma schema migration

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Add new fields to Asset model and create new models**

Replace `server/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Asset {
  id            String   @id @default(uuid())
  userId        String   @default("default")
  name          String
  category      String
  subType       String?
  tickerSymbol  String?
  exchangeCode  String?
  priceSource   String   @default("MANUAL")
  quantity      Float
  unitPrice     Float
  totalValue    Float
  currency      String   @default("CNY")
  costBasis     Float?
  passiveIncome Float?
  properties    Json?
  acquiredAt    DateTime?
  notes         String?
  priceUpdatedAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  transactions Transaction[]

  @@index([userId])
  @@index([userId, category])
}

model Liability {
  id             String   @id @default(uuid())
  userId         String   @default("default")
  name           String
  type           String
  totalAmount    Float
  remaining      Float
  interestRate   Float?
  monthlyPayment Float?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId])
}

model FireProfile {
  userId              String @id @default("default")
  annualExpense       Float
  safeWithdrawalRate  Float  @default(0.04)
  fireTarget          Float
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model AllocationTarget {
  id          String @id @default(uuid())
  userId      String @default("default")
  category    String
  targetRatio Float
  updatedAt   DateTime @updatedAt

  @@unique([userId, category])
  @@index([userId])
}

model Snapshot {
  id              String   @id @default(uuid())
  userId          String   @default("default")
  snapshotDate    DateTime @default(now())
  totalAssets     Float
  totalLiabilities Float
  netWorth        Float
  breakdown       Json
  createdAt       DateTime @default(now())

  @@index([userId, snapshotDate])
}

model MarketPrice {
  tickerSymbol    String
  exchangeCode    String
  name            String?
  currentPrice    Float
  previousClose   Float?
  dayChange       Float?
  dayChangePercent Float?
  updatedAt       DateTime @default(now())

  @@id([tickerSymbol, exchangeCode])
}

model ExchangeRate {
  fromCurrency String
  toCurrency   String   @default("CNY")
  rate         Float
  updatedAt    DateTime @default(now())

  @@id([fromCurrency, toCurrency])
}

model Transaction {
  id        String   @id @default(uuid())
  userId    String   @default("default")
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  type      String
  date      DateTime
  quantity  Float?
  price     Float?
  amount    Float
  fee       Float?   @default(0)
  notes     String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([assetId])
}

model RebalanceAlert {
  userId    String
  category  String
  threshold Float   @default(5)
  enabled   Boolean @default(true)

  @@id([userId, category])
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
cd server && bun run prisma migrate dev --name v2-intelligence
```

Expected: Migration applied, client regenerated.

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: Server builds without errors.

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations
git commit -m "feat: add v2 data model — MarketPrice, ExchangeRate, Transaction, RebalanceAlert tables"
```

---

### Task 2: Shared types + JSON schemas

**Files:**
- Modify: `shared/src/types.ts`

- [ ] **Step 1: Add all new types and schemas**

Add the following after the existing `ALLOCATION_TARGETS_SCHEMA`:

```typescript
// === v2: Price & Market ===

export enum PriceSource {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export const EXCHANGE_CODES = ['SH', 'SZ', 'HKEX', 'NYSE', 'NASDAQ', 'CRYPTO'] as const;
export type ExchangeCode = (typeof EXCHANGE_CODES)[number];

export interface MarketPrice {
  tickerSymbol: string;
  exchangeCode: string;
  name: string | null;
  currentPrice: number;
  previousClose: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  updatedAt: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: string;
}

// === v2: Transactions ===

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.BUY]: '买入',
  [TransactionType.SELL]: '卖出',
  [TransactionType.DIVIDEND]: '分红',
  [TransactionType.FEE]: '费用',
};

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: TransactionType;
  date: string;
  quantity: number | null;
  price: number | null;
  amount: number;
  fee: number | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  assetId: string;
  type: TransactionType;
  date: string;
  quantity?: number | null;
  price?: number | null;
  amount: number;
  fee?: number | null;
  notes?: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

// === v2: Returns ===

export interface AssetReturn {
  assetId: string;
  assetName: string;
  category: AssetCategory;
  costBasis: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  contribution: number;
  contributionPercent: number;
}

export interface ReturnAnalysis {
  twr: number | null;
  totalReturn: number;
  totalReturnPercent: number;
  perAsset: AssetReturn[];
  from: string;
  to: string;
}

// === v2: Rebalance Alerts ===

export interface RebalanceAlert {
  userId: string;
  category: AssetCategory;
  threshold: number;
  enabled: boolean;
}

export interface RebalanceAlertStatus {
  category: AssetCategory;
  currentRatio: number;
  targetRatio: number;
  deviation: number;
  threshold: number;
  triggered: boolean;
}

export interface UpdateRebalanceAlertsInput {
  alerts: { category: AssetCategory; threshold: number; enabled: boolean }[];
}

// === v2: Extended Asset type ===

export interface ExtendedAsset extends Asset {
  tickerSymbol: string | null;
  exchangeCode: string | null;
  priceSource: PriceSource;
  costBasis: number | null;
  priceUpdatedAt: string | null;
}

// === v2: JSON Schemas ===

export const TRANSACTION_SCHEMA = {
  type: 'object',
  required: ['assetId', 'type', 'date', 'amount'],
  properties: {
    assetId: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: Object.values(TransactionType) },
    date: { type: 'string' },
    quantity: { type: 'number' },
    price: { type: 'number' },
    amount: { type: 'number' },
    fee: { type: 'number' },
    notes: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const REBALANCE_ALERTS_SCHEMA = {
  type: 'object',
  required: ['alerts'],
  properties: {
    alerts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'threshold', 'enabled'],
        properties: {
          category: { type: 'string', enum: Object.values(AssetCategory) },
          threshold: { type: 'number', minimum: 1, maximum: 50 },
          enabled: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;
```

- [ ] **Step 2: Update Asset and CreateAssetInput to include new fields**

In `shared/src/types.ts`, update the `Asset` interface:

```typescript
export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subType: string | null;
  tickerSymbol: string | null;
  exchangeCode: string | null;
  priceSource: PriceSource;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  currency: string;
  costBasis: number | null;
  passiveIncome: number | null;
  properties: Record<string, unknown> | null;
  acquiredAt: string | null;
  notes: string | null;
  priceUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

Update `CreateAssetInput`:

```typescript
export interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  subType?: string;
  tickerSymbol?: string;
  exchangeCode?: string;
  priceSource?: PriceSource;
  quantity: number;
  unitPrice: number;
  currency?: string;
  passiveIncome?: number;
  properties?: Record<string, unknown>;
  acquiredAt?: string;
  notes?: string;
}
```

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: shared builds, server and web build successfully.

- [ ] **Step 4: Commit**

```bash
git add shared/src/types.ts
git commit -m "feat: add v2 shared types — PriceSource, Transaction, ReturnAnalysis, RebalanceAlert, schemas"
```

---

### Task 3: PriceAdapter interface

**Files:**
- Create: `server/src/lib/adapters/PriceAdapter.ts`

- [ ] **Step 1: Create the adapter interface**

```typescript
export interface PriceResult {
  tickerSymbol: string;
  exchangeCode: string;
  name?: string;
  currentPrice: number;
  previousClose?: number;
  dayChange?: number;
  dayChangePercent?: number;
  currency: string;
}

export interface PriceAdapter {
  readonly name: string;
  fetchPrices(symbols: string[]): Promise<PriceResult[]>;
  fetchPrice(symbol: string): Promise<PriceResult>;
  isAvailable(): Promise<boolean>;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/src/lib/adapters/PriceAdapter.ts
git commit -m "feat: add PriceAdapter interface"
```

---

### Task 4: All market adapters + ExchangeRate adapter

**Files:**
- Create: `server/src/lib/adapters/AStockAdapter.ts`
- Create: `server/src/lib/adapters/HStockAdapter.ts`
- Create: `server/src/lib/adapters/UStockAdapter.ts`
- Create: `server/src/lib/adapters/FundAdapter.ts`
- Create: `server/src/lib/adapters/CryptoAdapter.ts`
- Create: `server/src/lib/adapters/ExchangeRateAdapter.ts`

Each adapter follows the pattern: implement `PriceAdapter` interface, fetch from a specific data source, 10s timeout.

- [ ] **Step 1: Create AStockAdapter (东方财富)**

```typescript
import type { PriceAdapter, PriceResult } from './PriceAdapter';

// 东方财富 API — free, no key required
// Example: https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f43,f44,f45,f46,f47,f48,f57,f58,f169,f170
// secid format: market_code.ticker (1=SH, 0=SZ)

export class AStockAdapter implements PriceAdapter {
  readonly name = 'AStock';

  private marketCode(exchangeCode: string): string {
    return exchangeCode === 'SZ' ? '0' : '1';
  }

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    for (const s of symbols) {
      try {
        const r = await this.fetchPrice(s);
        results.push(r);
      } catch {
        // skip failed symbols
      }
    }
    return results;
  }

  async fetchPrice(tickerSymbol: string): Promise<PriceResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const [code, market = 'SH'] = tickerSymbol.split('.');
    const secid = `${this.marketCode(market)}.${code}`;
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f169,f170`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as any;
    const d = json.data;

    if (!d || d.f43 === undefined) throw new Error(`No data for ${tickerSymbol}`);

    return {
      tickerSymbol,
      exchangeCode: market,
      name: d.f58 as string | undefined,
      currentPrice: d.f43 / 100,
      previousClose: d.f60 ? d.f60 / 100 : undefined,
      dayChange: d.f169 ? d.f169 / 100 : undefined,
      dayChangePercent: d.f170 ? d.f170 / 100 : undefined,
      currency: 'CNY',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.fetchPrice('600519.SH');
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 2: Create HStockAdapter (港交所/东方财富)**

```typescript
import type { PriceAdapter, PriceResult } from './PriceAdapter';

// Uses eastmoney global API for HK stocks
// secid format: 116.00700 (116 = HK)

export class HStockAdapter implements PriceAdapter {
  readonly name = 'HStock';

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    for (const s of symbols) {
      try {
        const r = await this.fetchPrice(s);
        results.push(r);
      } catch {
        // skip
      }
    }
    return results;
  }

  async fetchPrice(tickerSymbol: string): Promise<PriceResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const cleanTicker = tickerSymbol.replace('.HK', '').replace('.HKEX', '');
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=116.${cleanTicker}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f169,f170`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as any;
    const d = json.data;

    if (!d || d.f43 === undefined) throw new Error(`No data for ${tickerSymbol}`);

    return {
      tickerSymbol,
      exchangeCode: 'HKEX',
      name: d.f58 as string | undefined,
      currentPrice: d.f43 / 100,
      previousClose: d.f60 ? d.f60 / 100 : undefined,
      dayChange: d.f169 ? d.f169 / 100 : undefined,
      dayChangePercent: d.f170 ? d.f170 / 100 : undefined,
      currency: 'HKD',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.fetchPrice('00700.HKEX');
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 3: Create UStockAdapter (Alpha Vantage)**

```typescript
import type { PriceAdapter, PriceResult } from './PriceAdapter';

// Alpha Vantage free tier: 5 calls/min, 500 calls/day
// API key from: https://www.alphavantage.co/support/#api-key
// Set ALPHA_VANTAGE_API_KEY in server/.env

export class UStockAdapter implements PriceAdapter {
  readonly name = 'UStock';

  private get apiKey(): string {
    return process.env.ALPHA_VANTAGE_API_KEY || '';
  }

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    // Alpha Vantage free tier allows batch quote via GLOBAL_QUOTE
    // But it's per-symbol. We fetch sequentially with rate limit.
    const results: PriceResult[] = [];
    for (const s of symbols) {
      try {
        const r = await this.fetchPrice(s);
        results.push(r);
        // Rate limit: max 5 per minute on free tier
        await new Promise((r) => setTimeout(r, 13_000));
      } catch {
        // skip
      }
    }
    return results;
  }

  async fetchPrice(tickerSymbol: string): Promise<PriceResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerSymbol}&apikey=${this.apiKey}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as any;
    const d = json['Global Quote'];

    if (!d || !d['05. price']) throw new Error(`No data for ${tickerSymbol}`);

    return {
      tickerSymbol,
      exchangeCode: 'NASDAQ',
      currentPrice: parseFloat(d['05. price']),
      previousClose: parseFloat(d['08. previous close']),
      dayChange: parseFloat(d['09. change']),
      dayChangePercent: parseFloat(d['10. change percent'].replace('%', '')),
      currency: 'USD',
    };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      await this.fetchPrice('AAPL');
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 4: Create FundAdapter (天天基金)**

```typescript
import type { PriceAdapter, PriceResult } from './PriceAdapter';

// 天天基金 API — free, no key
// Example: https://fundgz.1234567.com.cn/js/000001.js

export class FundAdapter implements PriceAdapter {
  readonly name = 'Fund';

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    for (const s of symbols) {
      try {
        const r = await this.fetchPrice(s);
        results.push(r);
      } catch {
        // skip
      }
    }
    return results;
  }

  async fetchPrice(tickerSymbol: string): Promise<PriceResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const url = `https://fundgz.1234567.com.cn/js/${tickerSymbol}.js`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const text = await res.text();
    const match = text.match(/jsonpgz\((.+)\)/);
    if (!match) throw new Error(`No data for fund ${tickerSymbol}`);

    const d = JSON.parse(match[1]);

    return {
      tickerSymbol,
      exchangeCode: 'FUND',
      name: d.name as string,
      currentPrice: parseFloat(d.dwjz),
      previousClose: parseFloat(d.jzrq),
      dayChangePercent: parseFloat(d.gszzl),
      currency: 'CNY',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.fetchPrice('000001');
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 5: Create CryptoAdapter (CoinGecko)**

```typescript
import type { PriceAdapter, PriceResult } from './PriceAdapter';

// CoinGecko free API — no key
// Rate limit: 10-30 calls/minute on free tier
// https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true

const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  DOGE: 'dogecoin',
};

export class CryptoAdapter implements PriceAdapter {
  readonly name = 'Crypto';

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    const ids = symbols.map((s) => COINGECKO_ID_MAP[s] || s.toLowerCase());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as Record<string, any>;

    const results: PriceResult[] = [];
    for (let i = 0; i < symbols.length; i++) {
      const data = json[ids[i]];
      if (data) {
        results.push({
          tickerSymbol: symbols[i],
          exchangeCode: 'CRYPTO',
          currentPrice: data.usd,
          dayChangePercent: data.usd_24h_change ?? undefined,
          currency: 'USD',
        });
      }
    }
    return results;
  }

  async fetchPrice(tickerSymbol: string): Promise<PriceResult> {
    const results = await this.fetchPrices([tickerSymbol]);
    if (results.length === 0) throw new Error(`No data for ${tickerSymbol}`);
    return results[0];
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.fetchPrice('BTC');
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 6: Create ExchangeRateAdapter (frankfurter.app)**

```typescript
// frankfurter.app — free, no key, ECB data
// https://api.frankfurter.app/latest?from=CNY&to=USD,HKD,EUR,JPY,GBP

export interface ExchangeRateResult {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export class ExchangeRateAdapter {
  readonly name = 'ExchangeRate';

  async fetchRates(
    fromCurrency: string,
    toCurrencies: string[],
  ): Promise<ExchangeRateResult[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrencies.join(',')}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as any;

    if (!json.rates) throw new Error('Failed to fetch exchange rates');

    const results: ExchangeRateResult[] = [];
    for (const [to, rate] of Object.entries(json.rates)) {
      results.push({ fromCurrency, toCurrency: to, rate: rate as number });
    }
    return results;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch('https://api.frankfurter.app/latest?from=CNY&to=USD', {
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 7: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add server/src/lib/adapters/
git commit -m "feat: add all market adapters + ExchangeRate adapter"
```

---

### Task 5: PriceService + ExchangeRateService

**Files:**
- Create: `server/src/lib/PriceService.ts`
- Create: `server/src/lib/ExchangeRateService.ts`

- [ ] **Step 1: Create PriceService**

```typescript
import { prisma } from './prisma';
import type { PriceAdapter } from './adapters/PriceAdapter';

export class PriceService {
  private adapters: Map<string, PriceAdapter> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private refreshMs = 15 * 60 * 1000; // 15 minutes

  register(adapter: PriceAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  remove(name: string): void {
    this.adapters.delete(name);
  }

  getAdapter(name: string): PriceAdapter | undefined {
    return this.adapters.get(name);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.adapters.keys());
  }

  async refreshAll(): Promise<{ updated: number; failed: number; errors: string[] }> {
    const autoAssets = await prisma.asset.findMany({
      where: { priceSource: 'AUTO', tickerSymbol: { not: null } },
    });

    // Group assets by exchange -> adapter mapping
    const byExchange: Map<string, { adapter: PriceAdapter; symbols: string[] }> = new Map();
    for (const asset of autoAssets) {
      const adapter = this.findAdapterForExchange(asset.exchangeCode || '');
      if (!adapter) continue;
      const key = adapter.name;
      if (!byExchange.has(key)) {
        byExchange.set(key, { adapter, symbols: [] });
      }
      byExchange.get(key)!.symbols.push(asset.tickerSymbol!);
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [, { adapter, symbols }] of byExchange) {
      if (!(await adapter.isAvailable())) {
        failed += symbols.length;
        errors.push(`${adapter.name}: unavailable`);
        continue;
      }
      try {
        const results = await adapter.fetchPrices(symbols);
        for (const r of results) {
          await prisma.marketPrice.upsert({
            where: {
              tickerSymbol_exchangeCode: {
                tickerSymbol: r.tickerSymbol,
                exchangeCode: r.exchangeCode,
              },
            },
            create: {
              tickerSymbol: r.tickerSymbol,
              exchangeCode: r.exchangeCode,
              name: r.name ?? null,
              currentPrice: r.currentPrice,
              previousClose: r.previousClose ?? null,
              dayChange: r.dayChange ?? null,
              dayChangePercent: r.dayChangePercent ?? null,
            },
            update: {
              currentPrice: r.currentPrice,
              previousClose: r.previousClose ?? null,
              dayChange: r.dayChange ?? null,
              dayChangePercent: r.dayChangePercent ?? null,
              name: r.name ?? undefined,
              updatedAt: new Date(),
            },
          });
          updated++;
        }
      } catch (e) {
        failed += symbols.length;
        errors.push(`${adapter.name}: ${e instanceof Error ? e.message : 'unknown'}`);
      }
    }

    // Update asset unitPrice from market price for AUTO assets
    if (updated > 0) {
      const prices = await prisma.marketPrice.findMany();
      const priceMap = new Map<string, number>();
      for (const p of prices) {
        priceMap.set(`${p.tickerSymbol}:${p.exchangeCode}`, p.currentPrice);
      }
      for (const asset of autoAssets) {
        const key = `${asset.tickerSymbol}:${asset.exchangeCode}`;
        const newPrice = priceMap.get(key);
        if (newPrice != null && newPrice !== asset.unitPrice) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: {
              unitPrice: newPrice,
              totalValue: asset.quantity * newPrice,
              priceUpdatedAt: new Date(),
            },
          });
        }
      }
    }

    return { updated, failed, errors };
  }

  async refreshAsset(assetId: string): Promise<boolean> {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.tickerSymbol || asset.priceSource !== 'AUTO') return false;

    const adapter = this.findAdapterForExchange(asset.exchangeCode || '');
    if (!adapter) return false;
    if (!(await adapter.isAvailable())) return false;

    const result = await adapter.fetchPrice(asset.tickerSymbol);
    await prisma.marketPrice.upsert({
      where: {
        tickerSymbol_exchangeCode: {
          tickerSymbol: result.tickerSymbol,
          exchangeCode: result.exchangeCode,
        },
      },
      create: {
        tickerSymbol: result.tickerSymbol,
        exchangeCode: result.exchangeCode,
        name: result.name ?? null,
        currentPrice: result.currentPrice,
        previousClose: result.previousClose ?? null,
        dayChange: result.dayChange ?? null,
        dayChangePercent: result.dayChangePercent ?? null,
      },
      update: {
        currentPrice: result.currentPrice,
        previousClose: result.previousClose ?? null,
        dayChange: result.dayChange ?? null,
        dayChangePercent: result.dayChangePercent ?? null,
        updatedAt: new Date(),
      },
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        unitPrice: result.currentPrice,
        totalValue: asset.quantity * result.currentPrice,
        priceUpdatedAt: new Date(),
      },
    });

    return true;
  }

  startScheduler(intervalMs?: number): void {
    if (this.intervalId) return;
    const ms = intervalMs || this.refreshMs;
    console.log(`[PriceService] Starting scheduler, interval: ${ms / 1000}s`);
    // Initial fetch
    this.refreshAll().catch((e) => console.error('[PriceService] Initial fetch error:', e));
    this.intervalId = setInterval(() => {
      this.refreshAll().catch((e) => console.error('[PriceService] Scheduler error:', e));
    }, ms);
  }

  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[PriceService] Scheduler stopped');
    }
  }

  private findAdapterForExchange(exchangeCode: string): PriceAdapter | undefined {
    switch (exchangeCode) {
      case 'SH':
      case 'SZ':
        return this.adapters.get('AStock');
      case 'HKEX':
        return this.adapters.get('HStock');
      case 'NYSE':
      case 'NASDAQ':
        return this.adapters.get('UStock');
      case 'FUND':
        return this.adapters.get('Fund');
      case 'CRYPTO':
        return this.adapters.get('Crypto');
      default:
        return undefined;
    }
  }
}

export const priceService = new PriceService();
```

- [ ] **Step 2: Create ExchangeRateService**

```typescript
import { prisma } from './prisma';
import { ExchangeRateAdapter } from './adapters/ExchangeRateAdapter';
import { SUPPORTED_CURRENCIES } from '@free/shared';

export class ExchangeRateService {
  private adapter = new ExchangeRateAdapter();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private refreshMs = 24 * 60 * 60 * 1000; // 24 hours

  async refreshAll(): Promise<{ updated: number; errors: string[] }> {
    const toCurrencies = Object.keys(SUPPORTED_CURRENCIES).filter((c) => c !== 'CNY');

    if (!(await this.adapter.isAvailable())) {
      return { updated: 0, errors: ['Exchange rate API unavailable'] };
    }

    try {
      const rates = await this.adapter.fetchRates('CNY', toCurrencies);
      let updated = 0;
      for (const r of rates) {
        await prisma.exchangeRate.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency: r.fromCurrency,
              toCurrency: r.toCurrency,
            },
          },
          create: {
            fromCurrency: r.fromCurrency,
            toCurrency: r.toCurrency,
            rate: r.rate,
          },
          update: { rate: r.rate, updatedAt: new Date() },
        });
        updated++;
      }
      return { updated, errors: [] };
    } catch (e) {
      return { updated: 0, errors: [e instanceof Error ? e.message : 'unknown'] };
    }
  }

  async getRate(fromCurrency: string): Promise<number | null> {
    if (fromCurrency === 'CNY') return 1;

    const rate = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: 'CNY', toCurrency: fromCurrency },
    });
    return rate ? 1 / rate.rate : null;
  }

  startScheduler(): void {
    if (this.intervalId) return;
    console.log('[ExchangeRateService] Starting scheduler (24h interval)');
    this.refreshAll().catch((e) => console.error('[ExchangeRateService] Initial fetch error:', e));
    this.intervalId = setInterval(() => {
      this.refreshAll().catch((e) => console.error('[ExchangeRateService] Scheduler error:', e));
    }, this.refreshMs);
  }

  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
```

- [ ] **Step 3: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add server/src/lib/PriceService.ts server/src/lib/ExchangeRateService.ts
git commit -m "feat: add PriceService and ExchangeRateService with schedulers"
```

---

### Task 6: ReturnCalculator (TWR + contribution)

**Files:**
- Create: `server/src/lib/ReturnCalculator.ts`

- [ ] **Step 1: Create ReturnCalculator**

```typescript
import { prisma } from './prisma';

interface CashFlowEvent {
  date: Date;
  amount: number; // positive = inflow (buy), negative = outflow (sell, dividend)
}

export class ReturnCalculator {
  /**
   * Compute Time-Weighted Return for a portfolio across a date range.
   * Divides the period into sub-periods at each cash flow event.
   * TWR = [(1+R1) * (1+R2) * ... * (1+Rn)] - 1
   */
  async computeTWR(
    assetIds: string[],
    from: Date,
    to: Date,
  ): Promise<number | null> {
    const transactions = await prisma.transaction.findMany({
      where: {
        assetId: { in: assetIds },
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });

    // Build valuation timeline
    const events: { date: Date; cashFlow: number; portfolioValue: number }[] = [];

    for (const tx of transactions) {
      let cashFlow = 0;
      if (tx.type === 'BUY') cashFlow = -(tx.amount);
      else if (tx.type === 'SELL') cashFlow = tx.amount;
      else if (tx.type === 'DIVIDEND') cashFlow = tx.amount;
      // FEE doesn't affect cash flow for TWR (handled in cost basis)

      // Get portfolio value just before this event
      const preValue = await this.getPortfolioValueAt(assetIds, tx.date);
      events.push({ date: tx.date, cashFlow, portfolioValue: preValue });
    }

    if (events.length === 0) return null;

    // Calculate sub-period returns
    let twr = 1.0;
    for (const event of events) {
      const endValue = event.portfolioValue - event.cashFlow; // value after flow
      const startValue = event.portfolioValue;
      if (startValue !== 0) {
        twr *= endValue / startValue;
      }
    }

    return twr - 1;
  }

  /**
   * Simple return: (current value - cost basis) / cost basis
   */
  async computeSimpleReturn(assetId: string): Promise<{
    costBasis: number;
    currentValue: number;
    totalReturn: number;
    totalReturnPercent: number;
  }> {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error(`Asset ${assetId} not found`);

    const costBasis = asset.costBasis ?? 0;
    const currentValue = asset.totalValue;

    return {
      costBasis,
      currentValue,
      totalReturn: currentValue - costBasis,
      totalReturnPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
    };
  }

  /**
   * Full return analysis for all user assets
   */
  async analyzeReturns(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<{
    twr: number | null;
    totalReturn: number;
    totalReturnPercent: number;
    perAsset: Array<{
      assetId: string;
      assetName: string;
      category: string;
      costBasis: number;
      currentValue: number;
      totalReturn: number;
      totalReturnPercent: number;
      contribution: number;
      contributionPercent: number;
    }>;
    from: string;
    to: string;
  }> {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(assets.reduce((min, a) => Math.min(min, a.createdAt.getTime()), now.getTime()));
    const toDate = to ? new Date(to) : now;

    const assetIds = assets.map((a) => a.id);
    const twr = await this.computeTWR(assetIds, fromDate, toDate);

    let totalCost = 0;
    let totalValue = 0;
    const perAsset: Array<{
      assetId: string;
      assetName: string;
      category: string;
      costBasis: number;
      currentValue: number;
      totalReturn: number;
      totalReturnPercent: number;
      contribution: number;
      contributionPercent: number;
    }> = [];

    for (const a of assets) {
      const cb = a.costBasis ?? 0;
      const cv = a.totalValue;
      const ret = cv - cb;
      const retPct = cb > 0 ? ((cv - cb) / cb) * 100 : 0;
      totalCost += cb;
      totalValue += cv;
      perAsset.push({
        assetId: a.id,
        assetName: a.name,
        category: a.category,
        costBasis: cb,
        currentValue: cv,
        totalReturn: ret,
        totalReturnPercent: retPct,
        contribution: ret,
        contributionPercent: 0,
      });
    }

    const totalRet = totalValue - totalCost;
    // Contribution percentages
    if (totalRet !== 0) {
      for (const pa of perAsset) {
        pa.contribution = pa.totalReturn;
        pa.contributionPercent = (pa.totalReturn / totalRet) * 100;
      }
    }

    return {
      twr,
      totalReturn: totalRet,
      totalReturnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      perAsset,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }

  private async getPortfolioValueAt(assetIds: string[], date: Date): Promise<number> {
    // Get the portfolio value at a specific point in time
    // Uses current asset values (approximation — full implementation would use snapshot history)
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });
    return assets.reduce((sum, a) => sum + a.totalValue, 0);
  }
}

export const returnCalculator = new ReturnCalculator();
```

- [ ] **Step 2: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/src/lib/ReturnCalculator.ts
git commit -m "feat: add ReturnCalculator with TWR and contribution analysis"
```

---

### Task 7: RebalanceChecker + update calculations for ExchangeRate table

**Files:**
- Create: `server/src/lib/RebalanceChecker.ts`
- Modify: `server/src/lib/calculations.ts`

- [ ] **Step 1: Create RebalanceChecker**

```typescript
import { prisma } from './prisma';
import type { AllocationAnalysis, AssetCategory, RebalanceAlertStatus } from '@free/shared';

export class RebalanceChecker {
  /**
   * Check all categories against configured thresholds.
   * Returns triggered alerts only.
   */
  async checkAll(
    analysis: AllocationAnalysis[],
  ): Promise<RebalanceAlertStatus[]> {
    const alerts = await prisma.rebalanceAlert.findMany();

    const thresholds = new Map<string, { threshold: number; enabled: boolean }>();
    for (const a of alerts) {
      thresholds.set(a.category, { threshold: a.threshold, enabled: a.enabled });
    }

    const results: RebalanceAlertStatus[] = [];
    for (const item of analysis) {
      const config = thresholds.get(item.category);
      const threshold = config?.threshold ?? 5;
      const enabled = config?.enabled ?? true;

      const deviation = Math.abs(item.currentRatio - item.targetRatio);
      results.push({
        category: item.category as AssetCategory,
        currentRatio: item.currentRatio,
        targetRatio: item.targetRatio,
        deviation,
        threshold,
        triggered: enabled && deviation > threshold,
      });
    }

    return results;
  }

  /**
   * Get all alert statuses (including non-triggered).
   */
  async getStatus(): Promise<RebalanceAlertStatus[]> {
    const analysis = await this.getCurrentAnalysis();
    return this.checkAll(analysis);
  }

  private async getCurrentAnalysis(): Promise<AllocationAnalysis[]> {
    const assets = await prisma.asset.findMany();
    const targets = await prisma.allocationTarget.findMany();

    // Compute category totals (CNY-equivalent, using exchange rate table)
    const breakdown: Record<string, number> = {};
    let totalValue = 0;

    for (const a of assets) {
      const rate = await this.getExchangeRate(a.currency);
      const cnyValue = a.totalValue * rate;
      breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
      totalValue += cnyValue;
    }

    const targetMap = new Map<string, number>();
    for (const t of targets) {
      targetMap.set(t.category, t.targetRatio);
    }

    const analysis: AllocationAnalysis[] = [];
    for (const [category, currentValue] of Object.entries(breakdown)) {
      const currentRatio = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      const targetRatio = targetMap.get(category) || 0;
      analysis.push({
        category: category as AssetCategory,
        currentValue,
        currentRatio,
        targetRatio,
        deviation: currentRatio - targetRatio,
        rebalanceAmount: ((targetRatio - currentRatio) / 100) * totalValue,
      });
    }

    return analysis;
  }

  private async getExchangeRate(currency: string): Promise<number> {
    if (currency === 'CNY') return 1;
    const rate = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: 'CNY', toCurrency: currency },
    });
    if (rate) return 1 / rate.rate;

    // Fallback: check asset properties
    const asset = await prisma.asset.findFirst({
      where: { currency, properties: { path: ['exchangeRate'], not: null } },
    });
    if (asset?.properties?.exchangeRate) {
      return asset.properties.exchangeRate as number;
    }
    return 1;
  }
}

export const rebalanceChecker = new RebalanceChecker();
```

- [ ] **Step 2: Update calculations.ts to use ExchangeRate table**

Replace the exchange rate lookup in `sumTotalAssets` and `computeCategoryBreakdown`:

```typescript
// In server/src/lib/calculations.ts, replace the existing file with:

interface AssetLike {
  category: string;
  totalValue: number;
  passiveIncome?: number | null;
  properties?: Record<string, unknown> | null;
  currency?: string;
}

interface LiabilityLike {
  remaining: number;
}

export function sumTotalAssets(assets: AssetLike[]): number {
  return assets.reduce((sum, a) => {
    const exchangeRate = (a.properties?.exchangeRate as number | undefined) ?? 1;
    const currency = a.currency ?? 'CNY';
    if (currency === 'CNY') return sum + a.totalValue;
    return sum + a.totalValue * exchangeRate;
  }, 0);
}

export function sumTotalLiabilities(liabilities: LiabilityLike[]): number {
  return liabilities.reduce((sum, l) => sum + l.remaining, 0);
}

export function computeNetWorth(assets: AssetLike[], liabilities: LiabilityLike[]): number {
  return sumTotalAssets(assets) - sumTotalLiabilities(liabilities);
}

export function computeCategoryBreakdown(assets: AssetLike[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const a of assets) {
    const exchangeRate = (a.properties?.exchangeRate as number | undefined) ?? 1;
    const currency = a.currency ?? 'CNY';
    const cnyValue = currency === 'CNY' ? a.totalValue : a.totalValue * exchangeRate;
    breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
  }
  return breakdown;
}

export function sumAnnualPassiveIncome(assets: AssetLike[]): number {
  return assets.reduce((sum, a) => sum + (a.passiveIncome || 0), 0);
}

/**
 * Compute category breakdown with explicit exchange rate map (from ExchangeRate table).
 * This is the v2 variant — callers pass pre-fetched rates.
 */
export function computeCategoryBreakdownWithRates(
  assets: AssetLike[],
  getRate: (currency: string) => number,
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const a of assets) {
    const currency = a.currency ?? 'CNY';
    const rate = getRate(currency);
    const cnyValue = currency === 'CNY' ? a.totalValue : a.totalValue * rate;
    breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
  }
  return breakdown;
}

export function sumTotalAssetsWithRates(
  assets: AssetLike[],
  getRate: (currency: string) => number,
): number {
  return assets.reduce((sum, a) => {
    const currency = a.currency ?? 'CNY';
    const rate = getRate(currency);
    if (currency === 'CNY') return sum + a.totalValue;
    return sum + a.totalValue * rate;
  }, 0);
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add server/src/lib/RebalanceChecker.ts server/src/lib/calculations.ts
git commit -m "feat: add RebalanceChecker and update calculations for ExchangeRate table"
```

---

### Task 8: /api/prices + /api/exchange-rates routes

**Files:**
- Create: `server/src/routes/prices.ts`
- Create: `server/src/routes/exchangeRates.ts`

- [ ] **Step 1: Create prices route**

```typescript
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { priceService } from '../lib/PriceService';

export async function priceRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const prices = await prisma.marketPrice.findMany();
    return reply.send(prices);
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await priceService.refreshAll();
    return reply.send(result);
  });

  app.post('/refresh/:assetId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string };
    const ok = await priceService.refreshAsset(assetId);
    if (!ok) return reply.status(400).send({ error: 'Refresh failed', code: 400 });
    return reply.send({ success: true });
  });
}
```

- [ ] **Step 2: Create exchange rates route**

```typescript
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { exchangeRateService } from '../lib/ExchangeRateService';

export async function exchangeRateRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const rates = await prisma.exchangeRate.findMany();
    return reply.send(rates);
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await exchangeRateService.refreshAll();
    return reply.send(result);
  });
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/prices.ts server/src/routes/exchangeRates.ts
git commit -m "feat: add /api/prices and /api/exchange-rates routes"
```

---

### Task 9: /api/transactions route

**Files:**
- Create: `server/src/routes/transactions.ts`

- [ ] **Step 1: Create transactions route with costBasis recalculation**

```typescript
import { TRANSACTION_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';

const userId = config.userId;

async function recalculateCostBasis(assetId: string): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: { assetId },
    orderBy: { date: 'asc' },
  });

  let totalCost = 0;
  let totalQty = 0;

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      totalCost += tx.amount + (tx.fee || 0);
      totalQty += tx.quantity || 0;
    } else if (tx.type === 'SELL') {
      const sellQty = tx.quantity || 0;
      if (totalQty > 0) {
        const avgCost = totalCost / totalQty;
        totalCost -= avgCost * sellQty;
      }
      totalQty -= sellQty;
    }
    // DIVIDEND and FEE don't affect cost basis for TWR
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { costBasis: totalCost > 0 ? totalCost : null },
  });
}

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.query as { assetId?: string };
    const where: Record<string, unknown> = { userId };
    if (assetId) where.assetId = assetId;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return reply.send(transactions);
  });

  app.post(
    '/',
    { schema: { body: TRANSACTION_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId, type, date, quantity, price, amount, fee, notes } = request.body as any;

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          assetId,
          type,
          date: new Date(date),
          quantity: quantity ?? null,
          price: price ?? null,
          amount,
          fee: fee ?? 0,
          notes: notes ?? null,
        },
      });

      await recalculateCostBasis(assetId);

      return reply.status(201).send(transaction);
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: TRANSACTION_SCHEMA.properties,
          additionalProperties: false,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, any>;
      const data: Record<string, unknown> = {};

      const fields = ['type', 'quantity', 'price', 'amount', 'fee', 'notes'];
      for (const f of fields) {
        if (body[f] !== undefined) data[f] = body[f];
      }
      if (body.date !== undefined) data.date = new Date(body.date);
      if (body.assetId !== undefined) data.assetId = body.assetId;

      const transaction = await prisma.transaction.update({ where: { id }, data });
      await recalculateCostBasis(transaction.assetId);

      return reply.send(transaction);
    },
  );

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return reply.status(404).send({ error: 'Not found', code: 404 });

    await prisma.transaction.delete({ where: { id } });
    await recalculateCostBasis(tx.assetId);

    return reply.status(204).send();
  });
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/transactions.ts
git commit -m "feat: add /api/transactions route with costBasis recalculation"
```

---

### Task 10: /api/returns + /api/rebalance-alerts routes

**Files:**
- Create: `server/src/routes/returns.ts`
- Create: `server/src/routes/rebalanceAlerts.ts`

- [ ] **Step 1: Create returns route**

```typescript
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { returnCalculator } from '../lib/ReturnCalculator';

const userId = config.userId;

export async function returnRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { from, to } = request.query as { from?: string; to?: string };
    const analysis = await returnCalculator.analyzeReturns(userId, from, to);
    return reply.send(analysis);
  });

  app.get('/:assetId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string };
    const simpleReturn = await returnCalculator.computeSimpleReturn(assetId);
    return reply.send(simpleReturn);
  });
}
```

- [ ] **Step 2: Create rebalance alerts route**

```typescript
import { REBALANCE_ALERTS_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { rebalanceChecker } from '../lib/RebalanceChecker';

const userId = config.userId;

export async function rebalanceAlertRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const statuses = await rebalanceChecker.getStatus();
    return reply.send(statuses);
  });

  app.put(
    '/',
    { schema: { body: REBALANCE_ALERTS_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { alerts } = request.body as {
        alerts: { category: string; threshold: number; enabled: boolean }[];
      };

      await prisma.rebalanceAlert.deleteMany({ where: { userId } });

      for (const alert of alerts) {
        await prisma.rebalanceAlert.create({
          data: {
            userId,
            category: alert.category,
            threshold: alert.threshold,
            enabled: alert.enabled,
          },
        });
      }

      const statuses = await rebalanceChecker.getStatus();
      return reply.send(statuses);
    },
  );
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd server && bun run tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/returns.ts server/src/routes/rebalanceAlerts.ts
git commit -m "feat: add /api/returns and /api/rebalance-alerts routes"
```

---

### Task 11: Register routes in app.ts + start schedulers

**Files:**
- Modify: `server/src/app.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Register new routes in app.ts**

```typescript
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { allocationRoutes } from './routes/allocation';
import { assetRoutes } from './routes/assets';
import { exchangeRateRoutes } from './routes/exchangeRates';
import { fireProfileRoutes } from './routes/fireProfile';
import { liabilityRoutes } from './routes/liabilities';
import { netWorthRoutes } from './routes/netWorth';
import { priceRoutes } from './routes/prices';
import { rebalanceAlertRoutes } from './routes/rebalanceAlerts';
import { returnRoutes } from './routes/returns';
import { snapshotRoutes } from './routes/snapshots';
import { transactionRoutes } from './routes/transactions';

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] });

  await app.register(assetRoutes, { prefix: '/api/assets' });
  await app.register(liabilityRoutes, { prefix: '/api/liabilities' });
  await app.register(netWorthRoutes, { prefix: '/api/net-worth' });
  await app.register(fireProfileRoutes, { prefix: '/api' });
  await app.register(allocationRoutes, { prefix: '/api' });
  await app.register(snapshotRoutes, { prefix: '/api/snapshots' });
  await app.register(priceRoutes, { prefix: '/api/prices' });
  await app.register(exchangeRateRoutes, { prefix: '/api/exchange-rates' });
  await app.register(transactionRoutes, { prefix: '/api/transactions' });
  await app.register(returnRoutes, { prefix: '/api/returns' });
  await app.register(rebalanceAlertRoutes, { prefix: '/api/rebalance-alerts' });

  return app;
}
```

- [ ] **Step 2: Update index.ts to register adapters and start schedulers**

```typescript
import { createApp } from './app';
import { config } from './config';
import { AStockAdapter } from './lib/adapters/AStockAdapter';
import { CryptoAdapter } from './lib/adapters/CryptoAdapter';
import { FundAdapter } from './lib/adapters/FundAdapter';
import { HStockAdapter } from './lib/adapters/HStockAdapter';
import { UStockAdapter } from './lib/adapters/UStockAdapter';
import { exchangeRateService } from './lib/ExchangeRateService';
import { priceService } from './lib/PriceService';

// Register adapters
priceService.register(new AStockAdapter());
priceService.register(new HStockAdapter());
priceService.register(new UStockAdapter());
priceService.register(new FundAdapter());
priceService.register(new CryptoAdapter());

const app = await createApp();

try {
  await app.listen({ port: config.port });
  console.log(`Server running on http://localhost:${config.port}`);

  // Start schedulers after server is ready
  priceService.startScheduler();
  exchangeRateService.startScheduler();
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
```

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: No errors. Fix any type issues.

- [ ] **Step 4: Commit**

```bash
git add server/src/app.ts server/src/index.ts
git commit -m "feat: register v2 routes, adapters, and start schedulers"
```

---

### Task 12: Web API client + new hooks

**Files:**
- Modify: `web/src/lib/api.ts`
- Create: `web/src/hooks/usePrices.ts`
- Create: `web/src/hooks/useTransactions.ts`
- Create: `web/src/hooks/useReturns.ts`
- Create: `web/src/hooks/useRebalanceAlerts.ts`

- [ ] **Step 1: Add new API endpoints to api.ts**

Add to the `api` object in `web/src/lib/api.ts`:

```typescript
  prices: {
    list: () => request<MarketPrice[]>('/prices'),
    refresh: () => request<{ updated: number; failed: number; errors: string[] }>(
      '/prices/refresh', { method: 'POST' },
    ),
    refreshAsset: (assetId: string) =>
      request<{ success: boolean }>(`/prices/refresh/${assetId}`, { method: 'POST' }),
  },
  exchangeRates: {
    list: () => request<ExchangeRate[]>('/exchange-rates'),
    refresh: () => request<{ updated: number; errors: string[] }>(
      '/exchange-rates/refresh', { method: 'POST' },
    ),
  },
  transactions: {
    list: (assetId?: string) =>
      request<Transaction[]>(`/transactions${assetId ? `?assetId=${assetId}` : ''}`),
    create: (data: CreateTransactionInput) =>
      request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTransactionInput) =>
      request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },
  returns: {
    analysis: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return request<ReturnAnalysis>(`/returns${qs ? `?${qs}` : ''}`);
    },
    assetReturn: (assetId: string) =>
      request<{ costBasis: number; currentValue: number; totalReturn: number; totalReturnPercent: number }>(
        `/returns/${assetId}`,
      ),
  },
  rebalanceAlerts: {
    status: () => request<RebalanceAlertStatus[]>('/rebalance-alerts'),
    update: (data: UpdateRebalanceAlertsInput) =>
      request<RebalanceAlertStatus[]>('/rebalance-alerts', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
```

Also update the imports at the top to include new types:

```typescript
import type {
  AllocationAnalysis,
  AllocationTarget,
  Asset,
  CreateTransactionInput,
  ExchangeRate,
  FireProfile,
  FireProgress,
  Liability,
  MarketPrice,
  NetWorthSummary,
  RebalanceAlertStatus,
  ReturnAnalysis,
  Snapshot,
  Transaction,
  UpdateRebalanceAlertsInput,
  UpdateTransactionInput,
} from '../types';
```

- [ ] **Step 2: Create usePrices hook**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { MarketPrice } from '../types';

export function usePrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.prices.list();
    setPrices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      const result = await api.prices.refresh();
      toast.success(`价格已更新 (${result.updated} 项)`);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    }
    setRefreshing(false);
  };

  const refreshAsset = async (assetId: string) => {
    try {
      await api.prices.refreshAsset(assetId);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    }
  };

  return { prices, loading, refreshing, refreshAll, refreshAsset };
}
```

- [ ] **Step 3: Create useTransactions hook**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../types';

export function useTransactions(assetId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.transactions.list(assetId);
    setTransactions(data);
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (input: CreateTransactionInput) => {
    try {
      await api.transactions.create(input);
      toast.success('已添加交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '添加失败');
    }
  };

  const update = async (id: string, input: UpdateTransactionInput) => {
    try {
      await api.transactions.update(id, input);
      toast.success('已更新交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  const remove = async (id: string) => {
    try {
      await api.transactions.delete(id);
      toast.success('已删除交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return { transactions, loading, create, update, remove, refetch: fetch };
}
```

- [ ] **Step 4: Create useReturns hook**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ReturnAnalysis } from '../types';

export function useReturns() {
  const [analysis, setAnalysis] = useState<ReturnAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    const data = await api.returns.analysis(from, to);
    setAnalysis(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { analysis, loading, refetch: fetch };
}
```

- [ ] **Step 5: Create useRebalanceAlerts hook**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { RebalanceAlertStatus, UpdateRebalanceAlertsInput } from '../types';

export function useRebalanceAlerts() {
  const [statuses, setStatuses] = useState<RebalanceAlertStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.rebalanceAlerts.status();
    setStatuses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateAlerts = async (input: UpdateRebalanceAlertsInput) => {
    try {
      const data = await api.rebalanceAlerts.update(input);
      setStatuses(data);
      toast.success('阈值已更新');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  return { statuses, loading, updateAlerts, refetch: fetch };
}
```

- [ ] **Step 6: Verify build**

```bash
bun run build
```

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/api.ts web/src/hooks/usePrices.ts web/src/hooks/useTransactions.ts web/src/hooks/useReturns.ts web/src/hooks/useRebalanceAlerts.ts
git commit -m "feat: add v2 API client endpoints and new hooks"
```

---

### Task 13: AssetOverview enhancements (PriceBadge, refresh, ticker fields)

**Files:**
- Create: `web/src/components/PriceBadge.tsx`
- Modify: `web/src/pages/AssetOverview.tsx`
- Modify: `web/src/components/AssetList.tsx`
- Modify: `web/src/components/AssetForm.tsx`

- [ ] **Step 1: Create PriceBadge component**

```typescript
import { cn } from '../lib/utils';

interface PriceBadgeProps {
  tickerSymbol: string | null;
  priceSource: string;
  currentPrice: number | null;
  dayChangePercent: number | null;
  priceUpdatedAt: string | null;
}

export function PriceBadge({
  tickerSymbol,
  priceSource,
  currentPrice,
  dayChangePercent,
  priceUpdatedAt,
}: PriceBadgeProps) {
  if (priceSource === 'MANUAL' || !tickerSymbol) return null;

  const isUp = dayChangePercent != null && dayChangePercent >= 0;
  const isDown = dayChangePercent != null && dayChangePercent < 0;

  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      {currentPrice != null && (
        <span className="font-medium">{currentPrice.toFixed(2)}</span>
      )}
      {isUp && (
        <span className="text-emerald-600">+{dayChangePercent.toFixed(2)}%</span>
      )}
      {isDown && (
        <span className="text-red-500">{dayChangePercent.toFixed(2)}%</span>
      )}
      {priceUpdatedAt && (
        <span className="text-stone/50 ml-1">
          {new Date(priceUpdatedAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Update AssetOverview to add refresh button and pass usePrices**

In `AssetOverview.tsx`, add:

```typescript
import { RefreshCw } from 'lucide-react';
// ... existing imports
import { usePrices } from '../hooks/usePrices';

// Inside the component, after existing hooks:
const { prices, refreshing, refreshAll } = usePrices();

// Price lookup map
const priceMap = new Map<string, { price: number; change: number | null }>();
for (const p of prices) {
  priceMap.set(`${p.tickerSymbol}:${p.exchangeCode}`, {
    price: p.currentPrice,
    change: p.dayChangePercent,
  });
}
```

Add the refresh button to the toolbar (after the 导入 button):

```typescript
<Button onClick={refreshAll} variant="outline" size="sm" disabled={refreshing}>
  <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
  {refreshing ? '刷新中...' : '刷新价格'}
</Button>
```

Pass `prices` and `priceMap` to `AssetList`:

```typescript
<AssetList
  assets={assets}
  prices={prices}
  onCreate={withRefresh(create)}
  onUpdate={withRefresh(update)}
  onDelete={withRefresh(remove)}
/>
```

- [ ] **Step 3: Update AssetList to show prices**

Accept `prices` prop and show `PriceBadge` next to asset names:

```typescript
import { PriceBadge } from './PriceBadge';
import type { MarketPrice } from '../types';

// Add to AssetList props:
// prices?: MarketPrice[];

// In the asset row, next to the name, add:
const assetPrice = prices?.find(
  (p) => p.tickerSymbol === asset.tickerSymbol && p.exchangeCode === asset.exchangeCode,
);
```

Render the badge next to asset name:

```tsx
{asset.tickerSymbol && assetPrice && (
  <PriceBadge
    tickerSymbol={asset.tickerSymbol}
    priceSource={asset.priceSource}
    currentPrice={assetPrice.currentPrice}
    dayChangePercent={assetPrice.dayChangePercent}
    priceUpdatedAt={assetPrice.updatedAt}
  />
)}
```

- [ ] **Step 4: Update AssetForm to include ticker/exchange/priceSource fields**

In `AssetForm.tsx`, add state and fields for ticker, exchangeCode, and priceSource. Display ticker and exchange fields only for categories that support market data (equity, crypto, fixed_income):

```tsx
const [tickerSymbol, setTickerSymbol] = useState(asset?.tickerSymbol ?? '');
const [exchangeCode, setExchangeCode] = useState(asset?.exchangeCode ?? '');
const [priceSource, setPriceSource] = useState(asset?.priceSource ?? 'MANUAL');

const supportsMarketData = ['equity', 'crypto', 'fixed_income'].includes(category);

// ... In the form, after the name field:
{supportsMarketData && (
  <>
    <div>
      <label className="text-[12px] text-stone">交易代码</label>
      <Input value={tickerSymbol} onChange={(e) => setTickerSymbol((e.target as HTMLInputElement).value)} placeholder="如 600519.SH, AAPL" className="h-8 text-[13px]" />
    </div>
    <div>
      <label className="text-[12px] text-stone">交易所</label>
      <select value={exchangeCode} onChange={(e) => setExchangeCode(e.target.value)} className="w-full h-8 rounded-md border border-sand bg-ivory text-[13px] px-2">
        <option value="">请选择</option>
        <option value="SH">上海 (SH)</option>
        <option value="SZ">深圳 (SZ)</option>
        <option value="HKEX">港交所 (HKEX)</option>
        <option value="NYSE">纽交所 (NYSE)</option>
        <option value="NASDAQ">纳斯达克 (NASDAQ)</option>
        <option value="CRYPTO">数字货币</option>
        <option value="FUND">基金</option>
      </select>
    </div>
  </>
)}
```

Include the new fields in the submit payload:

```tsx
// In the submit handler, add to data:
tickerSymbol: tickerSymbol || undefined,
exchangeCode: exchangeCode || undefined,
priceSource: tickerSymbol ? 'AUTO' : 'MANUAL',
```

- [ ] **Step 5: Verify build**

```bash
bun run build
```

- [ ] **Step 6: Commit**

```bash
git add web/src/components/PriceBadge.tsx web/src/pages/AssetOverview.tsx web/src/components/AssetList.tsx web/src/components/AssetForm.tsx
git commit -m "feat: add PriceBadge, refresh button, and ticker fields to asset management"
```

---

### Task 14: TransactionList page (new)

**Files:**
- Create: `web/src/pages/TransactionList.tsx`
- Create: `web/src/components/TransactionForm.tsx`

- [ ] **Step 1: Create TransactionForm component**

```tsx
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Asset, CreateTransactionInput, Transaction, TransactionType, UpdateTransactionInput } from '../types';
import { TRANSACTION_TYPE_LABELS } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Modal from './Modal';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput | UpdateTransactionInput) => void;
  transaction?: Transaction;
  assets: Asset[];
  preselectedAssetId?: string;
}

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  assets,
  preselectedAssetId,
}: TransactionFormProps) {
  const [assetId, setAssetId] = useState(transaction?.assetId ?? preselectedAssetId ?? '');
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'BUY');
  const [date, setDate] = useState(transaction?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState(transaction?.quantity?.toString() ?? '');
  const [price, setPrice] = useState(transaction?.price?.toString() ?? '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [fee, setFee] = useState(transaction?.fee?.toString() ?? '');
  const [notes, setNotes] = useState(transaction?.notes ?? '');

  useEffect(() => {
    if (open) {
      setAssetId(transaction?.assetId ?? preselectedAssetId ?? '');
      setType(transaction?.type ?? 'BUY');
      setDate(transaction?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
      setQuantity(transaction?.quantity?.toString() ?? '');
      setPrice(transaction?.price?.toString() ?? '');
      setAmount(transaction?.amount?.toString() ?? '');
      setFee(transaction?.fee?.toString() ?? '');
      setNotes(transaction?.notes ?? '');
    }
  }, [open, transaction, preselectedAssetId]);

  const handleSubmit = () => {
    if (!assetId || !date || !amount) return;
    const data: CreateTransactionInput = {
      assetId,
      type,
      date,
      quantity: quantity ? parseFloat(quantity) : null,
      price: price ? parseFloat(price) : null,
      amount: parseFloat(amount),
      fee: fee ? parseFloat(fee) : null,
      notes: notes || null,
    };
    onSubmit(data);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{transaction ? '编辑交易' : '新增交易'}</h2>
          <button onClick={onClose} className="text-stone/50 hover:text-stone"><X className="h-3 w-3" /></button>
        </div>

        <div>
          <label className="text-[12px] text-stone">资产</label>
          <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full h-8 rounded-md border border-sand bg-ivory text-[13px] px-2">
            <option value="">选择资产</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[12px] text-stone">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full h-8 rounded-md border border-sand bg-ivory text-[13px] px-2">
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[12px] text-stone">日期</label>
          <Input type="date" value={date} onChange={(e) => setDate((e.target as HTMLInputElement).value)} className="h-8 text-[13px]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[12px] text-stone">数量</label>
            <Input value={quantity} onChange={(e) => setQuantity((e.target as HTMLInputElement).value)} placeholder="可选" className="h-8 text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] text-stone">单价</label>
            <Input value={price} onChange={(e) => setPrice((e.target as HTMLInputElement).value)} placeholder="可选" className="h-8 text-[13px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[12px] text-stone">金额 *</label>
            <Input value={amount} onChange={(e) => setAmount((e.target as HTMLInputElement).value)} placeholder="交易金额" className="h-8 text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] text-stone">手续费</label>
            <Input value={fee} onChange={(e) => setFee((e.target as HTMLInputElement).value)} placeholder="0" className="h-8 text-[13px]" />
          </div>
        </div>

        <div>
          <label className="text-[12px] text-stone">备注</label>
          <Input value={notes} onChange={(e) => setNotes((e.target as HTMLInputElement).value)} className="h-8 text-[13px]" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={handleSubmit}>{transaction ? '保存' : '创建'}</Button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Create TransactionList page**

```tsx
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import { Button } from '../components/ui/button';
import { useAssets } from '../hooks/useAssets';
import { useTransactions } from '../hooks/useTransactions';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../types';
import { TRANSACTION_TYPE_LABELS } from '../types';

export default function TransactionList() {
  const { assets } = useAssets();
  const { transactions, loading, create, update, remove } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  const handleSubmit = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data as CreateTransactionInput);
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">交易记录</h1>
          <p className="text-[12px] text-stone mt-0.5">管理买卖、分红和费用记录</p>
        </div>
        <Button
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" /> 新增交易
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-md bg-sand/20 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-stone/50 text-[13px]">
          暂无交易记录
        </div>
      ) : (
        <div className="rounded-lg border border-sand/60 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sand/30">
                <th className="text-left px-4 py-2 font-normal text-stone">日期</th>
                <th className="text-left px-4 py-2 font-normal text-stone">资产</th>
                <th className="text-left px-4 py-2 font-normal text-stone">类型</th>
                <th className="text-right px-4 py-2 font-normal text-stone">数量</th>
                <th className="text-right px-4 py-2 font-normal text-stone">价格</th>
                <th className="text-right px-4 py-2 font-normal text-stone">金额</th>
                <th className="text-right px-4 py-2 font-normal text-stone">费用</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const asset = assets.find((a) => a.id === tx.assetId);
                return (
                  <tr
                    key={tx.id}
                    className="border-t border-sand/30 hover:bg-sand/10 cursor-pointer"
                    onClick={() => { setEditing(tx); setFormOpen(true); }}
                  >
                    <td className="px-4 py-2">{tx.date.slice(0, 10)}</td>
                    <td className="px-4 py-2">{asset?.name ?? tx.assetId}</td>
                    <td className="px-4 py-2">{TRANSACTION_TYPE_LABELS[tx.type] || tx.type}</td>
                    <td className="px-4 py-2 text-right">{tx.quantity ?? '-'}</td>
                    <td className="px-4 py-2 text-right">{tx.price?.toFixed(2) ?? '-'}</td>
                    <td className="px-4 py-2 text-right">{formatAmount(tx.amount)}</td>
                    <td className="px-4 py-2 text-right">{tx.fee ? formatAmount(tx.fee) : '-'}</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(tx.id); }}
                        className="text-stone/30 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSubmit={handleSubmit}
        transaction={editing}
        assets={assets}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
bun run build
```

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/TransactionList.tsx web/src/components/TransactionForm.tsx
git commit -m "feat: add TransactionList page and TransactionForm component"
```

---

### Task 15: ReturnAttribution page (new)

**Files:**
- Create: `web/src/pages/ReturnAttribution.tsx`

- [ ] **Step 1: Create ReturnAttribution page**

```tsx
import { useReturns } from '../hooks/useReturns';
import { AssetListSkeleton } from '../components/Skeleton';

export default function ReturnAttribution() {
  const { analysis, loading, refetch } = useReturns();

  const formatPct = (n: number) =>
    `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  const formatCNY = (n: number) =>
    new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">
            收益归因
          </h1>
          <p className="text-[12px] text-stone mt-0.5">投资组合收益分析</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <AssetListSkeleton />
        </div>
      ) : !analysis ? (
        <div className="text-center py-12 text-stone/50 text-[13px]">
          暂无分析数据，请先添加带有成本基础的资产和交易记录
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">总收益</div>
              <div className={`text-lg font-medium ${analysis.totalReturn >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                {formatCNY(analysis.totalReturn)}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">总收益率</div>
              <div className={`text-lg font-medium ${analysis.totalReturnPercent >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                {formatPct(analysis.totalReturnPercent)}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">TWR (时间加权)</div>
              <div className={`text-lg font-medium ${(analysis.twr ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                {analysis.twr != null ? formatPct(analysis.twr * 100) : '无交易数据'}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">分析区间</div>
              <div className="text-[12px] text-deep">
                {new Date(analysis.from).toLocaleDateString('zh-CN')} ~ {new Date(analysis.to).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>

          {/* Per-Asset Detail */}
          {analysis.perAsset.length > 0 && (
            <div className="rounded-lg border border-sand/60 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-sand/30">
                    <th className="text-left px-4 py-2 font-normal text-stone">资产</th>
                    <th className="text-left px-4 py-2 font-normal text-stone">类别</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">成本</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">市值</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">收益</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">收益率</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">贡献度</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.perAsset.map((pa) => (
                    <tr key={pa.assetId} className="border-t border-sand/30 hover:bg-sand/10">
                      <td className="px-4 py-2 font-medium">{pa.assetName}</td>
                      <td className="px-4 py-2">{pa.category}</td>
                      <td className="px-4 py-2 text-right">{formatCNY(pa.costBasis)}</td>
                      <td className="px-4 py-2 text-right">{formatCNY(pa.currentValue)}</td>
                      <td className={`px-4 py-2 text-right ${pa.totalReturn >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                        {formatCNY(pa.totalReturn)}
                      </td>
                      <td className={`px-4 py-2 text-right ${pa.totalReturnPercent >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                        {formatPct(pa.totalReturnPercent)}
                      </td>
                      <td className="px-4 py-2 text-right">{pa.contributionPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build
```

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/ReturnAttribution.tsx
git commit -m "feat: add ReturnAttribution page with TWR and contribution analysis"
```

---

### Task 16: AllocationAnalysis enhancements (threshold + alerts)

**Files:**
- Modify: `web/src/pages/AllocationAnalysis.tsx`

- [ ] **Step 1: Add threshold settings and alert indicators**

In `AllocationAnalysis.tsx`, add `useRebalanceAlerts` hook:

```typescript
import { useRebalanceAlerts } from '../hooks/useRebalanceAlerts';

// Inside the component, after existing hooks:
const { statuses, updateAlerts } = useRebalanceAlerts();
const [showThresholdSettings, setShowThresholdSettings] = useState(false);
```

Pass triggered statuses to the comparison and rebalance components. Add a threshold settings section and highlight triggered categories.

Find the allocation comparison table (in `AllocationCompare` component) and add a visual indicator for triggered alerts:

```tsx
// In the category row, add border highlight for triggered items:
const alertStatus = statuses.find((s) => s.category === item.category);
const isTriggered = alertStatus?.triggered;

// Apply conditional className:
// className={isTriggered ? 'border-l-2 border-l-orange-400 bg-orange-50/50' : ''}
```

Add threshold settings section at the bottom of the page:

```tsx
{showThresholdSettings && (
  <div className="rounded-lg border border-sand/60 p-4 space-y-3">
    <h3 className="text-sm font-medium">偏离度阈值设置</h3>
    {statuses.map((s) => (
      <div key={s.category} className="flex items-center gap-3">
        <span className="text-[13px] w-20">{s.category}</span>
        <input
          type="range"
          min="1"
          max="20"
          value={s.threshold}
          onChange={(e) => {
            // Update local state, save on release
          }}
          className="flex-1 h-1"
        />
        <span className="text-[12px] w-10 text-right">{s.threshold}%</span>
        <button
          onClick={() => {
            // Toggle enabled
          }}
          className={`text-[11px] px-2 py-0.5 rounded ${s.enabled ? 'bg-brand/10 text-brand' : 'bg-stone/10 text-stone'}`}
        >
          {s.enabled ? '启用' : '禁用'}
        </button>
      </div>
    ))}
    <div className="flex justify-end">
      <Button size="sm" onClick={() => {
        const alerts = statuses.map((s) => ({
          category: s.category,
          threshold: s.threshold,
          enabled: s.enabled,
        }));
        updateAlerts({ alerts });
        setShowThresholdSettings(false);
      }}>
        保存阈值
      </Button>
    </div>
  </div>
)}
```

Additionally, request browser notification permission on mount:

```typescript
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);

useEffect(() => {
  const triggered = statuses.filter((s) => s.triggered);
  if (triggered.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
    const names = triggered.map((s) => s.category).join('、');
    new Notification('配置偏离提醒', {
      body: `${names} 偏离目标配置超过阈值，建议再平衡`,
    });
  }
}, [statuses]);
```

- [ ] **Step 2: Verify build**

```bash
bun run build
```

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/AllocationAnalysis.tsx
git commit -m "feat: add rebalance threshold settings and alert indicators"
```

---

### Task 17: NavBar + App.tsx update for 5 pages

**Files:**
- Modify: `web/src/components/NavBar.tsx`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Update NavBar links**

In `NavBar.tsx`, update the `links` array:

```typescript
const links = [
  { to: '/', label: '概览' },
  { to: '/fire', label: 'FIRE' },
  { to: '/allocation', label: '配置' },
  { to: '/returns', label: '收益' },
  { to: '/transactions', label: '交易' },
];
```

- [ ] **Step 2: Update App.tsx routes**

```typescript
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import AllocationAnalysis from './pages/AllocationAnalysis';
import AssetOverview from './pages/AssetOverview';
import FireTracking from './pages/FireTracking';
import ReturnAttribution from './pages/ReturnAttribution';
import TransactionList from './pages/TransactionList';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AssetOverview />} />
          <Route path="/fire" element={<FireTracking />} />
          <Route path="/allocation" element={<AllocationAnalysis />} />
          <Route path="/returns" element={<ReturnAttribution />} />
          <Route path="/transactions" element={<TransactionList />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-ivory)',
            border: '1px solid var(--color-sand)',
            color: 'var(--color-deep)',
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: No errors. 5 navigation items, 5 routes.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/NavBar.tsx web/src/App.tsx
git commit -m "feat: update navigation to 5 pages with v2 routes"
```

---

## Execution Order

```
Phase 1 (Foundation — sequential):
  1. Data model migration
  2. Shared types + schemas        ← after 1
  3. PriceAdapter interface        ← after 2

Phase 2 (Parallel):
  4. All market adapters           ← after 2
  6. ReturnCalculator              ← after 2
  7. RebalanceChecker + calc       ← after 2

Phase 3:
  5. PriceService + ExchangeRate   ← after 4

Phase 4 (Parallel):
  8. /api/prices + exchange-rates  ← after 5
  9. /api/transactions             ← after 5
  10. /api/returns + rebalance     ← after 5+6+7

Phase 5:
  11. Register routes + scheduler  ← after 8+9+10

Phase 6:
  12. API client + hooks           ← after 11

Phase 7 (Parallel):
  13. AssetOverview enhancements   ← after 12
  14. TransactionList page         ← after 12
  15. ReturnAttribution page       ← after 12
  16. AllocationAnalysis enhance   ← after 12
  17. NavBar + App.tsx             ← after 12
```
