import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 })
  }
}
