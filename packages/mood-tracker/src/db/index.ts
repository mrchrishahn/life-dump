import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { log } from '../utils/logger';

function setupDatabaseConnection() {
  const dbPath = process.env.DB_FILE_NAME;
  if (!dbPath) {
    throw new Error('DB_FILE_NAME environment variable is not set');
  }
  log(`Setting up database at: ${dbPath}`);
  return { db: new Database(dbPath), dbPath };
}

const { db, dbPath } = setupDatabaseConnection();
export const drizzleDb = drizzle(db, { schema });

export function initializeDatabase() {
  try {
    // Create the moods table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        metadata TEXT
      )
    `);
    log(`Database initialized successfully at: ${dbPath}`);
  } catch (error) {
    log('Failed to initialize database', 'error', { error: error instanceof Error ? error.message : String(error) });
  }
}

export async function logMood(mood: string, metadata?: string) {
  const timestamp = new Date().toISOString();
  return drizzleDb.insert(schema.moods).values({ mood, timestamp, metadata });
}

export async function getMoods() {
  return drizzleDb.select().from(schema.moods);
} 