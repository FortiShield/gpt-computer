import { NextRequest, NextResponse } from 'next/server'
import { Policy } from '@/types'

// Mock policies storage
const policies: Map<string, Policy> = new Map([
  [
    'default',
    {
      id: 'default',
      name: 'Default Policy',
      description: 'Standard execution policy',
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
  ],
])

export async function GET() {
  try {
    const policyList = Array.from(policies.values())
    return NextResponse.json(policyList)
  } catch (error) {
    console.error('Get policies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Policy = await request.json()
    const policyId = Math.random().toString(36).substr(2, 9)

    const newPolicy: Policy = {
      ...body,
      id: policyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    policies.set(policyId, newPolicy)
    return NextResponse.json(newPolicy, { status: 201 })
  } catch (error) {
    console.error('Create policy error:', error)
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    )
  }
}
