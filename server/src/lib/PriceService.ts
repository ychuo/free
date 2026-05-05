import type { PriceAdapter } from './adapters/PriceAdapter';
import { prisma } from './prisma';

export class PriceService {
  private adapters: Map<string, PriceAdapter> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private refreshMs = 15 * 60 * 1000;

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

    const byExchange: Map<string, { adapter: PriceAdapter; symbols: string[] }> = new Map();
    for (const asset of autoAssets) {
      const adapter = this.findAdapterForExchange(asset.exchangeCode || '');
      if (!adapter) continue;
      const key = adapter.name;
      if (!byExchange.has(key)) {
        byExchange.set(key, { adapter, symbols: [] });
      }
      // For SH/SZ, append exchange to ticker so adapter knows the market
      const symbol =
        asset.exchangeCode === 'SH' || asset.exchangeCode === 'SZ'
          ? `${asset.tickerSymbol}.${asset.exchangeCode}`
          : asset.tickerSymbol!;
      byExchange.get(key)!.symbols.push(symbol);
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [, { adapter, symbols }] of byExchange) {
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
    if (!asset?.tickerSymbol || asset.priceSource !== 'AUTO') return false;

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
