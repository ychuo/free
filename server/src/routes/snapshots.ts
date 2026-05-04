import { FastifyInstance } from 'fastify';

export async function snapshotRoutes(app: FastifyInstance) {
  app.get('/', async () => []);
}
