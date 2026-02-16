import { eq } from 'drizzle-orm'
import { BaseRepository } from './base'
import { auditLogs, AuditLog } from '../schema'

export type AuditAction = 'execute' | 'block' | 'policy_change' | 'session_create' | 'session_close' | 'node_register' | 'node_offline'
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export class LogRepository extends BaseRepository {
  async create(
    logId: string,
    action: AuditAction,
    severity: AuditSeverity,
    message: string,
    options?: {
      sessionId?: string
      executionId?: string
      actor?: string
      details?: Record<string, any>
    }
  ): Promise<AuditLog> {
    const result = await this.db
      .insert(auditLogs)
      .values({
        id: logId,
        action,
        severity,
        message,
        sessionId: options?.sessionId,
        executionId: options?.executionId,
        actor: options?.actor,
        details: options?.details,
        createdAt: new Date(),
      })
      .returning()

    return result[0]
  }

  async getBySessionId(sessionId: string, limit = 100): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.sessionId, sessionId))
      .limit(limit)
  }

  async getByExecutionId(executionId: string, limit = 50): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.executionId, executionId))
      .limit(limit)
  }

  async list(limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .limit(limit)
      .offset(offset)
  }
}
