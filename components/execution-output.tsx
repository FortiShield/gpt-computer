'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { ExecutionResult } from '@/types'
import { formatDuration, formatTimestamp, maskSensitiveData } from '@/lib/utils'

interface ExecutionOutputProps {
  result: ExecutionResult | null
  isLoading?: boolean
  output?: string[]
}

export function ExecutionOutput({ result, isLoading = false, output = [] }: ExecutionOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="heading-2">Output</h2>
        {result && (
          <div className="flex items-center gap-2">
            {result.exitCode === 0 ? (
              <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[hsl(var(--danger))]" />
            )}
            <span className="text-sm font-medium">
              {result.exitCode === 0 ? 'Success' : `Failed (Exit ${result.exitCode})`}
            </span>
          </div>
        )}
      </div>

      {/* Execution Info */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/30 rounded">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Duration</p>
            <p className="text-sm font-mono text-[hsl(var(--accent))] mt-1">
              {formatDuration(result.duration)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Runtime</p>
            <p className="text-sm font-mono text-[hsl(var(--accent))] mt-1">{result.runtime}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Risk Level</p>
            <p className={`text-sm font-mono mt-1 ${
              result.riskLevel === 'high' ? 'text-[hsl(var(--danger))]' :
              result.riskLevel === 'medium' ? 'text-[hsl(var(--warning))]' :
              'text-[hsl(var(--success))]'
            }`}>
              {result.riskLevel.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Time</p>
            <p className="text-sm font-mono text-[hsl(var(--accent))] mt-1">
              {formatTimestamp(result.timestamp)}
            </p>
          </div>
        </div>
      )}

      {/* Output Terminal */}
      <div
        ref={outputRef}
        className="bg-black/50 border border-[hsl(var(--card-border))] rounded p-4 h-96 overflow-y-auto font-mono text-sm text-[hsl(var(--accent))] space-y-1"
      >
        {isLoading && !output.length && (
          <div className="text-muted animate-pulse">Waiting for output...</div>
        )}

        {output.length > 0 ? (
          output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-words">
              {maskSensitiveData(line)}
            </div>
          ))
        ) : result ? (
          <>
            {result.stdout && (
              <div className="whitespace-pre-wrap break-words">
                {maskSensitiveData(result.stdout)}
              </div>
            )}
            {result.stderr && (
              <div className="text-[hsl(var(--danger))]">
                {maskSensitiveData(result.stderr)}
              </div>
            )}
          </>
        ) : (
          <div className="text-muted">Output will appear here</div>
        )}
      </div>

      {/* Status Bar */}
      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 rounded text-sm text-muted">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Execution in progress...</span>
        </div>
      )}

      {result && (
        <div className="flex items-center justify-between px-4 py-2 bg-black/30 rounded text-xs text-muted">
          <span>Execution ID: {result.id}</span>
          <span>Session: {result.sessionId}</span>
        </div>
      )}
    </div>
  )
}
