import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import type { NetWorthSummary } from '@free/shared';

const userId = config.userId;

export async function netWorthRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });

    const totalAssets = assets.reduce((sum, a) => sum + a.totalValue, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining, 0);
    const netWorth = totalAssets - totalLiabilities;

    const categoryBreakdown = {} as Record<string, number>;
    for (const a of assets) {
      categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + a.totalValue;
    }

    const prevSnapshot = await prisma.snapshot.findFirst({
      where: { userId }, orderBy: { snapshotDate: 'desc' },
    });

    let previousNetWorth: number | null = null;
    let change: number | null = null;
    let changePercent: number | null = null;

    if (prevSnapshot) {
      previousNetWorth = prevSnapshot.netWorth;
      change = netWorth - previousNetWorth;
      changePercent = previousNetWorth !== 0 ? (change / Math.abs(previousNetWorth)) * 100 : 0;
    }

    const summary: NetWorthSummary = {
      totalAssets, totalLiabilities, netWorth,
      previousNetWorth, change, changePercent, categoryBreakdown,
    };
    return reply.send(summary);
  });

  app.get('/history', async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshots = await prisma.snapshot.findMany({
      where: { userId }, orderBy: { snapshotDate: 'desc' }, take: 30,
    });
    return reply.send(snapshots);
  });
}
