import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database(process.env.DB_FILE_NAME!);
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.run('PRAGMA foreign_keys = ON'); 