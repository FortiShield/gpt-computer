'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { AuditLog, LogSeverity, LogAction } from '@/types/log'
import { formatTimestamp } from '@/lib/utils'

interface LogViewerProps {
  logs: AuditLog[]
  onFilterChange?: (filters: LogFilters) => void
}

export interface LogFilters {
  severity?: LogSeverity
  action?: LogAction
  sessionId?: string
  timeRange?: { start: Date; end: Date }
}

export function LogViewer({ logs, onFilterChange }: LogViewerProps) {
  const [filters, setFilters] = useState<LogFilters>({})
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const handleFilterChange = (newFilters: LogFilters) => {
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const filteredLogs = logs.filter((log) => {
    if (filters.severity && log.severity !== filters.severity) return false
    if (filters.action && log.action !== filters.action) return false
    if (filters.sessionId && log.sessionId !== filters.sessionId) return false
    return true
  })

  const getSeverityIcon = (severity: LogSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-[hsl(var(--danger))]" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-[hsl(var(--danger))]" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
      case 'info':
        return <Info className="h-4 w-4 text-[hsl(var(--accent))]" />
    }
  }

  const getSeverityColor = (severity: LogSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-[hsl(var(--danger))]'
      case 'error':
        return 'text-[hsl(var(--danger))]'
      case 'warning':
        return 'text-[hsl(var(--warning))]'
      case 'info':
        return 'text-[hsl(var(--accent))]'
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h3 className="heading-2">Audit Logs</h3>
        <p className="text-muted mt-2">All execution commands, policy changes, and security events</p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-3">
        <select
          value={filters.severity || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              severity: e.target.value ? (e.target.value as LogSeverity) : undefined,
            })
          }
          className="px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
        >
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filters.action || ''}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              action: e.target.value ? (e.target.value as LogAction) : undefined,
            })
          }
          className="px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
        >
          <option value="">All Actions</option>
          <option value="execute">Execute</option>
          <option value="block">Block</option>
          <option value="policy_change">Policy Change</option>
          <option value="session_create">Session Create</option>
          <option value="session_end">Session End</option>
        </select>

        <input
          type="text"
          placeholder="Filter by session ID..."
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              sessionId: e.target.value || undefined,
            })
          }
          className="px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
        />

        <button
          onClick={() => handleFilterChange({})}
          className="px-3 py-2 rounded text-sm font-medium bg-[hsl(var(--secondary))] text-foreground hover:bg-opacity-80 transition-all"
        >
          Clear Filters
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--card-border))]">
              <th className="text-left py-3 px-4 text-muted font-medium">Time</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Tool</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Session</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Severity</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-muted">
                  No logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[hsl(var(--card-border))] hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedLog(expandedLog === log.id ? null : log.id)
                  }
                >
                  <td className="py-3 px-4 text-muted text-xs">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-foreground font-mono text-xs">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-foreground">{log.toolName}</td>
                  <td className="py-3 px-4 text-muted font-mono text-xs">
                    {log.sessionId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <span className={getSeverityColor(log.severity)}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted truncate">{log.result}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Details */}
      {expandedLog && (
        <div className="p-4 bg-black/30 rounded border border-[hsl(var(--card-border))]">
          {(() => {
            const log = filteredLogs.find((l) => l.id === expandedLog)
            if (!log) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Log Details</h4>
                  <button
                    onClick={() => setExpandedLog(null)}
                    className="p-1 hover:bg-[hsl(var(--card-border))] rounded"
                  >
                    <X className="h-4 w-4 text-muted" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Command</p>
                    <p className="font-mono text-foreground mt-1">{log.command || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Tool</p>
                    <p className="text-foreground mt-1">{log.toolName}</p>
                  </div>
                </div>

                {log.details && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">
                      Additional Details
                    </p>
                    <pre className="bg-black/50 p-3 rounded text-xs font-mono text-[hsl(var(--accent))] overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
