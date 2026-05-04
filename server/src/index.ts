import { createApp } from './app';
import { config } from './config';

const app = await createApp();

try {
  await app.listen({ port: config.port });
  console.log(`Server running on http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
