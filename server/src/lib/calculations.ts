interface AssetLike {
  category: string;
  totalValue: number;
  passiveIncome?: number | null;
  properties?: Record<string, unknown> | null;
  currency?: string;
}

interface LiabilityLike {
  remaining: number;
}

export function sumTotalAssets(assets: AssetLike[]): number {
  return assets.reduce((sum, a) => {
    const exchangeRate = (a.properties?.exchangeRate as number | undefined) ?? 1;
    const currency = a.currency ?? 'CNY';
    if (currency === 'CNY') return sum + a.totalValue;
    return sum + a.totalValue * exchangeRate;
  }, 0);
}

export function sumTotalLiabilities(liabilities: LiabilityLike[]): number {
  return liabilities.reduce((sum, l) => sum + l.remaining, 0);
}

export function computeNetWorth(assets: AssetLike[], liabilities: LiabilityLike[]): number {
  return sumTotalAssets(assets) - sumTotalLiabilities(liabilities);
}

export function computeCategoryBreakdown(assets: AssetLike[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const a of assets) {
    const exchangeRate = (a.properties?.exchangeRate as number | undefined) ?? 1;
    const currency = a.currency ?? 'CNY';
    const cnyValue = currency === 'CNY' ? a.totalValue : a.totalValue * exchangeRate;
    breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
  }
  return breakdown;
}

export function sumAnnualPassiveIncome(assets: AssetLike[]): number {
  return assets.reduce((sum, a) => sum + (a.passiveIncome || 0), 0);
}

export function computeCategoryBreakdownWithRates(
  assets: AssetLike[],
  getRate: (currency: string) => number,
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const a of assets) {
    const currency = a.currency ?? 'CNY';
    const rate = getRate(currency);
    const cnyValue = currency === 'CNY' ? a.totalValue : a.totalValue * rate;
    breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
  }
  return breakdown;
}

export function sumTotalAssetsWithRates(
  assets: AssetLike[],
  getRate: (currency: string) => number,
): number {
  return assets.reduce((sum, a) => {
    const currency = a.currency ?? 'CNY';
    const rate = getRate(currency);
    if (currency === 'CNY') return sum + a.totalValue;
    return sum + a.totalValue * rate;
  }, 0);
}
