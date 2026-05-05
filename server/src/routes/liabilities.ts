import { LIABILITY_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';

const userId = config.userId;

export async function liabilityRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const liabilities = await prisma.liability.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(liabilities);
  });

  app.post(
    '/',
    { schema: { body: LIABILITY_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { name, type, totalAmount, remaining, interestRate, monthlyPayment } =
        request.body as any;
      const liability = await prisma.liability.create({
        data: { userId, name, type, totalAmount, remaining, interestRate, monthlyPayment },
      });
      return reply.status(201).send(liability);
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: LIABILITY_SCHEMA.properties,
          additionalProperties: false,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, any>;
      const data: Record<string, unknown> = {};
      for (const f of [
        'name',
        'type',
        'totalAmount',
        'remaining',
        'interestRate',
        'monthlyPayment',
      ]) {
        if (body[f] !== undefined) data[f] = body[f];
      }
      const liability = await prisma.liability.update({ where: { id }, data });
      return reply.send(liability);
    },
  );

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await prisma.liability.deleteMany({ where: { id, userId } });
    return reply.status(204).send();
  });
}
