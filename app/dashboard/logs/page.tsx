'use client'

import { useState } from 'react'
import { AuditLog } from '@/types/log'
import { LogViewer } from '@/components/log-viewer'

const mockLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    action: 'execute',
    severity: 'info',
    toolName: 'run_shell',
    sessionId: 'sess-001',
    command: 'ls -la /app',
    result: 'Success: 234ms',
    details: { exitCode: 0, lines: 5 },
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    action: 'block',
    severity: 'warning',
    toolName: 'run_shell',
    sessionId: 'sess-003',
    command: 'rm -rf /',
    result: 'Blocked: Dangerous pattern detected',
    details: { pattern: 'rm -rf /', reason: 'Policy violation' },
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    action: 'execute',
    severity: 'info',
    toolName: 'read_file',
    sessionId: 'sess-001',
    command: 'cat /app/config.json',
    result: 'Success: 156ms',
    details: { fileSize: 1024 },
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    action: 'policy_change',
    severity: 'warning',
    toolName: 'policy_editor',
    sessionId: 'admin-001',
    result: 'Updated policy: dev_policy',
    details: { oldMaxRuntime: 30, newMaxRuntime: 60 },
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    action: 'session_create',
    severity: 'info',
    toolName: 'session_manager',
    sessionId: 'sess-004',
    result: 'Session started',
    details: { agent: 'DataProcessor-v2' },
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    action: 'block',
    severity: 'error',
    toolName: 'run_shell',
    sessionId: 'sess-002',
    command: 'chmod 777 /etc/passwd',
    result: 'Blocked: Privilege escalation attempt',
    details: { reason: 'High-risk operation', riskLevel: 'high' },
  },
  {
    id: 'log-007',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    action: 'execute',
    severity: 'info',
    toolName: 'run_shell',
    sessionId: 'sess-001',
    command: 'npm install',
    result: 'Success: 2345ms',
    details: { packagesAdded: 150 },
  },
  {
    id: 'log-008',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    action: 'session_end',
    severity: 'info',
    toolName: 'session_manager',
    sessionId: 'sess-001',
    result: 'Session completed',
    details: { totalExecutions: 5, duration: '45m' },
  },
]

export default function LogsPage() {
  const [logs] = useState<AuditLog[]>(mockLogs)

  const stats = {
    total: logs.length,
    errors: logs.filter((l) => l.severity === 'error' || l.severity === 'critical').length,
    warnings: logs.filter((l) => l.severity === 'warning').length,
    info: logs.filter((l) => l.severity === 'info').length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Logs & Audit</h1>
        <p className="text-muted mt-2">Complete audit trail of all execution and security events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider">Total Logs</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider">Errors</p>
          <p className="text-2xl font-bold text-[hsl(var(--danger))] mt-2">{stats.errors}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider">Warnings</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))] mt-2">{stats.warnings}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider">Info</p>
          <p className="text-2xl font-bold text-[hsl(var(--accent))] mt-2">{stats.info}</p>
        </div>
      </div>

      {/* Log Viewer */}
      <LogViewer logs={logs} />
    </div>
  )
}
