import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Verificar token de inicialización (solo en desarrollo o con token)
    const initToken = process.env.INIT_TOKEN
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    
    // En producción, solo permitir con token válido o desde Render deployment
    if (process.env.NODE_ENV === 'production') {
      if (!initToken || token !== initToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Initialization failed', details: String(error) }, { status: 500 })
  }
}
