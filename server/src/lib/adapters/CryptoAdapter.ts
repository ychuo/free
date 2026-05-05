import type { PriceAdapter, PriceResult } from './PriceAdapter';

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
    const json = (await res.json()) as Record<string, any>;
    if (!json.bitcoin && !json.ethereum) console.error('[CryptoAdapter] fetchPrices response:', JSON.stringify(json).slice(0, 300));

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
    } catch (e) {
      console.error('[CryptoAdapter] isAvailable error:', e);
      return false;
    }
  }
}
