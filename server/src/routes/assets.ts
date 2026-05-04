import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { config } from '../config';

const userId = config.userId;

export async function assetRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { category } = request.query as { category?: string };
    const where: Record<string, unknown> = { userId };
    if (category) where.category = category;

    const assets = await prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
    return reply.send(assets);
  });

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, category, subType, quantity, unitPrice, currency, passiveIncome, properties, acquiredAt, notes } = request.body as any;
    const totalValue = quantity * unitPrice;

    const asset = await prisma.asset.create({
      data: {
        userId, name, category, subType, quantity, unitPrice, totalValue,
        currency: currency || 'CNY', passiveIncome, properties,
        acquiredAt: acquiredAt ? new Date(acquiredAt) : null, notes,
      },
    });
    return reply.status(201).send(asset);
  });

  app.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const data: Record<string, unknown> = {};

    const fields = ['name', 'category', 'subType', 'quantity', 'unitPrice', 'currency', 'passiveIncome', 'properties', 'notes'];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    if (body.acquiredAt !== undefined) {
      data.acquiredAt = body.acquiredAt ? new Date(body.acquiredAt) : null;
    }

    if (body.quantity !== undefined || body.unitPrice !== undefined) {
      const existing = await prisma.asset.findFirst({ where: { id, userId } });
      if (!existing) return reply.status(404).send({ error: 'Asset not found', code: 404 });
      data.totalValue = ((body.quantity ?? existing.quantity) as number) * ((body.unitPrice ?? existing.unitPrice) as number);
    }

    const asset = await prisma.asset.update({ where: { id }, data });
    return reply.send(asset);
  });

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await prisma.asset.deleteMany({ where: { id, userId } });
    return reply.status(204).send();
  });
}
