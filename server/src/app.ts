import cors from '@fastify/cors';
import Fastify from 'fastify';
import { allocationRoutes } from './routes/allocation';
import { assetRoutes } from './routes/assets';
import { exchangeRateRoutes } from './routes/exchangeRates';
import { fireProfileRoutes } from './routes/fireProfile';
import { liabilityRoutes } from './routes/liabilities';
import { netWorthRoutes } from './routes/netWorth';
import { priceRoutes } from './routes/prices';
import { rebalanceAlertRoutes } from './routes/rebalanceAlerts';
import { returnRoutes } from './routes/returns';
import { snapshotRoutes } from './routes/snapshots';
import { strategyRoutes } from './routes/strategies';
import { transactionRoutes } from './routes/transactions';

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] });

  await app.register(assetRoutes, { prefix: '/api/assets' });
  await app.register(liabilityRoutes, { prefix: '/api/liabilities' });
  await app.register(netWorthRoutes, { prefix: '/api/net-worth' });
  await app.register(fireProfileRoutes, { prefix: '/api' });
  await app.register(allocationRoutes, { prefix: '/api' });
  await app.register(snapshotRoutes, { prefix: '/api/snapshots' });
  await app.register(priceRoutes, { prefix: '/api/prices' });
  await app.register(exchangeRateRoutes, { prefix: '/api/exchange-rates' });
  await app.register(transactionRoutes, { prefix: '/api/transactions' });
  await app.register(returnRoutes, { prefix: '/api/returns' });
  await app.register(rebalanceAlertRoutes, { prefix: '/api/rebalance-alerts' });
  await app.register(strategyRoutes, { prefix: '/api/strategies' });

  return app;
}
