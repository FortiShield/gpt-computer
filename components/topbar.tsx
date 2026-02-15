'use client'

import { Activity, AlertCircle, Server } from 'lucide-react'

export function Topbar() {
  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-[hsl(var(--card-bg))] border-b border-[hsl(var(--card-border))] flex items-center justify-between px-6 z-30">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Sandbox Engine</h2>
        <p className="text-xs text-muted">Real-time execution monitoring</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[hsl(var(--success))]" />
          <div>
            <p className="text-xs text-muted">Agent Status</p>
            <p className="text-sm font-medium text-foreground">Ready</p>
          </div>
        </div>

        <div className="h-8 w-px bg-[hsl(var(--card-border))]" />

        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-[hsl(var(--accent))]" />
          <div>
            <p className="text-xs text-muted">Sandbox Health</p>
            <p className="text-sm font-medium text-foreground">98%</p>
          </div>
        </div>

        <div className="h-8 w-px bg-[hsl(var(--card-border))]" />

        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
          <div>
            <p className="text-xs text-muted">Warnings</p>
            <p className="text-sm font-medium text-foreground">2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
