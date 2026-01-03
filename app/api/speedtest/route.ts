import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { simulateSpeedTest } from '@/lib/speedtest'
import { maintainRanking } from '@/lib/ranking'
import { validateUserName } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json()

    // Validar nombre de usuario
    const validation = validateUserName(userName)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Ejecutar prueba de velocidad simulada
    const result = await simulateSpeedTest()

    // Obtener IP del cliente
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Guardar resultado en la base de datos
    const insertResult = await query(
      `
      INSERT INTO results (user_name, download_speed, upload_speed, ping, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, download_speed, upload_speed, ping
      `,
      [
        userName.trim(),
        result.downloadSpeed,
        result.uploadSpeed,
        result.ping,
        ip
      ]
    )

    const resultId = insertResult.rows[0]?.id

    // Mantener el ranking limitado a 1000
    await maintainRanking()

    // Obtener la posición del usuario si está en el top 1000
    const rankResult = await query<{ rank: number }>(
      `
      SELECT ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rank
      FROM results
      WHERE id = $1
      `,
      [resultId]
    )

    const rank = rankResult.rows[0]?.rank

    return NextResponse.json(
      {
        success: true,
        result: {
          downloadSpeed: result.downloadSpeed,
          uploadSpeed: result.uploadSpeed,
          ping: result.ping,
          jitter: result.jitter,
        },
        rank: rank && rank <= 1000 ? rank : null,
        message: rank && rank <= 1000 
          ? `¡Felicidades! Entraste en el top 1000 en la posición #${rank}`
          : 'Gracias por participar',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Speed test error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la prueba de velocidad' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Usa POST para realizar una prueba' },
    { status: 405 }
  )
}
