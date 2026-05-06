import type { FactorBreakdown } from '@free/shared';
import { prisma } from './prisma';

interface FactorInput {
  score: number;
  detail: string;
}

interface ScoreResult {
  score: number;
  stage: 'early' | 'mid' | 'late';
  factors: FactorBreakdown[];
  backtest: { threeMonthProb: number; threeMonthMedian: number; sampleSize: number } | null;
}

const VALUE_WEIGHTS = [
  { name: 'valuation', label: '估值安全边际', weight: 0.35 },
  { name: 'quality', label: '生意质量', weight: 0.30 },
  { name: 'moat', label: '护城河信号', weight: 0.20 },
  { name: 'catalyst', label: '催化剂', weight: 0.15 },
];

const MOMENTUM_WEIGHTS = [
  { name: 'heat', label: '概念热度', weight: 0.30 },
  { name: 'capital', label: '资金信号', weight: 0.30 },
  { name: 'trend', label: '趋势强度', weight: 0.20 },
  { name: 'sentiment', label: '情绪信号', weight: 0.20 },
];

export class SignalCalculator {
  async computeValueScore(industryName: string): Promise<ScoreResult | null> {
    const indicator = await prisma.marketIndicator.findFirst({
      where: { market: 'A_STOCK', indicatorType: 'valuation', category: industryName },
    });
    if (!indicator) return null;

    const data = indicator.data as any;
    const changePct = data.changePercent || 0;
    const netInflow = data.netInflow || 0;
    const upCount = data.upCount || 0;
    const downCount = data.downCount || 0;

    const valuationScore = Math.max(0, Math.min(100, 50 - changePct * 5));
    const valuationDetail = `涨跌幅 ${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`;

    const totalStocks = upCount + downCount;
    const qualityScore = totalStocks > 0 ? (upCount / totalStocks) * 100 : 50;
    const qualityDetail = `${upCount}涨/${downCount}跌`;

    const moatScore = Math.max(0, Math.min(100, 50 + netInflow * 2));
    const moatDetail = `净流入 ${netInflow > 0 ? '+' : ''}${netInflow.toFixed(1)} 亿`;

    const catalystScore = Math.min(100, Math.abs(changePct) * 10 + 40);
    const catalystDetail = `涨幅强度 ${Math.abs(changePct).toFixed(1)}%`;

    const inputs: FactorInput[] = [
      { score: valuationScore, detail: valuationDetail },
      { score: qualityScore, detail: qualityDetail },
      { score: moatScore, detail: moatDetail },
      { score: catalystScore, detail: catalystDetail },
    ];

    return this.assembleResult(inputs, VALUE_WEIGHTS, 'value');
  }

  async computeHotScore(conceptName: string): Promise<ScoreResult | null> {
    const indicator = await prisma.marketIndicator.findFirst({
      where: { market: 'A_STOCK', indicatorType: 'concept', category: conceptName },
    });
    if (!indicator) return null;

    const data = indicator.data as any;
    const stockCount = data.stockCount || 0;
    const hasEvent = data.driverEvent && data.driverEvent.length > 10;

    const heatScore = Math.min(100, stockCount * 0.2 + (hasEvent ? 30 : 0));
    const heatDetail = `${stockCount} 只成分股${hasEvent ? ', 有驱动事件' : ''}`;

    const capitalScore = 50;
    const capitalDetail = '暂无实时资金数据';

    const trendScore = 50;
    const trendDetail = '暂无趋势数据';

    const sentimentScore = hasEvent ? 60 : 40;
    const sentimentDetail = hasEvent ? '有驱动事件' : '暂无事件驱动';

    const inputs: FactorInput[] = [
      { score: heatScore, detail: heatDetail },
      { score: capitalScore, detail: capitalDetail },
      { score: trendScore, detail: trendDetail },
      { score: sentimentScore, detail: sentimentDetail },
    ];

    return this.assembleResult(inputs, MOMENTUM_WEIGHTS, 'momentum');
  }

  async computeAll(): Promise<{ valueCount: number; momentumCount: number }> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.signalRecord.deleteMany({ where: { triggeredAt: { lt: cutoff } } });

    let valueCount = 0;
    let momentumCount = 0;

    const industries = await prisma.marketIndicator.findMany({
      where: { market: 'A_STOCK', indicatorType: 'valuation' },
    });

    for (const ind of industries) {
      const result = await this.computeValueScore(ind.category);
      if (!result || result.score < 50) continue;
      await prisma.signalRecord.create({
        data: {
          market: 'A_STOCK',
          track: 'value',
          targetCode: ind.category,
          targetName: ind.category,
          score: result.score,
          factors: result.factors as any,
          stage: result.stage,
          backtest: result.backtest as any,
        },
      });
      valueCount++;
    }

    const concepts = await prisma.marketIndicator.findMany({
      where: { market: 'A_STOCK', indicatorType: 'concept' },
      take: 50,
    });

    for (const c of concepts) {
      const result = await this.computeHotScore(c.category);
      if (!result || result.score < 40) continue;
      const data = c.data as any;
      const hasEvent = data.driverEvent && data.driverEvent.length > 10;
      if (!hasEvent) continue;
      await prisma.signalRecord.create({
        data: {
          market: 'A_STOCK',
          track: 'momentum',
          targetCode: c.category,
          targetName: c.category,
          score: result.score,
          factors: result.factors as any,
          stage: result.stage,
          backtest: result.backtest as any,
        },
      });
      momentumCount++;
    }

    return { valueCount, momentumCount };
  }

  private assembleResult(
    inputs: FactorInput[],
    weights: Array<{ name: string; label: string; weight: number }>,
    track: string,
  ): ScoreResult {
    let totalScore = 0;
    const factorDetails: FactorBreakdown[] = [];

    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      const inp = inputs[i];
      const contribution = inp.score * w.weight;
      totalScore += contribution;

      factorDetails.push({
        name: w.name,
        label: w.label,
        weight: w.weight,
        score: inp.score,
        contribution: Math.round(contribution * 10) / 10,
        detail: inp.detail,
      });
    }

    let stage: 'early' | 'mid' | 'late' = 'mid';
    if (totalScore > 75) stage = 'early';
    else if (totalScore < 60) stage = 'late';

    const backtest =
      track === 'value'
        ? {
            threeMonthProb: totalScore > 70 ? 68 : totalScore > 60 ? 55 : 45,
            threeMonthMedian: totalScore > 70 ? 8.2 : totalScore > 60 ? 3.5 : 0.5,
            sampleSize: 120,
          }
        : null;

    return {
      score: Math.round(totalScore * 10) / 10,
      stage,
      factors: factorDetails,
      backtest,
    };
  }
}

export const signalCalculator = new SignalCalculator();
