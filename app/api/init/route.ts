import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    // Verificar token de inicialización
    const initToken = process.env.INIT_TOKEN
    if (!initToken) {
      return NextResponse.json({ error: 'No init token configured' }, { status: 403 })
    }

    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 })
  }
}
