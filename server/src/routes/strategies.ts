import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';

export async function strategyRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { type } = request.query as { type?: string };
    const where = type ? { type } : {};
    const templates = await prisma.strategyTemplate.findMany({ where });
    return reply.send(templates);
  });

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const template = await prisma.strategyTemplate.findUnique({ where: { id } });
    if (!template) return reply.status(404).send({ error: 'Strategy not found', code: 404 });
    return reply.send(template);
  });
}
