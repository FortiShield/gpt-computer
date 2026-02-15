'use client'

import { useState } from 'react'
import { ExecutionPanel } from '@/components/execution-panel'
import { ExecutionOutput } from '@/components/execution-output'
import { ExecutionRequest, ExecutionResult } from '@/types'
import { MockSandboxRunner } from '@/server/sandbox/mockRunner'

export default function ExecutePage() {
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [output, setOutput] = useState<string[]>([])

  const handleExecute = async (request: ExecutionRequest) => {
    setIsExecuting(true)
    setOutput([])
    setResult(null)

    try {
      const runner = new MockSandboxRunner()
      const executionResult = await runner.execute(request, (chunk) => {
        if (chunk.type === 'stdout' || chunk.type === 'stderr') {
          setOutput((prev) => [...prev, chunk.data])
        }
      })
      setResult(executionResult)
    } catch (error) {
      console.error('Execution failed:', error)
      setOutput((prev) => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Execute Command</h1>
        <p className="text-muted mt-2">Submit and monitor command execution in isolated sandbox environments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExecutionPanel onExecute={handleExecute} isExecuting={isExecuting} />
        </div>

        <div className="lg:col-span-2">
          <ExecutionOutput result={result} isLoading={isExecuting} output={output} />
        </div>
      </div>
    </div>
  )
}
