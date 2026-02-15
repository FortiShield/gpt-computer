import { NextRequest, NextResponse } from 'next/server'
import { ExecutionRequest } from '@/types'
import { SecurityValidator } from '@/server/security/validator'
import { MockSandboxRunner } from '@/server/sandbox/mockRunner'

const validator = new SecurityValidator()

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json()

    // Basic validation
    if (!body.command || !body.runtime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Execute command with mock runner
    const runner = new MockSandboxRunner()
    const result = await runner.execute(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execution error:', error)
    return NextResponse.json(
      { error: 'Execution failed' },
      { status: 500 }
    )
  }
}
