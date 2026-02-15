export type RuntimeType = 'docker' | 'microvm' | 'local'

export interface ExecutionRequest {
  command: string
  runtime: RuntimeType
  limits: {
    cpu: number
    memory: number
    timeout: number
  }
  network: boolean
  filesystemAccess: string[]
}

export interface ExecutionResult {
  id: string
  command: string
  runtime: RuntimeType
  stdout: string
  stderr: string
  exitCode: number
  duration: number
  timestamp: string
  sessionId: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface StreamChunk {
  type: 'stdout' | 'stderr' | 'exit'
  data: string
  timestamp: number
}
