import { createApp } from './app';
import { config } from './config';
import { AStockAdapter } from './lib/adapters/AStockAdapter';
import { CryptoAdapter } from './lib/adapters/CryptoAdapter';
import { FundAdapter } from './lib/adapters/FundAdapter';
import { HStockAdapter } from './lib/adapters/HStockAdapter';
import { UStockAdapter } from './lib/adapters/UStockAdapter';
import { exchangeRateService } from './lib/ExchangeRateService';
import { marketDataService } from './lib/MarketDataService';
import { priceService } from './lib/PriceService';
import { signalCalculator } from './lib/SignalCalculator';

priceService.register(new AStockAdapter());
priceService.register(new HStockAdapter());
priceService.register(new UStockAdapter());
priceService.register(new FundAdapter());
priceService.register(new CryptoAdapter());

const app = await createApp();

try {
  await app.listen({ port: config.port });
  console.log(`Server running on http://localhost:${config.port}`);

  priceService.startScheduler();
  exchangeRateService.startScheduler();
  marketDataService.startScheduler();

  // Signal computation: every 2 hours, offset from market data refresh
  const signalInterval = setInterval(() => {
    signalCalculator.computeAll().catch((e) =>
      console.error('[SignalCalculator] Compute error:', e),
    );
  }, 2 * 60 * 60 * 1000);
  // Initial computation after 30s (wait for market data to load)
  setTimeout(() => {
    signalCalculator.computeAll().catch((e) =>
      console.error('[SignalCalculator] Initial compute error:', e),
    );
  }, 30000);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
