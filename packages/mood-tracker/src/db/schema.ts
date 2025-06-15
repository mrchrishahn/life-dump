import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const moods = sqliteTable('moods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mood: text('mood').notNull(),
  timestamp: text('timestamp').notNull(),
  metadata: text('metadata')
}); 