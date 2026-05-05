import type { PriceAdapter, PriceResult } from './PriceAdapter';

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
    const json = (await res.json()) as any;
    const d = json.data;

    if (!d || d.f43 === undefined) throw new Error(`No data for ${tickerSymbol}`);

    return {
      tickerSymbol: code,
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
