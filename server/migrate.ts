import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render.com PostgreSQL
  }
});

// Create a drizzle database instance
const db = drizzle(pool, { schema });

// Run migrations
async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  await pool.end();
}

main(); 