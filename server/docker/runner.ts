import { EventEmitter } from 'events'
import { Readable } from 'stream'
import { getDockerClient } from './client'
import { getBaseImage } from './images'
import type { ExecutionRequest, ExecutionResult } from '@/types'

interface ExecutionStreamEvent {
  type: 'stdout' | 'stderr' | 'exit' | 'error'
  data?: string
  exitCode?: number
  timestamp: number
}

/**
 * Production Docker-based sandbox runner
 * Executes commands in isolated Docker containers with real-time streaming
 */
export class DockerSandboxRunner extends EventEmitter {
  private containerId: string | null = null
  private startTime: number = 0
  private outputLines: string[] = []
  private errorLines: string[] = []

  constructor(private request: ExecutionRequest) {
    super()
  }

  /**
   * Execute command in Docker container with streaming output
   */
  async *execute(): AsyncGenerator<ExecutionStreamEvent> {
    try {
      this.startTime = Date.now()
      const client = getDockerClient()

      // Prepare container configuration
      const baseImage = getBaseImage(this.request.runtime)
      const containerConfig = this.buildContainerConfig(baseImage)

      console.log('[Docker] Creating container with config:', {
        image: baseImage,
        cpus: this.request.cpuLimit,
        memory: this.request.memoryLimitMB,
        timeout: this.request.timeoutSeconds,
      })

      // Create container
      const container = await client.createContainer(containerConfig)
      this.containerId = container.id

      yield {
        type: 'stdout',
        data: `[Docker] Container created: ${this.containerId}`,
        timestamp: Date.now(),
      }

      // Start container
      await container.start()

      yield {
        type: 'stdout',
        data: '[Docker] Container started',
        timestamp: Date.now(),
      }

      // Execute command
      const exec = await container.exec({
        Cmd: ['/bin/sh', '-c', this.request.command],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: false,
      })

      // Stream output with timeout
      yield* await this.streamExecution(exec)

      // Get final exit code
      const exitData = await container.wait()
      const exitCode = exitData?.StatusCode || 0

      // Clean up container
      await this.cleanup()

      yield {
        type: 'exit',
        exitCode,
        timestamp: Date.now(),
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)

      console.error('[Docker] Execution failed:', errorMsg)

      // Attempt cleanup on error
      await this.cleanup()

      yield {
        type: 'error',
        data: `Execution error: ${errorMsg}`,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Stream execution output with timeout
   */
  private async *streamExecution(
    exec: any
  ): AsyncGenerator<ExecutionStreamEvent> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Execution timeout after ${this.request.timeoutSeconds}s`))
      }, this.request.timeoutSeconds * 1000)

      const stream = exec.start({ Detach: false }, (err: any, stream: any) => {
        if (err) {
          clearTimeout(timeout)
          reject(err)
          return
        }

        // Parse Docker stream format (stdout/stderr)
        const outputChunks: ExecutionStreamEvent[] = []
        let buffer = Buffer.alloc(0)

        stream.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk])

          // Process complete lines
          let pos = 0
          while (pos < buffer.length) {
            // Docker stream format: 8-byte header + payload
            if (buffer.length - pos < 8) break

            const streamType = buffer[pos]
            const payloadSize = buffer.readUInt32BE(pos + 4)
            const payloadEnd = pos + 8 + payloadSize

            if (buffer.length < payloadEnd) break

            const payload = buffer.toString(
              'utf-8',
              pos + 8,
              payloadEnd
            )

            const type = streamType === 1 ? 'stdout' : 'stderr'
            outputChunks.push({
              type,
              data: payload,
              timestamp: Date.now(),
            })

            if (type === 'stdout') {
              this.outputLines.push(payload)
            } else {
              this.errorLines.push(payload)
            }

            pos = payloadEnd
          }

          // Keep remaining data in buffer
          buffer = buffer.slice(pos)
        })

        stream.on('end', () => {
          clearTimeout(timeout)
          resolve(outputChunks)
        })

        stream.on('error', (err: any) => {
          clearTimeout(timeout)
          reject(err)
        })
      })
    }).then((events: ExecutionStreamEvent[]) => {
      // Yield all accumulated events
      for (const event of events) {
        yield event
      }
    })
  }

  /**
   * Build Docker container configuration based on execution request
   */
  private buildContainerConfig(baseImage: string) {
    const cpuQuota = Math.max(1, Math.floor(this.request.cpuLimit * 100000))

    return {
      Image: baseImage,
      Cmd: ['/bin/sh'],
      AttachStdout: true,
      AttachStderr: true,
      NetworkDisabled: !this.request.allowNetwork,
      HostConfig: {
        // Resource limits
        CpuQuota: cpuQuota,
        CpuPeriod: 100000,
        Memory: this.request.memoryLimitMB * 1024 * 1024,
        MemorySwap: this.request.memoryLimitMB * 1024 * 1024,

        // Security
        ReadonlyRootfs: !this.request.allowFilesystemWrite,
        CapDrop: ['ALL'],
        CapAdd: ['NET_BIND_SERVICE'],
        SecurityOpt: ['no-new-privileges:true'],

        // Isolation
        IpcMode: 'private',
        PidMode: 'private',

        // Tmpfs for writable areas
        Tmpfs: this.request.allowFilesystemWrite
          ? {
              '/tmp': 'size=100m,mode=1777',
            }
          : undefined,
      },
      Labels: {
        'gpt-computer': 'true',
        'execution-id': this.request.id,
        'created-at': new Date().toISOString(),
      },
    }
  }

  /**
   * Cleanup container and resources
   */
  private async cleanup(): Promise<void> {
    if (!this.containerId) return

    try {
      const client = getDockerClient()
      const container = client.getContainer(this.containerId)

      // Stop container with timeout
      try {
        await container.stop({ t: 5 })
      } catch (e) {
        // Already stopped
      }

      // Remove container
      await container.remove({ force: true })
      console.log(`[Docker] Container cleaned up: ${this.containerId}`)
    } catch (error) {
      console.error('[Docker] Cleanup failed:', error)
    }
  }

  /**
   * Get execution duration in milliseconds
   */
  getDuration(): number {
    return Date.now() - this.startTime
  }

  /**
   * Build final execution result
   */
  buildResult(exitCode: number): ExecutionResult {
    return {
      id: this.request.id,
      sessionId: this.request.sessionId,
      command: this.request.command,
      runtime: this.request.runtime,
      status: exitCode === 0 ? 'success' : 'failed',
      exitCode,
      output: this.outputLines.join(''),
      error: this.errorLines.join(''),
      duration: this.getDuration(),
      startedAt: new Date(this.startTime),
      completedAt: new Date(),
    }
  }
}

/**
 * Execute command in Docker sandbox and return result
 * This is a convenience function for non-streaming execution
 */
export async function executeSandboxCommand(
  request: ExecutionRequest
): Promise<ExecutionResult> {
  const runner = new DockerSandboxRunner(request)
  let exitCode = 1

  for await (const event of runner.execute()) {
    if (event.type === 'exit') {
      exitCode = event.exitCode || 1
    }
  }

  return runner.buildResult(exitCode)
}
