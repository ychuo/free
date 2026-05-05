import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { returnCalculator } from '../lib/ReturnCalculator';

const userId = config.userId;

export async function returnRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { from, to } = request.query as { from?: string; to?: string };
    const analysis = await returnCalculator.analyzeReturns(userId, from, to);
    return reply.send(analysis);
  });

  app.get('/:assetId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string };
    const simpleReturn = await returnCalculator.computeSimpleReturn(assetId);
    return reply.send(simpleReturn);
  });
}
