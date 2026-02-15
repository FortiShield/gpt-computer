import { ExecutionRequest, ExecutionResult, StreamChunk } from '@/types'

export class MockSandboxRunner {
  async execute(
    request: ExecutionRequest,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const sessionId = this.generateId()
    const executionId = this.generateId()

    // Simulate command detection for risk assessment
    const riskLevel = this.assessRisk(request.command)

    // Simulate execution with streaming output
    if (onChunk) {
      // Simulate stdout stream
      const output = this.generateMockOutput(request.command)
      for (const line of output.split('\n')) {
        await this.delay(Math.random() * 100)
        onChunk({
          type: 'stdout',
          data: line + '\n',
          timestamp: Date.now(),
        })
      }

      // Simulate exit code
      await this.delay(100)
      onChunk({
        type: 'exit',
        data: '0',
        timestamp: Date.now(),
      })
    }

    const duration = Date.now() - startTime

    return {
      id: executionId,
      command: request.command,
      runtime: request.runtime,
      stdout: this.generateMockOutput(request.command),
      stderr: '',
      exitCode: 0,
      duration,
      timestamp: new Date().toISOString(),
      sessionId,
      riskLevel,
    }
  }

  private assessRisk(command: string): 'low' | 'medium' | 'high' {
    const dangerousPatterns = [
      'rm -rf',
      'fork bomb',
      ':(){:|:&};:',
      'chmod 777',
      'sudo',
    ]
    for (const pattern of dangerousPatterns) {
      if (command.includes(pattern)) {
        return 'high'
      }
    }
    return 'low'
  }

  private generateMockOutput(command: string): string {
    const outputs: Record<string, string> = {
      'ls -la': `total 48
drwxr-xr-x  5 user  staff   160 Jan 16 10:30 .
drwxr-xr-x 12 user  staff   384 Jan 16 10:20 ..
-rw-r--r--  1 user  staff  1234 Jan 16 10:25 package.json
drwxr-xr-x  3 user  staff    96 Jan 16 10:26 src
drwxr-xr-x  2 user  staff    64 Jan 16 10:27 public`,
      'echo hello': 'hello',
      'node --version': 'v18.16.0',
      'npm --version': '9.6.4',
      default: `Command executed: ${command}\nOutput simulated by mock sandbox runner.`,
    }

    return outputs[command] || outputs.default
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
