import { NextRequest, NextResponse } from 'next/server'
import { Session } from '@/types'

// Mock sessions storage
const sessions: Map<string, Session> = new Map()

export async function GET() {
  try {
    const sessionList = Array.from(sessions.values())
    return NextResponse.json(sessionList)
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = Math.random().toString(36).substr(2, 9)

    const newSession: Session = {
      id: sessionId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: [],
      agentName: body.agentName,
      metadata: body.metadata,
    }

    sessions.set(sessionId, newSession)
    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
