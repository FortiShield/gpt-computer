'use client'

import { Session } from '@/types'
import { Trash2, Eye, RotateCcw } from 'lucide-react'
import { formatTimestamp } from '@/lib/utils'

interface SessionCardProps {
  session: Session
  onView?: (session: Session) => void
  onRetry?: (session: Session) => void
  onDelete?: (id: string) => void
}

export function SessionCard({ session, onView, onRetry, onDelete }: SessionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]'
      case 'finished':
        return 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]'
      case 'failed':
        return 'bg-[hsl(var(--danger))]/20 text-[hsl(var(--danger))]'
      case 'queued':
        return 'bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]'
      default:
        return 'bg-muted/20 text-muted'
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getStatusColor(session.status)}`}>
              {session.status}
            </span>
            <code className="text-xs font-mono text-muted">{session.id}</code>
          </div>

          {session.agentName && (
            <p className="text-sm font-medium text-foreground">{session.agentName}</p>
          )}

          <p className="text-xs text-muted mt-2">
            {formatTimestamp(session.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView?.(session)}
            className="p-2 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4 text-muted hover:text-foreground" />
          </button>

          {session.status === 'failed' && (
            <button
              onClick={() => onRetry?.(session)}
              className="p-2 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
              title="Retry session"
            >
              <RotateCcw className="h-4 w-4 text-muted hover:text-foreground" />
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Delete this session?')) {
                onDelete?.(session.id)
              }
            }}
            className="p-2 rounded hover:bg-[hsl(var(--danger))]/20 transition-colors"
            title="Delete session"
          >
            <Trash2 className="h-4 w-4 text-muted hover:text-[hsl(var(--danger))]" />
          </button>
        </div>
      </div>

      {/* Executions Stats */}
      <div className="flex gap-4 text-xs text-muted pt-3 border-t border-[hsl(var(--card-border))]">
        <span>{session.executions.length} executions</span>
        <span>
          {session.executions.filter((e) => e.exitCode === 0).length} successful
        </span>
        <span>
          {session.executions.filter((e) => e.exitCode !== 0).length} failed
        </span>
      </div>
    </div>
  )
}
