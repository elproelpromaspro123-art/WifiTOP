import { NextResponse } from 'next/server'
import { simulateSpeedTest, type DetailedSpeedTestResult } from '@/lib/speedtest'

export async function GET() {
  try {
    console.log('Iniciando prueba de speedtest...')
    const result: DetailedSpeedTestResult = await simulateSpeedTest()
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Prueba completada exitosamente',
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
