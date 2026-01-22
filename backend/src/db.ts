import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, Client } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/table_demo',
});

// Dedicated client for LISTEN/NOTIFY (required for realtime)
const listenClient = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/table_demo',
});

export const db = drizzle(pool, { schema });
export const pgClient = pool;
export const pgListenClient = listenClient;
