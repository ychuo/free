import type { PriceAdapter, PriceResult } from './PriceAdapter';

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
