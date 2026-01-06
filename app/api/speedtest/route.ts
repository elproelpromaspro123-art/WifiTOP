import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getGeoLocation } from '@/lib/geo'
import { maintainRanking } from '@/lib/ranking'
import { validateUserName, validateSpeedTestResult, detectAnomalies } from '@/lib/validation'
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

        const { userName, testResult } = body

        if (!userName || !userName.trim()) {
            return NextResponse.json(
                { error: 'El nombre es requerido' },
                { status: 400 }
            )
        }

        // Validar nombre
        const userNameValidation = validateUserName(userName)
        if (!userNameValidation.valid) {
            return NextResponse.json(
                { error: userNameValidation.error },
                { status: 400 }
            )
        }

        if (!testResult) {
            return NextResponse.json(
                { error: 'No se recibieron resultados de la prueba' },
                { status: 400 }
            )
        }

        const result = {
            downloadSpeed: testResult.downloadSpeed,
            uploadSpeed: testResult.uploadSpeed,
            ping: testResult.ping,
            jitter: testResult.jitter || 0,
            minDownload: testResult.minDownload || (testResult.downloadSpeed * 0.95),
            maxDownload: testResult.maxDownload || (testResult.downloadSpeed * 1.05),
            minUpload: testResult.minUpload || (testResult.uploadSpeed * 0.95),
            maxUpload: testResult.maxUpload || (testResult.uploadSpeed * 1.05),
            minPing: testResult.minPing || (testResult.ping * 0.9),
            maxPing: testResult.maxPing || (testResult.ping * 1.1),
            stability: testResult.stability || 95,
        }

        // Validar resultado de prueba
        const resultValidation = validateSpeedTestResult(result)
        if (!resultValidation.valid) {
            return NextResponse.json(
                { error: resultValidation.error },
                { status: 500 }
            )
        }

        // Detectar anomalías y fraude
        const anomalyDetection = detectAnomalies(result)
        if (anomalyDetection.anomaly && (anomalyDetection.confidence || 0) > 70) {
            return NextResponse.json(
                { error: 'Resultado sospechoso detectado. Por favor intenta de nuevo.' },
                { status: 400 }
            )
        }

        // Obtener geolocalización
        const geoLocation = await getGeoLocation(ip)

        // Guardar resultado en la base de datos
        const insertResult = await query(
            `
      INSERT INTO results (user_name, download_speed, upload_speed, ping, ip_address, country, isp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
            [
                userName.trim(),
                result.downloadSpeed,
                result.uploadSpeed,
                result.ping,
                ip,
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

        // Generar mensaje detallado basado en resultados
        let message = 'Prueba completada'
        const messages: string[] = []

        // Mensaje de ranking
        if (rank && rank <= 1000) {
            messages.push(`🏆 Top ${rank} en el ranking`)
        } else if (rank) {
            messages.push(`📊 Tu resultado fue guardado (${rank}º)`)
        }

        // Mensaje de velocidad
        if (result.downloadSpeed > 100) {
            messages.push('⚡ Descarga excelente')
        } else if (result.downloadSpeed > 50) {
            messages.push('⚡ Descarga buena')
        } else if (result.downloadSpeed > 20) {
            messages.push('⚡ Descarga normal')
        }

        // Mensaje de estabilidad
        if (result.stability !== undefined) {
            if (result.stability > 95) {
                messages.push('✅ Excelente estabilidad')
            } else if (result.stability > 80) {
                messages.push('✅ Buena estabilidad')
            } else if (result.stability < 60) {
                messages.push('⚠️ Conexión inestable')
            }
        }

        // Mensaje de simetría
        const ratio = result.uploadSpeed / result.downloadSpeed
        if (ratio > 0.8) {
            messages.push('🔄 Conexión muy simétrica')
        } else if (ratio > 0.5) {
            messages.push('🔄 Conexión normal')
        }

        message = messages.join(' | ') || 'Gracias por participar'

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
