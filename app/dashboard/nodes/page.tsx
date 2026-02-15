'use client'

import { useState } from 'react'
import { RuntimeNode } from '@/types/node'
import { NodeCard } from '@/components/node-card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const cpuData = [
  { time: '00:00', usage: 12 },
  { time: '04:00', usage: 28 },
  { time: '08:00', usage: 45 },
  { time: '12:00', usage: 38 },
  { time: '16:00', usage: 52 },
  { time: '20:00', usage: 29 },
]

const mockNodes: RuntimeNode[] = [
  {
    id: 'node-001',
    name: 'Docker Host 1',
    type: 'local',
    status: 'healthy',
    cpu: 45.2,
    memory: 16384,
    memoryUsed: 8192,
    uptime: 7776000,
    sandboxHealth: 99,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'node-002',
    name: 'Firecracker Cluster',
    type: 'cluster',
    status: 'healthy',
    cpu: 62.8,
    memory: 32768,
    memoryUsed: 24576,
    uptime: 5184000,
    sandboxHealth: 98,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'node-003',
    name: 'Remote SSH Node',
    type: 'remote',
    status: 'degraded',
    cpu: 88.5,
    memory: 8192,
    memoryUsed: 7340,
    uptime: 2592000,
    sandboxHealth: 92,
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'node-004',
    name: 'Backup Node',
    type: 'local',
    status: 'offline',
    cpu: 0,
    memory: 12288,
    memoryUsed: 0,
    uptime: 0,
    sandboxHealth: 0,
    lastSeen: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
]

export default function NodesPage() {
  const [nodes] = useState<RuntimeNode[]>(mockNodes)
  const [selectedNode, setSelectedNode] = useState<RuntimeNode | null>(nodes[0])

  const healthyCount = nodes.filter((n) => n.status === 'healthy').length
  const degradedCount = nodes.filter((n) => n.status === 'degraded').length
  const offlineCount = nodes.filter((n) => n.status === 'offline').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Runtime Nodes</h1>
        <p className="text-muted mt-2">Manage and monitor sandbox execution nodes</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Healthy</p>
            <p className="text-2xl font-bold text-foreground">{healthyCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Degraded</p>
            <p className="text-2xl font-bold text-foreground">{degradedCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-[hsl(var(--danger))]" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Offline</p>
            <p className="text-2xl font-bold text-foreground">{offlineCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes List */}
        <div className="lg:col-span-1 space-y-3">
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={selectedNode?.id === node.id ? '' : ''}
            >
              <NodeCard node={node} onClick={() => setSelectedNode(node)} />
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedNode && (
            <>
              {/* Node Details Card */}
              <div className="card p-6 space-y-6">
                <div>
                  <h3 className="heading-2">{selectedNode.name}</h3>
                  <p className="text-muted mt-2">Runtime node details and metrics</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Node ID</p>
                      <p className="font-mono text-sm text-foreground">{selectedNode.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm text-foreground capitalize">{selectedNode.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                      <p className={`text-sm font-semibold capitalize ${
                        selectedNode.status === 'healthy' ? 'text-[hsl(var(--success))]' :
                        selectedNode.status === 'degraded' ? 'text-[hsl(var(--warning))]' :
                        'text-[hsl(var(--danger))]'
                      }`}>
                        {selectedNode.status}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Sandbox Health</p>
                      <p className="text-2xl font-bold text-[hsl(var(--accent))]">
                        {selectedNode.sandboxHealth}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Uptime</p>
                      <p className="text-sm text-foreground">
                        {(selectedNode.uptime / 3600 / 24).toFixed(1)} days
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Last Seen</p>
                      <p className="text-sm text-foreground">
                        {new Date(selectedNode.lastSeen).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Charts */}
              <div className="card p-6">
                <h3 className="heading-3 mb-6">CPU Usage</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cpuData}>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card-bg))',
                        border: '1px solid hsl(var(--card-border))',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="usage" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
