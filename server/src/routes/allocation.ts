import type { AllocationAnalysis } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { computeCategoryBreakdown, sumTotalAssets } from '../lib/calculations';
import { prisma } from '../lib/prisma';

const userId = config.userId;

export async function allocationRoutes(app: FastifyInstance) {
  app.get('/allocation-targets', async (_request: FastifyRequest, reply: FastifyReply) => {
    const targets = await prisma.allocationTarget.findMany({ where: { userId } });
    return reply.send(targets);
  });

  app.put('/allocation-targets', async (request: FastifyRequest, reply: FastifyReply) => {
    const { targets } = request.body as { targets: { category: string; targetRatio: number }[] };
    const total = targets.reduce((s, t) => s + t.targetRatio, 0);
    if (total > 100.01) {
      return reply.status(400).send({ error: '目标比例总和不能超过 100%' });
    }
    const ops = targets.map((t) =>
      prisma.allocationTarget.upsert({
        where: { userId_category: { userId, category: t.category } },
        update: { targetRatio: t.targetRatio },
        create: { userId, category: t.category, targetRatio: t.targetRatio },
      }),
    );
    await prisma.$transaction(ops);
    const updated = await prisma.allocationTarget.findMany({ where: { userId } });
    return reply.send(updated);
  });

  app.get('/allocation-analysis', async (_request: FastifyRequest, reply: FastifyReply) => {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const targets = await prisma.allocationTarget.findMany({ where: { userId } });
    const totalValue = sumTotalAssets(assets);
    const currentByCategory = computeCategoryBreakdown(assets);

    const analysis: AllocationAnalysis[] = targets.map((t) => {
      const currentValue = currentByCategory[t.category] || 0;
      const currentRatio = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      const deviation = currentRatio - t.targetRatio;
      const targetValue = totalValue * (t.targetRatio / 100);
      const rebalanceAmount = targetValue - currentValue;

      return {
        category: t.category as AllocationAnalysis['category'],
        currentValue: Math.round(currentValue * 100) / 100,
        currentRatio: Math.round(currentRatio * 100) / 100,
        targetRatio: t.targetRatio,
        deviation: Math.round(deviation * 100) / 100,
        rebalanceAmount: Math.round(rebalanceAmount * 100) / 100,
      };
    });

    return reply.send(analysis);
  });
}
