import type { PriceAdapter, PriceResult } from './PriceAdapter';

export class UStockAdapter implements PriceAdapter {
  readonly name = 'UStock';

  private get apiKey(): string {
    return process.env.ALPHA_VANTAGE_API_KEY || '';
  }

  async fetchPrices(symbols: string[]): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    for (const s of symbols) {
      try {
        const r = await this.fetchPrice(s);
        results.push(r);
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
    const json = (await res.json()) as any;
    const d = json['Global Quote'];

    if (!d?.['05. price']) throw new Error(`No data for ${tickerSymbol}`);

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
