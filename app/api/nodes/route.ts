import { NextRequest, NextResponse } from 'next/server'
import { RuntimeNode } from '@/types/node'

// Mock nodes storage
const nodes: RuntimeNode[] = [
  {
    id: 'node-001',
    name: 'Docker Host 1',
    type: 'local',
    status: 'healthy',
    cpu: 45.2,
    memory: 16384,
    memoryUsed: 8192,
    uptime: 7776000,
    sandboxHealth: 99,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'node-002',
    name: 'Firecracker Cluster',
    type: 'cluster',
    status: 'healthy',
    cpu: 62.8,
    memory: 32768,
    memoryUsed: 24576,
    uptime: 5184000,
    sandboxHealth: 98,
    lastSeen: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    return NextResponse.json(nodes)
  } catch (error) {
    console.error('Get nodes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nodeId = Math.random().toString(36).substr(2, 9)

    const newNode: RuntimeNode = {
      id: nodeId,
      name: body.name,
      type: body.type || 'local',
      status: 'healthy',
      cpu: 0,
      memory: body.memory || 8192,
      memoryUsed: 0,
      uptime: 0,
      sandboxHealth: 100,
      lastSeen: new Date().toISOString(),
    }

    nodes.push(newNode)
    return NextResponse.json(newNode, { status: 201 })
  } catch (error) {
    console.error('Create node error:', error)
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    )
  }
}
