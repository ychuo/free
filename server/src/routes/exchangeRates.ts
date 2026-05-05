import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { exchangeRateService } from '../lib/ExchangeRateService';
import { prisma } from '../lib/prisma';

export async function exchangeRateRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const rates = await prisma.exchangeRate.findMany();
    return reply.send(rates);
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await exchangeRateService.refreshAll();
    return reply.send(result);
  });
}
