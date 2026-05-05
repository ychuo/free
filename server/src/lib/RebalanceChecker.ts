import type { AllocationAnalysis, AssetCategory, RebalanceAlertStatus } from '@free/shared';
import { prisma } from './prisma';

export class RebalanceChecker {
  async checkAll(analysis: AllocationAnalysis[]): Promise<RebalanceAlertStatus[]> {
    const alerts = await prisma.rebalanceAlert.findMany();

    const thresholds = new Map<string, { threshold: number; enabled: boolean }>();
    for (const a of alerts) {
      thresholds.set(a.category, { threshold: a.threshold, enabled: a.enabled });
    }

    const results: RebalanceAlertStatus[] = [];
    for (const item of analysis) {
      const config = thresholds.get(item.category);
      const threshold = config?.threshold ?? 5;
      const enabled = config?.enabled ?? true;

      const deviation = Math.abs(item.currentRatio - item.targetRatio);
      results.push({
        category: item.category as AssetCategory,
        currentRatio: item.currentRatio,
        targetRatio: item.targetRatio,
        deviation,
        threshold,
        enabled,
        triggered: enabled && deviation > threshold,
      });
    }

    return results;
  }

  async getStatus(): Promise<RebalanceAlertStatus[]> {
    const analysis = await this.getCurrentAnalysis();
    return this.checkAll(analysis);
  }

  private async getCurrentAnalysis(): Promise<AllocationAnalysis[]> {
    const assets = await prisma.asset.findMany();
    const targets = await prisma.allocationTarget.findMany();

    const breakdown: Record<string, number> = {};
    let totalValue = 0;

    for (const a of assets) {
      const rate = await this.getExchangeRate(a.currency);
      const cnyValue = a.totalValue * rate;
      breakdown[a.category] = (breakdown[a.category] || 0) + cnyValue;
      totalValue += cnyValue;
    }

    const targetMap = new Map<string, number>();
    for (const t of targets) {
      targetMap.set(t.category, t.targetRatio);
    }

    const analysis: AllocationAnalysis[] = [];
    for (const [category, currentValue] of Object.entries(breakdown)) {
      const currentRatio = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      const targetRatio = targetMap.get(category) || 0;
      analysis.push({
        category: category as AssetCategory,
        currentValue,
        currentRatio,
        targetRatio,
        deviation: currentRatio - targetRatio,
        rebalanceAmount: ((targetRatio - currentRatio) / 100) * totalValue,
      });
    }

    return analysis;
  }

  private async getExchangeRate(currency: string): Promise<number> {
    if (currency === 'CNY') return 1;
    const rate = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: 'CNY', toCurrency: currency },
    });
    if (rate) return 1 / rate.rate;

    const asset = await prisma.asset.findFirst({
      where: { currency, properties: { path: ['exchangeRate'], not: null } },
    });
    if (asset?.properties?.exchangeRate) {
      return asset.properties.exchangeRate as number;
    }
    return 1;
  }
}

export const rebalanceChecker = new RebalanceChecker();
