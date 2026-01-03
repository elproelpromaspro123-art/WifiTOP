import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await initializeDatabase()
      return NextResponse.json({ success: true, message: 'Database initialized' })
    }
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 })
  }
}
