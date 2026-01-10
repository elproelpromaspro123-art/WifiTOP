import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to initialize database' }, { status: 500 })
  }
}
