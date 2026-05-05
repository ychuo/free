import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { priceService } from '../lib/PriceService';
import { prisma } from '../lib/prisma';

export async function priceRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const prices = await prisma.marketPrice.findMany();
    return reply.send(prices);
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await priceService.refreshAll();
    return reply.send(result);
  });

  app.post('/refresh/:assetId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string };
    const ok = await priceService.refreshAsset(assetId);
    if (!ok) return reply.status(400).send({ error: 'Refresh failed', code: 400 });
    return reply.send({ success: true });
  });
}
