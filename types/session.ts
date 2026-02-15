import { ExecutionResult } from './execution'

export type SessionStatus = 'active' | 'queued' | 'finished' | 'failed'

export interface Session {
  id: string
  status: SessionStatus
  createdAt: string
  updatedAt: string
  executions: ExecutionResult[]
  agentName?: string
  metadata?: Record<string, any>
}

export interface SessionStats {
  totalSessions: number
  activeSessions: number
  queuedJobs: number
  failedExecutions: number
}
