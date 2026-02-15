'use client'

import { RuntimeNode } from '@/types/node'
import { Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface NodeCardProps {
  node: RuntimeNode
  onClick?: () => void
}

export function NodeCard({ node, onClick }: NodeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-[hsl(var(--success))]'
      case 'degraded':
        return 'text-[hsl(var(--warning))]'
      case 'offline':
        return 'text-[hsl(var(--danger))]'
      default:
        return 'text-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5" />
      case 'offline':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const memoryPercent = (node.memoryUsed / node.memory) * 100

  return (
    <div
      onClick={onClick}
      className="card p-6 cursor-pointer hover:border-[hsl(var(--accent))] transition-all space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{node.name}</h3>
          <p className="text-xs text-muted mt-1 font-mono">{node.id}</p>
        </div>
        <div className={`flex items-center gap-2 ${getStatusColor(node.status)}`}>
          {getStatusIcon(node.status)}
          <span className="text-sm font-medium capitalize">{node.status}</span>
        </div>
      </div>

      <div className="text-xs text-muted space-y-1">
        <p>Type: <span className="text-foreground capitalize">{node.type}</span></p>
        <p>Uptime: <span className="text-foreground">{(node.uptime / 3600 / 24).toFixed(1)}d</span></p>
        <p>Sandbox Health: <span className="text-foreground">{node.sandboxHealth}%</span></p>
      </div>

      {/* CPU Usage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted uppercase tracking-wider">CPU</label>
          <span className="text-xs font-mono text-foreground">{node.cpu.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(var(--accent))]"
            style={{ width: `${Math.min(node.cpu, 100)}%` }}
          />
        </div>
      </div>

      {/* Memory Usage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted uppercase tracking-wider">Memory</label>
          <span className="text-xs font-mono text-foreground">
            {node.memoryUsed}MB / {node.memory}MB
          </span>
        </div>
        <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
          <div
            className={`h-full ${
              memoryPercent > 80
                ? 'bg-[hsl(var(--danger))]'
                : memoryPercent > 60
                ? 'bg-[hsl(var(--warning))]'
                : 'bg-[hsl(var(--success))]'
            }`}
            style={{ width: `${Math.min(memoryPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Active Executions */}
      <div className="pt-2 border-t border-[hsl(var(--card-border))]">
        <p className="text-xs text-muted">
          Active Executions: <span className="text-foreground font-semibold">3</span>
        </p>
      </div>
    </div>
  )
}
