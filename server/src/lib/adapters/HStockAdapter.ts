import type { PriceAdapter, PriceResult } from './PriceAdapter';

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
    const json = (await res.json()) as any;
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
