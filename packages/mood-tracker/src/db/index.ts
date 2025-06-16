import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { getPackagePath } from '../utils/paths';

// Use the utility function to get the database path
const dbPath = getPackagePath('mood-tracker.db');
const db = new Database(dbPath);
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
    console.log('Database initialized successfully');
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