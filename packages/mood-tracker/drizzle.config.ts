import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
