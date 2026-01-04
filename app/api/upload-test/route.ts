import { NextRequest, NextResponse } from 'next/server'

// Configurar timeout para Next.js 14+
export const maxDuration = 300 // 5 minutos

export async function POST(request: NextRequest) {
  try {
    // Solo recibir el blob sin procesarlo
    const buffer = await request.arrayBuffer()
    
    console.log(`Upload recibido: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB`)
    
    // Retornar OK inmediatamente
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json(
      { error: 'Error en el upload' },
      { status: 500 }
    )
  }
}
