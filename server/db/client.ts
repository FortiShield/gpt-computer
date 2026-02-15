import { drizzle } from 'drizzle-orm/neon-http'
import { Pool } from '@neondatabase/serverless'
import * as schema from './schema'

let db: ReturnType<typeof drizzle> | null = null

/**
 * Get or create a singleton database instance
 */
export function getDatabase() {
  if (db) {
    return db
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please configure your Neon database connection.'
    )
  }

  try {
    const pool = new Pool({ connectionString: databaseUrl })
    db = drizzle(pool, { schema })

    console.log('[Database] Connected to Neon PostgreSQL')
    return db
  } catch (error) {
    console.error('[Database] Connection failed:', error)
    throw new Error('Failed to connect to database')
  }
}

/**
 * Test database connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const database = getDatabase()
    const result = await database.execute(
      'SELECT NOW() as current_time'
    )
    console.log('[Database] Connection test successful')
    return true
  } catch (error) {
    console.error('[Database] Connection test failed:', error)
    return false
  }
}

export { schema }
export type * from './schema'
