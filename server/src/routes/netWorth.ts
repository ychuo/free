import type { NetWorthSummary } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import {
  computeCategoryBreakdown,
  computeNetWorth,
  sumTotalAssets,
  sumTotalLiabilities,
} from '../lib/calculations';
import { prisma } from '../lib/prisma';

const userId = config.userId;

export async function netWorthRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });

    const totalAssets = sumTotalAssets(assets);
    const totalLiabilities = sumTotalLiabilities(liabilities);
    const netWorth = computeNetWorth(assets, liabilities);

    const categoryBreakdown = computeCategoryBreakdown(assets);

    const prevSnapshot = await prisma.snapshot.findFirst({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
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
      totalAssets,
      totalLiabilities,
      netWorth,
      previousNetWorth,
      change,
      changePercent,
      categoryBreakdown,
    };
    return reply.send(summary);
  });

  app.get('/history', async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshots = await prisma.snapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    });
    return reply.send(snapshots);
  });
}
