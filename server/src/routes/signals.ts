import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { signalCalculator } from '../lib/SignalCalculator';

const userId = config.userId;

export async function signalRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { track, stage } = request.query as { track?: string; stage?: string };
    const where: Record<string, unknown> = {};
    if (track) where.track = track;
    if (stage) where.stage = stage;

    const signals = await prisma.signalRecord.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 50,
    });
    return reply.send(signals);
  });

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const signal = await prisma.signalRecord.findUnique({
      where: { id },
      include: { journals: { where: { userId }, take: 1 } },
    });
    if (!signal) return reply.status(404).send({ error: 'Signal not found', code: 404 });
    return reply.send(signal);
  });

  app.get('/history/list', async (_request: FastifyRequest, reply: FastifyReply) => {
    const signals = await prisma.signalRecord.findMany({
      where: { triggeredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { triggeredAt: 'desc' },
      include: { journals: { where: { userId }, take: 1 } },
      take: 100,
    });

    const result = [];
    for (const sig of signals) {
      const indicator = await prisma.marketIndicator.findFirst({
        where: {
          market: sig.market,
          indicatorType: sig.track === 'value' ? 'valuation' : 'concept',
          category: sig.targetName,
        },
        orderBy: { fetchedAt: 'desc' },
      });

      let outcome = null;
      if (indicator) {
        const data = indicator.data as any;
        const currentPrice = data.changePercent || 0;
        const daysElapsed = Math.floor(
          (Date.now() - new Date(sig.triggeredAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        outcome = { currentPrice, changePercent: currentPrice, daysElapsed };
      }

      result.push({
        signal: sig,
        journal: sig.journals[0] || null,
        outcome,
      });
    }

    return reply.send(result);
  });

  app.get('/:id/journal', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    let journal = await prisma.signalJournal.findFirst({
      where: { signalId: id, userId },
    });
    if (!journal) {
      journal = await prisma.signalJournal.create({
        data: { signalId: id, userId, note: '', action: 'watched' },
      });
    }
    return reply.send(journal);
  });

  app.put('/:id/journal', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { note, action } = request.body as { note?: string; action?: string };
    const data: Record<string, unknown> = {};
    if (note !== undefined) data.note = note;
    if (action !== undefined) data.action = action;

    const journal = await prisma.signalJournal.upsert({
      where: { userId_signalId: { userId, signalId: id } },
      create: { userId, signalId: id, note: note || '', action: action || 'watched' },
      update: data,
    });
    return reply.send(journal);
  });

  app.get('/portfolio-advice', async (_request: FastifyRequest, reply: FastifyReply) => {
    const assets = await prisma.asset.findMany({ where: { userId } });
    const totalValue = assets.reduce((s, a) => s + a.totalValue, 0);

    const valueValue = assets
      .filter((a) => a.track === 'value')
      .reduce((s, a) => s + a.totalValue, 0);
    const momentumValue = assets
      .filter((a) => a.track === 'momentum')
      .reduce((s, a) => s + a.totalValue, 0);

    const valRatio = totalValue > 0 ? (valueValue / totalValue) * 100 : 0;
    const momRatio = totalValue > 0 ? (momentumValue / totalValue) * 100 : 0;

    const valuationIndicators = await prisma.marketIndicator.findMany({
      where: { market: 'A_STOCK', indicatorType: 'valuation' },
    });
    const avgChange =
      valuationIndicators.length > 0
        ? valuationIndicators.reduce((s, i) => {
            const d = i.data as any;
            return s + (d.changePercent || 0);
          }, 0) / valuationIndicators.length
        : 0;

    let suggestedValueRatio = 75;
    let suggestedMomentumRatio = 25;
    let note = '当前处于平衡市场，建议维持默认仓位分配。';

    if (avgChange > 2) {
      suggestedValueRatio = 80;
      suggestedMomentumRatio = 20;
      note = '市场整体偏热，建议提高核心仓比重，减少追高敞口。';
    } else if (avgChange < -2) {
      suggestedValueRatio = 65;
      suggestedMomentumRatio = 35;
      note = '市场整体偏弱，可在控制仓位的前提下关注低估机会。';
    }

    return reply.send({
      currentValueRatio: Math.round(valRatio * 10) / 10,
      currentMomentumRatio: Math.round(momRatio * 10) / 10,
      suggestedValueRatio,
      suggestedMomentumRatio,
      note,
    });
  });

  app.post('/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await signalCalculator.computeAll();
    return reply.send(result);
  });
}
