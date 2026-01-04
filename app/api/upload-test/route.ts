import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Solo recibir el blob sin procesarlo
    await request.blob()
    
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
