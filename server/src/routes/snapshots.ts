import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';

const userId = config.userId;

export async function snapshotRoutes(app: FastifyInstance) {
  app.post('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });

    const totalAssets = assets.reduce((sum, a) => sum + a.totalValue, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining, 0);
    const netWorth = totalAssets - totalLiabilities;

    const breakdown: Record<string, number> = {};
    for (const a of assets) {
      breakdown[a.category] = (breakdown[a.category] || 0) + a.totalValue;
    }

    const snapshot = await prisma.snapshot.create({
      data: { userId, totalAssets, totalLiabilities, netWorth, breakdown },
    });
    return reply.status(201).send(snapshot);
  });

  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshots = await prisma.snapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    });
    return reply.send(snapshots);
  });

  app.delete('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const { count } = await prisma.snapshot.deleteMany({ where: { userId } });
    return reply.send({ deleted: count });
  });

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.snapshot.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: '快照不存在' });
    await prisma.snapshot.delete({ where: { id } });
    return reply.status(204).send();
  });
}
