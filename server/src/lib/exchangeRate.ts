import { prisma } from './prisma';

export async function buildRateMap(): Promise<(currency: string) => number> {
  const rates = await prisma.exchangeRate.findMany();
  const rateMap = new Map<string, number>();
  for (const r of rates) {
    rateMap.set(r.toCurrency, 1 / r.rate);
  }

  return (currency: string) => {
    if (currency === 'CNY') return 1;
    return rateMap.get(currency) ?? 1;
  };
}
