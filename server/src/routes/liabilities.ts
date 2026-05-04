import { FastifyInstance } from 'fastify';

export async function liabilityRoutes(app: FastifyInstance) {
  app.get('/', async () => []);
}
