import type { FireProgress } from '@free/shared';
import { FIRE_PROFILE_SCHEMA } from '@free/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import {
  sumAnnualPassiveIncome,
  sumTotalAssetsWithRates,
  sumTotalLiabilities,
} from '../lib/calculations';
import { buildRateMap } from '../lib/exchangeRate';
import { prisma } from '../lib/prisma';

const userId = config.userId;

export async function fireProfileRoutes(app: FastifyInstance) {
  app.get('/fire-profile', async (_request: FastifyRequest, reply: FastifyReply) => {
    const profile = await prisma.fireProfile.findUnique({ where: { userId } });
    if (!profile) return reply.status(404).send({ error: 'FIRE profile not found', code: 404 });
    return reply.send(profile);
  });

  app.put(
    '/fire-profile',
    { schema: { body: FIRE_PROFILE_SCHEMA } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { annualExpense, safeWithdrawalRate } = request.body as any;
      const fireTarget = annualExpense / (safeWithdrawalRate || 0.04);

      const profile = await prisma.fireProfile.upsert({
        where: { userId },
        update: { annualExpense, safeWithdrawalRate, fireTarget },
        create: {
          userId,
          annualExpense,
          safeWithdrawalRate: safeWithdrawalRate || 0.04,
          fireTarget,
        },
      });
      return reply.send(profile);
    },
  );

  app.get('/fire-progress', async (_request: FastifyRequest, reply: FastifyReply) => {
    const profile = await prisma.fireProfile.findUnique({ where: { userId } });
    if (!profile) return reply.status(404).send({ error: 'FIRE profile not found', code: 404 });

    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });

    const rateFn = await buildRateMap();
    const annualPassiveIncome = sumAnnualPassiveIncome(assets);
    const netWorth = sumTotalAssetsWithRates(assets, rateFn) - sumTotalLiabilities(liabilities);

    const progress: FireProgress = {
      annualExpense: profile.annualExpense,
      safeWithdrawalRate: profile.safeWithdrawalRate,
      fireTarget: profile.fireTarget,
      annualPassiveIncome,
      coverageRate:
        profile.annualExpense > 0 ? (annualPassiveIncome / profile.annualExpense) * 100 : 0,
      netWorth,
      gap: profile.fireTarget - netWorth,
    };
    return reply.send(progress);
  });
}
