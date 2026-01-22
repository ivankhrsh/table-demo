import Fastify from 'fastify';
import cors from '@fastify/cors';
import { rowsRoutes } from './routes/rows';
import { setupRealtime } from './realtime';
import { initDb } from './init-db';

const server = Fastify({
  logger: true,
});

async function start() {
  // Initialize database (create tables, seed if needed)
  try {
    await initDb();
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }

  await server.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await server.register(rowsRoutes);
  setupRealtime(server);

  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
