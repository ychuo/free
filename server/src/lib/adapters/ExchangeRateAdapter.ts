export interface ExchangeRateResult {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export class ExchangeRateAdapter {
  readonly name = 'ExchangeRate';

  async fetchRates(fromCurrency: string, toCurrencies: string[]): Promise<ExchangeRateResult[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrencies.join(',')}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = (await res.json()) as any;

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
