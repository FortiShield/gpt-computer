export type LogSeverity = 'info' | 'warning' | 'error' | 'critical'
export type LogAction = 'execute' | 'block' | 'policy_change' | 'session_create' | 'session_end'

export interface AuditLog {
  id: string
  timestamp: string
  action: LogAction
  severity: LogSeverity
  toolName: string
  sessionId: string
  command?: string
  result: string
  details?: Record<string, any>
}
