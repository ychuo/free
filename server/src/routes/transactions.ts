import { TRANSACTION_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';

const userId = config.userId;

async function recalculateCostBasis(assetId: string): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: { assetId },
    orderBy: { date: 'asc' },
  });

  let totalCost = 0;
  let totalQty = 0;

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      totalCost += tx.amount + (tx.fee || 0);
      totalQty += tx.quantity || 0;
    } else if (tx.type === 'SELL') {
      const sellQty = tx.quantity || 0;
      if (totalQty > 0) {
        const avgCost = totalCost / totalQty;
        totalCost -= avgCost * sellQty;
      }
      totalQty -= sellQty;
    }
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { costBasis: totalCost > 0 ? totalCost : null },
  });
}

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.query as { assetId?: string };
    const where: Record<string, unknown> = { userId };
    if (assetId) where.assetId = assetId;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return reply.send(transactions);
  });

  app.post(
    '/',
    { schema: { body: TRANSACTION_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId, type, date, quantity, price, amount, fee, notes } = request.body as any;

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          assetId,
          type,
          date: new Date(date),
          quantity: quantity ?? null,
          price: price ?? null,
          amount,
          fee: fee ?? 0,
          notes: notes ?? null,
        },
      });

      await recalculateCostBasis(assetId);

      return reply.status(201).send(transaction);
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: TRANSACTION_SCHEMA.properties,
          additionalProperties: false,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, any>;
      const data: Record<string, unknown> = {};

      const fields = ['type', 'quantity', 'price', 'amount', 'fee', 'notes'];
      for (const f of fields) {
        if (body[f] !== undefined) data[f] = body[f];
      }
      if (body.date !== undefined) data.date = new Date(body.date);
      if (body.assetId !== undefined) data.assetId = body.assetId;

      const transaction = await prisma.transaction.update({ where: { id }, data });
      await recalculateCostBasis(transaction.assetId);

      return reply.send(transaction);
    },
  );

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return reply.status(404).send({ error: 'Not found', code: 404 });

    await prisma.transaction.delete({ where: { id } });
    await recalculateCostBasis(tx.assetId);

    return reply.status(204).send();
  });
}
