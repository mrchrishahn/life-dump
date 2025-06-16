import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { getPackagePath } from '../utils/paths';

/**
 * Sets up the database connection
 * @returns The SQLite database connection and path
 */
function setupDatabaseConnection() {
  const dbPath = getPackagePath('mood-tracker.db');
  console.log('Setting up database at:', dbPath);
  return { db: new Database(dbPath), dbPath };
}

// Setup the database connection
const { db, dbPath } = setupDatabaseConnection();
export const drizzleDb = drizzle(db, { schema });

// Initialize the database with the required tables
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
    console.log('Database initialized successfully at:', dbPath);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export async function logMood(mood: string, metadata?: string) {
  const timestamp = new Date().toISOString();
  return drizzleDb.insert(schema.moods).values({ mood, timestamp, metadata });
}

export async function getMoods() {
  return drizzleDb.select().from(schema.moods);
} 