import { eq } from 'drizzle-orm'
import { BaseRepository } from './base'
import { sessions, Session } from '../schema'

export class SessionRepository extends BaseRepository {
  async create(sessionId: string, agentId: string, agentName?: string, policyId?: string): Promise<Session> {
    const result = await this.db
      .insert(sessions)
      .values({
        id: sessionId,
        agentId,
        agentName,
        status: 'active',
        policyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  }

  async getById(sessionId: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)

    return result[0] || null
  }

  async updateStatus(sessionId: string, status: 'active' | 'completed' | 'failed' | 'cancelled'): Promise<Session> {
    const result = await this.db
      .update(sessions)
      .set({
        status,
        updatedAt: new Date(),
        completedAt: status !== 'active' ? new Date() : undefined,
      })
      .where(eq(sessions.id, sessionId))
      .returning()

    return result[0]
  }

  async listByAgentId(agentId: string): Promise<Session[]> {
    return this.db
      .select()
      .from(sessions)
      .where(eq(sessions.agentId, agentId))
  }

  async list(limit = 50, offset = 0): Promise<Session[]> {
    return this.db
      .select()
      .from(sessions)
      .limit(limit)
      .offset(offset)
  }
}
