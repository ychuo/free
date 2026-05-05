import { SUPPORTED_CURRENCIES } from '@free/shared';
import { ExchangeRateAdapter } from './adapters/ExchangeRateAdapter';
import { prisma } from './prisma';

export class ExchangeRateService {
  private adapter = new ExchangeRateAdapter();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private refreshMs = 24 * 60 * 60 * 1000;

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
      return {
        updated: 0,
        errors: [e instanceof Error ? e.message : 'unknown'],
      };
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
