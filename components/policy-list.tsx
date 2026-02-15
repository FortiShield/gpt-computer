'use client'

import { Trash2, Edit, Shield, Copy } from 'lucide-react'
import { Policy } from '@/types'

interface PolicyListProps {
  policies: Policy[]
  onSelect?: (policy: Policy) => void
  onDelete?: (id: string) => void
  selectedId?: string
}

const defaultPolicies: Policy[] = [
  {
    id: 'default',
    name: 'Default Policy',
    description: 'Standard execution policy with basic restrictions',
    allow: ['ls', 'cat', 'echo', 'ps', 'npm', 'node'],
    deny: [],
    filesystem: {
      read: ['/app', '/home'],
      write: ['/tmp'],
    },
    network: false,
    maxRuntime: 30,
    maxMemoryMb: 256,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'restricted',
    name: 'Restricted Policy',
    description: 'Strict policy with minimal permissions',
    allow: ['echo', 'cat'],
    deny: ['rm', 'chmod', 'sudo'],
    filesystem: {
      read: ['/app'],
      write: [],
    },
    network: false,
    maxRuntime: 10,
    maxMemoryMb: 128,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dev',
    name: 'Development Policy',
    description: 'Permissive policy for development environments',
    allow: ['ls', 'cat', 'echo', 'ps', 'npm', 'node', 'python', 'git', 'curl'],
    deny: ['rm -rf', 'chmod 777', 'sudo'],
    filesystem: {
      read: ['/app', '/home', '/usr/local'],
      write: ['/tmp', '/app'],
    },
    network: true,
    maxRuntime: 60,
    maxMemoryMb: 512,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function PolicyList({ policies = defaultPolicies, onSelect, onDelete, selectedId }: PolicyListProps) {
  return (
    <div className="space-y-3">
      {policies.map((policy) => (
        <div
          key={policy.id}
          onClick={() => onSelect?.(policy)}
          className={`card p-4 cursor-pointer transition-all hover:border-[hsl(var(--accent))] ${
            selectedId === policy.id ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[hsl(var(--accent))]" />
                <h4 className="font-semibold text-foreground">{policy.name}</h4>
              </div>
              <p className="text-sm text-muted mt-1">{policy.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
                <span>Commands: {policy.allow.length}</span>
                <span>Runtime: {policy.maxRuntime}s</span>
                <span>Memory: {policy.maxMemoryMb}MB</span>
                <span>Network: {policy.network ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(policy)
                }}
                className="p-2 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Edit className="h-4 w-4 text-muted hover:text-foreground" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete policy "${policy.name}"?`)) {
                    onDelete?.(policy.id)
                  }
                }}
                className="p-2 rounded hover:bg-[hsl(var(--danger))]/20 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-muted hover:text-[hsl(var(--danger))]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(JSON.stringify(policy, null, 2))
                }}
                className="p-2 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Copy className="h-4 w-4 text-muted hover:text-foreground" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
