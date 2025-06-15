import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const db = new Database('/Users/venhaus/code/aether/life-dump/packages/mood-tracker/mood-tracker.db');
export const drizzleDb = drizzle(db as any, { schema });

export async function logMood(mood: string, metadata?: string) {
  const timestamp = new Date().toISOString();
  return drizzleDb.insert(schema.moods).values({ mood, timestamp, metadata });
}

export async function getMoods() {
  return drizzleDb.select().from(schema.moods);
} 