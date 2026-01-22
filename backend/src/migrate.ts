import { db, pgClient } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running migrations...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS rows (
      id INTEGER PRIMARY KEY,
      col_text_1 TEXT,
      col_text_2 TEXT,
      col_number_1 NUMERIC,
      col_number_2 NUMERIC,
      col_select_1 VARCHAR(100),
      col_select_2 VARCHAR(100),
      col_text_3 TEXT,
      col_text_4 TEXT,
      col_number_3 NUMERIC,
      col_text_5 TEXT,
      col_number_4 NUMERIC,
      col_select_3 VARCHAR(100),
      col_text_6 TEXT,
      col_text_7 TEXT,
      col_number_5 NUMERIC,
      col_text_8 TEXT,
      col_select_4 VARCHAR(100),
      col_text_9 TEXT,
      col_number_6 NUMERIC,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  console.log('Migrations complete!');
  await pgClient.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
