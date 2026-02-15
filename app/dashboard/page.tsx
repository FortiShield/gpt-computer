'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const executionData = [
  { time: '00:00', executions: 12 },
  { time: '04:00', executions: 19 },
  { time: '08:00', executions: 45 },
  { time: '12:00', executions: 38 },
  { time: '16:00', executions: 52 },
  { time: '20:00', executions: 29 },
]

const healthData = [
  { time: '00:00', health: 98 },
  { time: '06:00', health: 96 },
  { time: '12:00', health: 99 },
  { time: '18:00', health: 97 },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-muted mt-2">Real-time monitoring of sandbox execution engine</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Total Executions</p>
              <p className="text-3xl font-bold text-foreground mt-2">1,247</p>
              <p className="text-xs text-muted mt-2">+12% from last week</p>
            </div>
            <Activity className="h-8 w-8 text-[hsl(var(--accent))]" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Active Sessions</p>
              <p className="text-3xl font-bold text-foreground mt-2">8</p>
              <p className="text-xs text-muted mt-2">3 agents running</p>
            </div>
            <Clock className="h-8 w-8 text-[hsl(var(--success))]" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Failed Jobs</p>
              <p className="text-3xl font-bold text-foreground mt-2">3</p>
              <p className="text-xs text-muted mt-2">0.2% failure rate</p>
            </div>
            <AlertCircle className="h-8 w-8 text-[hsl(var(--warning))]" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Engine Health</p>
              <p className="text-3xl font-bold text-foreground mt-2">98%</p>
              <p className="text-xs text-muted mt-2">All systems normal</p>
            </div>
            <CheckCircle className="h-8 w-8 text-[hsl(var(--success))]" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="heading-3 mb-6">Executions Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executionData}>
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
              <Bar dataKey="executions" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="heading-3 mb-6">Sandbox Health Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData}>
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[90, 100]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card-bg))',
                  border: '1px solid hsl(var(--card-border))',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="health" 
                stroke="hsl(var(--success))" 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card p-6">
        <h3 className="heading-3 mb-6">Recent Executions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--card-border))]">
                <th className="text-left py-3 px-4 text-muted font-medium">Command</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Runtime</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cmd: 'npm install', runtime: 'docker', status: 'success', duration: '2.3s', time: '2m ago' },
                { cmd: 'ls -la /app', runtime: 'local', status: 'success', duration: '0.1s', time: '5m ago' },
                { cmd: 'chmod 777 test', runtime: 'microvm', status: 'blocked', duration: '-', time: '8m ago' },
                { cmd: 'ps aux', runtime: 'docker', status: 'success', duration: '0.2s', time: '12m ago' },
              ].map((item, i) => (
                <tr key={i} className="border-b border-[hsl(var(--card-border))] hover:bg-[hsl(var(--secondary))] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{item.cmd}</td>
                  <td className="py-3 px-4 text-muted">{item.runtime}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'success' ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' :
                      item.status === 'blocked' ? 'bg-[hsl(var(--danger))]/20 text-[hsl(var(--danger))]' :
                      'bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted">{item.duration}</td>
                  <td className="py-3 px-4 text-muted">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
