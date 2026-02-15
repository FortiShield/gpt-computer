'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PolicyEditor } from '@/components/policy-editor'
import { PolicyList } from '@/components/policy-list'
import { Policy } from '@/types'

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

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSave = (policy: Policy) => {
    if (policy.id && policies.some((p) => p.id === policy.id)) {
      setPolicies(policies.map((p) => (p.id === policy.id ? policy : p)))
    } else {
      const newPolicy = { ...policy, id: Math.random().toString(36).substr(2, 9) }
      setPolicies([...policies, newPolicy])
    }
    setSelectedPolicy(null)
    setIsCreating(false)
  }

  const handleDelete = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id))
    if (selectedPolicy?.id === id) {
      setSelectedPolicy(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Security Policies</h1>
        <p className="text-muted mt-2">Define and manage execution policies for sandbox isolation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policies List */}
        <div className="lg:col-span-1">
          <div className="card p-4 space-y-4">
            <button
              onClick={() => {
                setIsCreating(true)
                setSelectedPolicy(null)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium button-primary"
            >
              <Plus className="h-4 w-4" />
              Create Policy
            </button>
          </div>

          <div className="mt-6">
            <PolicyList
              policies={policies}
              selectedId={selectedPolicy?.id}
              onSelect={setSelectedPolicy}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selectedPolicy || isCreating ? (
            <PolicyEditor
              policy={isCreating ? undefined : selectedPolicy || undefined}
              onSave={handleSave}
              onCancel={() => {
                setSelectedPolicy(null)
                setIsCreating(false)
              }}
            />
          ) : (
            <div className="card p-12 flex items-center justify-center text-center">
              <div>
                <p className="text-muted text-lg">Select a policy to edit</p>
                <p className="text-sm text-muted mt-2">or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
