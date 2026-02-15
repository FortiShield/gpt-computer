import { eq, and } from 'drizzle-orm'
import { BaseRepository } from './base'
import { executions, Execution } from '../schema'
import { ExecutionStatus } from '../../types/execution'

export class ExecutionRepository extends BaseRepository {
  async create(
    executionId: string,
    sessionId: string,
    command: string,
    runtime: string
  ): Promise<Execution> {
    const result = await this.db
      .insert(executions)
      .values({
        id: executionId,
        sessionId,
        command,
        runtime,
        status: 'queued' as any,
        createdAt: new Date(),
      })
      .returning()

    return result[0]
  }

  async getById(executionId: string): Promise<Execution | null> {
    const result = await this.db
      .select()
      .from(executions)
      .where(eq(executions.id, executionId))
      .limit(1)

    return result[0] || null
  }

  async updateStatus(executionId: string, status: ExecutionStatus): Promise<Execution> {
    const updates: any = {
      status: status as any,
      updatedAt: new Date(),
    }

    if (status === 'running') {
      updates.startedAt = new Date()
    } else if (status === 'success' || status === 'failed' || status === 'timeout') {
      updates.completedAt = new Date()
    }

    const result = await this.db
      .update(executions)
      .set(updates)
      .where(eq(executions.id, executionId))
      .returning()

    return result[0]
  }

  async updateWithResult(
    executionId: string,
    result: {
      status: ExecutionStatus
      exitCode: number
      output: string
      error: string
      duration: number
      cpuUsage?: number
      memoryUsage?: number
      containerId?: string
    }
  ): Promise<Execution> {
    const updates: any = {
      status: result.status as any,
      exitCode: result.exitCode,
      output: result.output,
      error: result.error,
      duration: result.duration,
      completedAt: new Date(),
    }

    if (result.cpuUsage !== undefined) {
      updates.cpuUsage = result.cpuUsage
    }
    if (result.memoryUsage !== undefined) {
      updates.memoryUsage = result.memoryUsage
    }
    if (result.containerId !== undefined) {
      updates.containerId = result.containerId
    }

    const dbResult = await this.db
      .update(executions)
      .set(updates)
      .where(eq(executions.id, executionId))
      .returning()

    return dbResult[0]
  }

  async setContainerId(executionId: string, containerId: string): Promise<Execution> {
    const result = await this.db
      .update(executions)
      .set({
        containerId,
      })
      .where(eq(executions.id, executionId))
      .returning()

    return result[0]
  }

  async getBySessionId(sessionId: string, limit = 100): Promise<Execution[]> {
    return this.db
      .select()
      .from(executions)
      .where(eq(executions.sessionId, sessionId))
      .limit(limit)
  }

  async listByStatus(status: ExecutionStatus, limit = 50): Promise<Execution[]> {
    return this.db
      .select()
      .from(executions)
      .where(eq(executions.status, status as any))
      .limit(limit)
  }
}
