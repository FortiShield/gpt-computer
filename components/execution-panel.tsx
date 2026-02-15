'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Square, Settings2, AlertTriangle } from 'lucide-react'
import { RuntimeType, ExecutionRequest } from '@/types'
import { cn } from '@/lib/utils'

interface ExecutionPanelProps {
  onExecute?: (request: ExecutionRequest) => Promise<void>
  isExecuting?: boolean
}

export function ExecutionPanel({ onExecute, isExecuting = false }: ExecutionPanelProps) {
  const [command, setCommand] = useState('')
  const [runtime, setRuntime] = useState<RuntimeType>('docker')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [limits, setLimits] = useState({
    cpu: 2,
    memory: 256,
    timeout: 30,
  })
  const [network, setNetwork] = useState(false)
  const commandInputRef = useRef<HTMLTextAreaElement>(null)

  const handleExecute = async () => {
    if (!command.trim()) return

    const request: ExecutionRequest = {
      command: command.trim(),
      runtime,
      limits,
      network,
      filesystemAccess: [],
    }

    await onExecute?.(request)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCommand(text)
    } catch (err) {
      console.error('Failed to paste:', err)
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="heading-2">Execute Command</h2>
        <p className="text-muted mt-2">Submit a command for secure sandbox execution</p>
      </div>

      {/* Command Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Command</label>
        <textarea
          ref={commandInputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command to execute..."
          className="w-full h-32 p-4 bg-black/50 border border-[hsl(var(--card-border))] rounded text-[hsl(var(--accent))] font-mono text-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted">{command.length} characters</span>
          <button
            onClick={handlePaste}
            className="text-xs text-[hsl(var(--accent))] hover:underline"
          >
            Paste from clipboard
          </button>
        </div>
      </div>

      {/* Runtime Selection */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Runtime</label>
          <select
            value={runtime}
            onChange={(e) => setRuntime(e.target.value as RuntimeType)}
            disabled={isExecuting}
            className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          >
            <option value="docker">Docker</option>
            <option value="local">Local Shell</option>
            <option value="microvm">Firecracker MicroVM</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Timeout (s)</label>
          <input
            type="number"
            min="1"
            max="300"
            value={limits.timeout}
            onChange={(e) => setLimits({ ...limits, timeout: parseInt(e.target.value) })}
            disabled={isExecuting}
            className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Memory (MB)</label>
          <input
            type="number"
            min="32"
            max="2048"
            value={limits.memory}
            onChange={(e) => setLimits({ ...limits, memory: parseInt(e.target.value) })}
            disabled={isExecuting}
            className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          />
        </div>
      </div>

      {/* Advanced Options */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-[hsl(var(--accent))] hover:underline"
      >
        <Settings2 className="h-4 w-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-black/20 rounded border border-[hsl(var(--card-border))]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="network"
              checked={network}
              onChange={(e) => setNetwork(e.target.checked)}
              disabled={isExecuting}
              className="h-4 w-4 rounded border-[hsl(var(--card-border))] cursor-pointer"
            />
            <label htmlFor="network" className="text-sm text-foreground cursor-pointer">
              Enable Network Access
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">CPU Cores</label>
            <input
              type="number"
              min="1"
              max="8"
              value={limits.cpu}
              onChange={(e) => setLimits({ ...limits, cpu: parseInt(e.target.value) })}
              disabled={isExecuting}
              className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
            />
          </div>

          <div className="bg-[hsl(var(--danger))]/10 border border-[hsl(var(--danger))]/30 rounded p-3 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--danger))] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted">
              <p className="font-medium text-foreground mb-1">Security Note</p>
              <p>Command isolation is enforced by policy. Dangerous patterns are blocked automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[hsl(var(--card-border))]">
        <button
          onClick={handleExecute}
          disabled={isExecuting || !command.trim()}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-medium transition-all',
            isExecuting || !command.trim()
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'button-primary'
          )}
        >
          <Play className="h-4 w-4" />
          {isExecuting ? 'Executing...' : 'Execute Command'}
        </button>

        {isExecuting && (
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded font-medium bg-[hsl(var(--danger))] text-white hover:brightness-110 transition-all">
            <Square className="h-4 w-4" />
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
