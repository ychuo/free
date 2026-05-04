import { FastifyInstance } from 'fastify';

export async function assetRoutes(app: FastifyInstance) {
  app.get('/', async () => []);
}
