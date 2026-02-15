import { ExecutionRequest, Policy, PolicyValidationResult } from '@/types'

export class SecurityValidator {
  private dangerousPatterns = [
    /rm\s+-rf\s+\//,
    /:\(\)\{:\|\:\&\}\;:/,
    /fork\s+bomb/i,
    /chmod\s+777/,
    /dd\s+if=\/dev\/zero/,
  ]

  validatePolicy(policy: Policy): PolicyValidationResult {
    const errors: string[] = []

    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required')
    }

    if (policy.maxMemoryMb < 32) {
      errors.push('Maximum memory must be at least 32MB')
    }

    if (policy.maxRuntime < 1) {
      errors.push('Maximum runtime must be at least 1 second')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  validateExecution(request: ExecutionRequest, policy: Policy): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check command against blocklist
    if (!this.isCommandAllowed(request.command, policy)) {
      errors.push('Command is not in the allowed list')
    }

    // Check dangerous patterns
    if (this.containsDangerousPattern(request.command)) {
      errors.push('Command contains dangerous patterns')
    }

    // Check resource limits
    if (request.limits.memory > policy.maxMemoryMb) {
      errors.push(`Memory exceeds policy limit: ${policy.maxMemoryMb}MB`)
    }

    if (request.limits.timeout > policy.maxRuntime) {
      errors.push(`Timeout exceeds policy limit: ${policy.maxRuntime}s`)
    }

    // Check filesystem access
    if (request.filesystemAccess.length > 0 && !policy.filesystem.read.length) {
      warnings.push('Filesystem read access not configured in policy')
    }

    // Check network
    if (request.network && !policy.network) {
      errors.push('Network access not allowed by policy')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private isCommandAllowed(command: string, policy: Policy): boolean {
    if (policy.allow.length === 0) return true
    return policy.allow.some((allowed) => command.startsWith(allowed))
  }

  private containsDangerousPattern(command: string): boolean {
    return this.dangerousPatterns.some((pattern) => pattern.test(command))
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}
