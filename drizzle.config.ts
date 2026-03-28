import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
})