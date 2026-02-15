import { NextRequest, NextResponse } from 'next/server'
import { AuditLog } from '@/types/log'

// Mock logs storage
const logs: AuditLog[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const severity = searchParams.get('severity')
    const action = searchParams.get('action')
    const sessionId = searchParams.get('sessionId')

    let filtered = logs

    if (severity) {
      filtered = filtered.filter((log) => log.severity === severity)
    }
    if (action) {
      filtered = filtered.filter((log) => log.action === action)
    }
    if (sessionId) {
      filtered = filtered.filter((log) => log.sessionId === sessionId)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Get logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const logId = Math.random().toString(36).substr(2, 9)

    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      ...body,
    }

    logs.push(newLog)
    return NextResponse.json(newLog, { status: 201 })
  } catch (error) {
    console.error('Create log error:', error)
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    )
  }
}
