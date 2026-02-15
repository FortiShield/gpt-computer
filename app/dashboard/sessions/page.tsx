'use client'

import { useState } from 'react'
import { Session, ExecutionResult } from '@/types'
import { SessionCard } from '@/components/session-card'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'

const mockExecutions: ExecutionResult[] = [
  {
    id: 'exec-001',
    command: 'ls -la /app',
    runtime: 'docker',
    stdout: 'drwxr-xr-x 5 user staff 160 Jan 16 10:30 .',
    stderr: '',
    exitCode: 0,
    duration: 234,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    sessionId: 'sess-001',
    riskLevel: 'low',
  },
  {
    id: 'exec-002',
    command: 'npm install',
    runtime: 'docker',
    stdout: 'added 150 packages',
    stderr: '',
    exitCode: 0,
    duration: 2300,
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    sessionId: 'sess-001',
    riskLevel: 'low',
  },
]

const mockSessions: Session[] = [
  {
    id: 'sess-001',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    agentName: 'CodeAssistant-v1',
    executions: mockExecutions,
    metadata: { environment: 'production', userId: 'user-123' },
  },
  {
    id: 'sess-002',
    status: 'finished',
    createdAt: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    agentName: 'DataProcessor-v2',
    executions: [
      {
        id: 'exec-003',
        command: 'cat data.json',
        runtime: 'local',
        stdout: '{"status": "ok"}',
        stderr: '',
        exitCode: 0,
        duration: 156,
        timestamp: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
        sessionId: 'sess-002',
        riskLevel: 'low',
      },
    ],
  },
  {
    id: 'sess-003',
    status: 'failed',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60000).toISOString(),
    agentName: 'FileProcessor-v1',
    executions: [
      {
        id: 'exec-004',
        command: 'rm -rf /',
        runtime: 'docker',
        stdout: '',
        stderr: 'Command blocked by policy',
        exitCode: 1,
        duration: 23,
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        sessionId: 'sess-003',
        riskLevel: 'high',
      },
    ],
  },
  {
    id: 'sess-004',
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agentName: 'AnalyticsEngine-v1',
    executions: [],
  },
]

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredSessions = statusFilter === 'all'
    ? sessions
    : sessions.filter((s) => s.status === statusFilter)

  const handleDelete = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id))
    if (selectedSession?.id === id) {
      setSelectedSession(null)
    }
  }

  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === 'active').length,
    queued: sessions.filter((s) => s.status === 'queued').length,
    failed: sessions.filter((s) => s.status === 'failed').length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Sessions</h1>
        <p className="text-muted mt-2">Manage active and historical execution sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider">Total Sessions</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[hsl(var(--success))]" />
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Queued</p>
              <p className="text-2xl font-bold text-foreground">{stats.queued}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[hsl(var(--danger))]" />
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Failed</p>
              <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-4 mb-4">
            <label className="block text-sm font-medium text-foreground mb-3">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
            >
              <option value="all">All Sessions</option>
              <option value="active">Active</option>
              <option value="finished">Finished</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="card p-8 text-center text-muted">
                <p>No sessions found</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="cursor-pointer"
                >
                  <SessionCard
                    session={session}
                    onDelete={handleDelete}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="heading-2">Session Details</h3>
                <p className="text-muted mt-2">{selectedSession.id}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Agent</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedSession.agentName || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Status</p>
                  <p className="text-lg font-semibold text-[hsl(var(--accent))]">
                    {selectedSession.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Created</p>
                  <p className="text-sm text-foreground">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Executions</p>
                  <p className="text-lg font-semibold text-foreground">{selectedSession.executions.length}</p>
                </div>
              </div>

              {/* Executions Table */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4">Executions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[hsl(var(--card-border))]">
                        <th className="text-left py-3 px-3 text-muted font-medium">Command</th>
                        <th className="text-left py-3 px-3 text-muted font-medium">Runtime</th>
                        <th className="text-left py-3 px-3 text-muted font-medium">Status</th>
                        <th className="text-right py-3 px-3 text-muted font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.executions.map((exec) => (
                        <tr key={exec.id} className="border-b border-[hsl(var(--card-border))]">
                          <td className="py-3 px-3 font-mono text-xs text-foreground truncate">{exec.command}</td>
                          <td className="py-3 px-3 text-muted text-xs">{exec.runtime}</td>
                          <td className="py-3 px-3">
                            <span className={exec.exitCode === 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}>
                              {exec.exitCode === 0 ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted text-xs text-right">
                            {(exec.duration / 1000).toFixed(2)}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 flex items-center justify-center text-center">
              <div>
                <p className="text-muted text-lg">Select a session to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
