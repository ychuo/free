import { prisma } from './prisma';

export class ReturnCalculator {
  async computeTWR(assetIds: string[], from: Date, to: Date): Promise<number | null> {
    const transactions = await prisma.transaction.findMany({
      where: {
        assetId: { in: assetIds },
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });

    const events: { date: Date; cashFlow: number; portfolioValue: number }[] = [];

    for (const tx of transactions) {
      let cashFlow = 0;
      if (tx.type === 'BUY') cashFlow = -tx.amount;
      else if (tx.type === 'SELL') cashFlow = tx.amount;
      else if (tx.type === 'DIVIDEND') cashFlow = tx.amount;

      const preValue = await this.getPortfolioValueAt(assetIds, tx.date);
      events.push({ date: tx.date, cashFlow, portfolioValue: preValue });
    }

    if (events.length === 0) return null;

    let twr = 1.0;
    for (const event of events) {
      const endValue = event.portfolioValue - event.cashFlow;
      const startValue = event.portfolioValue;
      if (startValue !== 0) {
        twr *= endValue / startValue;
      }
    }

    return twr - 1;
  }

  async computeSimpleReturn(assetId: string): Promise<{
    costBasis: number;
    currentValue: number;
    totalReturn: number;
    totalReturnPercent: number;
  }> {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error(`Asset ${assetId} not found`);

    const costBasis = asset.costBasis ?? 0;
    const currentValue = asset.totalValue;

    return {
      costBasis,
      currentValue,
      totalReturn: currentValue - costBasis,
      totalReturnPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
    };
  }

  async analyzeReturns(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<{
    twr: number | null;
    totalReturn: number;
    totalReturnPercent: number;
    perAsset: Array<{
      assetId: string;
      assetName: string;
      category: string;
      costBasis: number;
      currentValue: number;
      totalReturn: number;
      totalReturnPercent: number;
      contribution: number;
      contributionPercent: number;
    }>;
    from: string;
    to: string;
  }> {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const now = new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(assets.reduce((min, a) => Math.min(min, a.createdAt.getTime()), now.getTime()));
    const toDate = to ? new Date(to) : now;

    const assetIds = assets.map((a) => a.id);
    const twr = await this.computeTWR(assetIds, fromDate, toDate);

    let totalCost = 0;
    let totalValue = 0;
    const perAsset: Array<{
      assetId: string;
      assetName: string;
      category: string;
      costBasis: number;
      currentValue: number;
      totalReturn: number;
      totalReturnPercent: number;
      contribution: number;
      contributionPercent: number;
    }> = [];

    for (const a of assets) {
      const cb = a.costBasis ?? 0;
      const cv = a.totalValue;
      const ret = cv - cb;
      const retPct = cb > 0 ? ((cv - cb) / cb) * 100 : 0;
      totalCost += cb;
      totalValue += cv;
      perAsset.push({
        assetId: a.id,
        assetName: a.name,
        category: a.category,
        costBasis: cb,
        currentValue: cv,
        totalReturn: ret,
        totalReturnPercent: retPct,
        contribution: ret,
        contributionPercent: 0,
      });
    }

    const totalRet = totalValue - totalCost;
    if (totalRet !== 0) {
      for (const pa of perAsset) {
        pa.contribution = pa.totalReturn;
        pa.contributionPercent = (pa.totalReturn / totalRet) * 100;
      }
    }

    return {
      twr,
      totalReturn: totalRet,
      totalReturnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      perAsset,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }

  private async getPortfolioValueAt(assetIds: string[], _date: Date): Promise<number> {
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });
    return assets.reduce((sum, a) => sum + a.totalValue, 0);
  }
}

export const returnCalculator = new ReturnCalculator();
