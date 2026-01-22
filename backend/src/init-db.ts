import { pgClient } from './db';

async function initDb() {
  console.log('Initializing database...');
  
  try {
    // Wait for postgres to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        await pgClient.query('SELECT 1');
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Create table if it doesn't exist
    await pgClient.query(`
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

    // Check if we need to seed
    const result = await pgClient.query('SELECT COUNT(*) FROM rows');
    const count = parseInt(result.rows[0].count, 10);
    
    if (count === 0) {
      console.log('Database is empty, seeding...');
      const { seed } = await import('./seed');
      await seed();
    } else {
      console.log(`Database already has ${count} rows, skipping seed`);
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

if (require.main === module) {
  initDb()
    .then(() => {
      console.log('Database initialization complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

export { initDb };
