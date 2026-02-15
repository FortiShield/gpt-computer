'use client'

import { useState } from 'react'
import { Save, X, Code, Eye } from 'lucide-react'
import { Policy } from '@/types'
import { cn } from '@/lib/utils'

interface PolicyEditorProps {
  policy?: Policy
  onSave?: (policy: Policy) => void
  onCancel?: () => void
}

const defaultPolicy: Policy = {
  id: '',
  name: 'Default Policy',
  description: 'Standard execution policy',
  allow: ['ls', 'cat', 'echo', 'ps', 'npm', 'node'],
  deny: ['rm', 'chmod', 'sudo', 'fork'],
  filesystem: {
    read: ['/app', '/home'],
    write: ['/tmp'],
  },
  network: false,
  maxRuntime: 30,
  maxMemoryMb: 256,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function PolicyEditor({ policy, onSave, onCancel }: PolicyEditorProps) {
  const [current, setCurrent] = useState(policy || defaultPolicy)
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const [jsonText, setJsonText] = useState(JSON.stringify(policy || defaultPolicy, null, 2))

  const handleSave = () => {
    onSave?.(current)
  }

  const handleJsonUpdate = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setCurrent(parsed)
      setViewMode('visual')
    } catch (err) {
      console.error('Invalid JSON:', err)
    }
  }

  const toggleAllowCommand = (cmd: string) => {
    setCurrent((prev) => ({
      ...prev,
      allow: prev.allow.includes(cmd)
        ? prev.allow.filter((c) => c !== cmd)
        : [...prev.allow, cmd],
    }))
  }

  const commonCommands = ['ls', 'cat', 'echo', 'ps', 'npm', 'node', 'python', 'git', 'curl', 'wget']
  const commonDangerousPatterns = ['rm -rf', 'chmod', 'sudo', 'fork', 'dd', 'mkfs']

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--card-border))]">
        <div>
          <h3 className="heading-3">Policy Editor</h3>
          <p className="text-sm text-muted mt-1">{current.name}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'visual' ? 'json' : 'visual')}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-[hsl(var(--secondary))] text-foreground hover:bg-opacity-80 transition-all"
          >
            {viewMode === 'visual' ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {viewMode === 'visual' ? 'JSON' : 'Visual'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {viewMode === 'visual' ? (
          <>
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => setCurrent({ ...current, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={current.description}
                  onChange={(e) => setCurrent({ ...current, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Allowed Commands */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Allowed Commands</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-black/20 rounded mb-3">
                {commonCommands.map((cmd) => (
                  <label
                    key={cmd}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={current.allow.includes(cmd)}
                      onChange={() => toggleAllowCommand(cmd)}
                      className="h-4 w-4 rounded border-[hsl(var(--card-border))]"
                    />
                    <span className="text-sm font-mono text-foreground">{cmd}</span>
                  </label>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add custom command..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    toggleAllowCommand(e.currentTarget.value.trim())
                    e.currentTarget.value = ''
                  }
                }}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              />
            </div>

            {/* Resource Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Runtime (s)
                </label>
                <input
                  type="number"
                  min="1"
                  value={current.maxRuntime}
                  onChange={(e) => setCurrent({ ...current, maxRuntime: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Memory (MB)
                </label>
                <input
                  type="number"
                  min="32"
                  value={current.maxMemoryMb}
                  onChange={(e) => setCurrent({ ...current, maxMemoryMb: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={current.network}
                    onChange={(e) => setCurrent({ ...current, network: e.target.checked })}
                    className="h-4 w-4 rounded border-[hsl(var(--card-border))]"
                  />
                  <span className="text-sm font-medium text-foreground">Allow Network</span>
                </label>
              </div>
            </div>

            {/* Filesystem Access */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Filesystem Access</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
                    Read Paths
                  </label>
                  <textarea
                    value={current.filesystem.read.join('\n')}
                    onChange={(e) => setCurrent({
                      ...current,
                      filesystem: {
                        ...current.filesystem,
                        read: e.target.value.split('\n').filter((p) => p.trim()),
                      },
                    })}
                    placeholder="/app&#10;/home"
                    className="w-full h-24 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
                    Write Paths
                  </label>
                  <textarea
                    value={current.filesystem.write.join('\n')}
                    onChange={(e) => setCurrent({
                      ...current,
                      filesystem: {
                        ...current.filesystem,
                        write: e.target.value.split('\n').filter((p) => p.trim()),
                      },
                    })}
                    placeholder="/tmp"
                    className="w-full h-24 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none font-mono"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-96 px-3 py-2 bg-black/50 border border-[hsl(var(--card-border))] rounded text-sm font-mono text-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
            />
            <button
              onClick={handleJsonUpdate}
              className="w-full px-4 py-2 rounded font-medium bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-110 transition-all"
            >
              Apply JSON
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 p-6 border-t border-[hsl(var(--card-border))]">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium button-primary"
        >
          <Save className="h-4 w-4" />
          Save Policy
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded font-medium bg-[hsl(var(--secondary))] text-foreground hover:bg-opacity-80 transition-all"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
