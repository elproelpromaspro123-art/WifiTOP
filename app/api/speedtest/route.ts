import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { simulateSpeedTest, getGeoLocation } from '@/lib/speedtest'
import { maintainRanking } from '@/lib/ranking'
import { validateUserName, validateSpeedTestResult } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'

function getRealIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const ip = getRealIP(request)
  
  // Verificar rate limit
  const rateLimit = await checkRateLimit(ip)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: 'Demasiadas solicitudes. Por favor, espera antes de intentar de nuevo.',
        retryAfter: rateLimit.retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter),
        }
      }
    )
  }

  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Formato de solicitud inválido' },
        { status: 400 }
      )
    }

    const { userName } = body

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

    // Validar resultado de prueba
    const resultValidation = validateSpeedTestResult(result)
    if (!resultValidation.valid) {
      return NextResponse.json(
        { error: resultValidation.error },
        { status: 500 }
      )
    }

    // Obtener geolocalización
    const geoLocation = await getGeoLocation(ip)

    // Guardar resultado en la base de datos
    const insertResult = await query(
      `
      INSERT INTO results (user_name, download_speed, upload_speed, ping, ip_address, city, country, isp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
      `,
      [
        userName.trim(),
        result.downloadSpeed,
        result.uploadSpeed,
        result.ping,
        ip,
        geoLocation?.city || null,
        geoLocation?.country || null,
        geoLocation?.isp || null,
      ]
    )

    const resultId = insertResult.rows[0]?.id
    if (!resultId) {
      throw new Error('No se obtuvo ID de resultado')
    }

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
    
    // Generar mensaje basado en resultados
    let message = 'Gracias por participar'
    if (rank && rank <= 1000) {
      message = `¡Felicidades! Entraste en el top 1000 en la posición #${rank}`
    }
    
    // Mensaje adicional basado en estabilidad
    if (result.stability !== undefined) {
      if (result.stability > 95) {
        message += ' | Excelente estabilidad de conexión ✅'
      } else if (result.stability < 70) {
        message += ' | Conexión un poco inestable, considera cambiar de ubicación'
      }
    }

    return NextResponse.json(
      {
        success: true,
        result: {
          downloadSpeed: result.downloadSpeed,
          uploadSpeed: result.uploadSpeed,
          ping: result.ping,
          jitter: result.jitter,
          minDownload: result.minDownload,
          maxDownload: result.maxDownload,
          minUpload: result.minUpload,
          maxUpload: result.maxUpload,
          minPing: result.minPing,
          maxPing: result.maxPing,
          stability: result.stability,
        },
        rank: rank && rank <= 1000 ? rank : null,
        message,
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
