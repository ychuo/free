import { aStockMarketAdapter } from './adapters/AStockMarketAdapter';
import { prisma } from './prisma';

export class MarketDataService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private refreshMs = 60 * 60 * 1000; // 1 hour

  async refreshValuation(): Promise<{ count: number }> {
    const data = await aStockMarketAdapter.fetchValuation();
    // Clear old valuation data before inserting new
    await prisma.marketIndicator.deleteMany({
      where: { market: 'A_STOCK', indicatorType: 'valuation' },
    });
    for (const item of data) {
      await prisma.marketIndicator.upsert({
        where: {
          market_indicatorType_category: {
            market: 'A_STOCK',
            indicatorType: 'valuation',
            category: item.sector,
          },
        },
        create: {
          market: 'A_STOCK',
          indicatorType: 'valuation',
          category: item.sector,
          data: item as unknown as Record<string, unknown>,
        },
        update: {
          data: item as unknown as Record<string, unknown>,
          fetchedAt: new Date(),
        },
      });
    }
    return { count: data.length };
  }

  async refreshConcepts(): Promise<{ count: number }> {
    const data = await aStockMarketAdapter.fetchConcepts();
    await prisma.marketIndicator.deleteMany({
      where: { market: 'A_STOCK', indicatorType: 'concept' },
    });
    for (const item of data) {
      await prisma.marketIndicator.upsert({
        where: {
          market_indicatorType_category: {
            market: 'A_STOCK',
            indicatorType: 'concept',
            category: item.name,
          },
        },
        create: {
          market: 'A_STOCK',
          indicatorType: 'concept',
          category: item.name,
          data: item as unknown as Record<string, unknown>,
        },
        update: {
          data: item as unknown as Record<string, unknown>,
          fetchedAt: new Date(),
        },
      });
    }
    return { count: data.length };
  }

  async refreshFundFlow(): Promise<void> {
    const data = await aStockMarketAdapter.fetchFundFlow();
    await prisma.marketIndicator.upsert({
      where: {
        market_indicatorType_category: {
          market: 'A_STOCK',
          indicatorType: 'fund_flow',
          category: 'north_bound',
        },
      },
      create: {
        market: 'A_STOCK',
        indicatorType: 'fund_flow',
        category: 'north_bound',
        data: data as unknown as Record<string, unknown>,
      },
      update: {
        data: data as unknown as Record<string, unknown>,
        fetchedAt: new Date(),
      },
    });
  }

  async refreshAll(): Promise<{ valuation: number; concepts: number }> {
    let valuation = 0;
    let concepts = 0;
    try {
      const result = await this.refreshValuation();
      valuation = result.count;
    } catch (e) {
      console.error('[MarketDataService] Valuation refresh failed:', e);
    }
    try {
      const result = await this.refreshConcepts();
      concepts = result.count;
    } catch (e) {
      console.error('[MarketDataService] Concepts refresh failed:', e);
    }
    try {
      await this.refreshFundFlow();
    } catch (e) {
      console.error('[MarketDataService] Fund flow refresh failed:', e);
    }
    return { valuation, concepts };
  }

  startScheduler(intervalMs?: number): void {
    if (this.intervalId) return;
    const ms = intervalMs || this.refreshMs;
    console.log(`[MarketDataService] Starting scheduler, interval: ${ms / 1000}s`);
    this.refreshAll().catch((e) => console.error('[MarketDataService] Initial fetch error:', e));
    this.intervalId = setInterval(() => {
      this.refreshAll().catch((e) => console.error('[MarketDataService] Scheduler error:', e));
    }, ms);
  }

  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[MarketDataService] Scheduler stopped');
    }
  }
}

export const marketDataService = new MarketDataService();
