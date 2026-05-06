import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { marketDataService } from '../lib/MarketDataService';
import { prisma } from '../lib/prisma';

export async function marketDataRoutes(app: FastifyInstance) {
  app.get('/valuation', async (_request: FastifyRequest, reply: FastifyReply) => {
    const indicators = await prisma.marketIndicator.findMany({
      where: { market: 'A_STOCK', indicatorType: 'valuation' },
      orderBy: { category: 'asc' },
    });
    const data = indicators.map((i) => i.data);
    return reply.send(data);
  });

  app.get('/concepts', async (_request: FastifyRequest, reply: FastifyReply) => {
    const indicators = await prisma.marketIndicator.findMany({
      where: { market: 'A_STOCK', indicatorType: 'concept' },
      orderBy: { fetchedAt: 'desc' },
    });
    const data = indicators.map((i) => i.data);
    return reply.send(data);
  });

  app.get('/fund-flow', async (_request: FastifyRequest, reply: FastifyReply) => {
    const indicator = await prisma.marketIndicator.findFirst({
      where: { market: 'A_STOCK', indicatorType: 'fund_flow' },
      orderBy: { fetchedAt: 'desc' },
    });
    return reply.send(indicator ? indicator.data : null);
  });

  app.get('/portfolio-alerts', async (_request: FastifyRequest, reply: FastifyReply) => {
    const [assets, indicators] = await Promise.all([
      prisma.asset.findMany({ where: { track: 'value' } }),
      prisma.marketIndicator.findMany({
        where: { market: 'A_STOCK', indicatorType: 'valuation' },
      }),
    ]);

    const valuationMap = new Map<string, any>();
    for (const ind of indicators) {
      const d = ind.data as any;
      valuationMap.set(ind.category, d);
    }

    const alerts: Array<{
      assetName: string;
      assetTrack: string;
      sector: string;
      currentPE: number;
      pePercentile: number;
      alertType: 'undervalued' | 'overvalued';
      message: string;
    }> = [];

    for (const asset of assets) {
      const sector = (asset.properties as any)?.sector;
      if (!sector) continue;
      const valuation = valuationMap.get(sector);
      if (!valuation) continue;

      const pct = valuation.pePercentile;
      if (pct < 20) {
        alerts.push({
          assetName: asset.name,
          assetTrack: asset.track,
          sector,
          currentPE: valuation.currentPE,
          pePercentile: pct,
          alertType: 'undervalued',
          message: `${sector}行业PE处于近5年${pct.toFixed(0)}%分位，属于低估区间`,
        });
      } else if (pct > 80) {
        alerts.push({
          assetName: asset.name,
          assetTrack: asset.track,
          sector,
          currentPE: valuation.currentPE,
          pePercentile: pct,
          alertType: 'overvalued',
          message: `${sector}行业PE处于近5年${pct.toFixed(0)}%分位，属于高估区间`,
        });
      }
    }

    return reply.send(alerts);
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await marketDataService.refreshAll();
    return reply.send(result);
  });
}
