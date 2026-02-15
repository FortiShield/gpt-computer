export interface RuntimeNode {
  id: string
  name: string
  type: 'local' | 'remote' | 'cluster'
  status: 'healthy' | 'degraded' | 'offline'
  cpu: number
  memory: number
  memoryUsed: number
  uptime: number
  sandboxHealth: number
  lastSeen: string
}

export interface NodeMetrics {
  cpuUsage: number
  memoryUsage: number
  activeExecutions: number
}
