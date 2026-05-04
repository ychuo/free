import { FastifyInstance } from 'fastify';

export async function allocationRoutes(app: FastifyInstance) {
  app.get('/allocation-targets', async () => []);
  app.get('/allocation-analysis', async () => []);
}
