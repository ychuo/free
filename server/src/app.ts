import Fastify from 'fastify';
import cors from '@fastify/cors';
import { assetRoutes } from './routes/assets';
import { liabilityRoutes } from './routes/liabilities';
import { netWorthRoutes } from './routes/netWorth';
import { fireProfileRoutes } from './routes/fireProfile';
import { allocationRoutes } from './routes/allocation';
import { snapshotRoutes } from './routes/snapshots';

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] });

  await app.register(assetRoutes, { prefix: '/api/assets' });
  await app.register(liabilityRoutes, { prefix: '/api/liabilities' });
  await app.register(netWorthRoutes, { prefix: '/api/net-worth' });
  await app.register(fireProfileRoutes, { prefix: '/api' });
  await app.register(allocationRoutes, { prefix: '/api' });
  await app.register(snapshotRoutes, { prefix: '/api/snapshots' });

  return app;
}
