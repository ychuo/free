import { FastifyInstance } from 'fastify';

export async function netWorthRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 }));
}
