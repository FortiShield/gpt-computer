import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export abstract class BaseRepository {
  protected db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }
}
