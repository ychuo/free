import { REBALANCE_ALERTS_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { rebalanceChecker } from '../lib/RebalanceChecker';

const userId = config.userId;

export async function rebalanceAlertRoutes(app: FastifyInstance) {
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const statuses = await rebalanceChecker.getStatus();
    return reply.send(statuses);
  });

  app.put(
    '/',
    { schema: { body: REBALANCE_ALERTS_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { alerts } = request.body as {
        alerts: { category: string; threshold: number; enabled: boolean }[];
      };

      await prisma.rebalanceAlert.deleteMany({ where: { userId } });

      for (const alert of alerts) {
        await prisma.rebalanceAlert.create({
          data: {
            userId,
            category: alert.category,
            threshold: alert.threshold,
            enabled: alert.enabled,
          },
        });
      }

      const statuses = await rebalanceChecker.getStatus();
      return reply.send(statuses);
    },
  );
}
