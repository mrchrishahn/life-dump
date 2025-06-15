import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('projects.db');
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma('foreign_keys = ON'); 