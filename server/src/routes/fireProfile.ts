import { FastifyInstance } from 'fastify';

export async function fireProfileRoutes(app: FastifyInstance) {
  app.get('/fire-profile', async () => ({}));
  app.get('/fire-progress', async () => ({}));
}
