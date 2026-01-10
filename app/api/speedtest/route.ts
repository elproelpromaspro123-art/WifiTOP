import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getGeoLocation } from '@/lib/geo'
import { validateUserName, validateSpeedResult, detectFraud } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const ip = getIP(request)

  const rateLimit = await checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes', retryAfter: rateLimit.retryAfter },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { userName, testResult } = body

    const nameValidation = validateUserName(userName)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 })
    }

    const resultValidation = validateSpeedResult(testResult)
    if (!resultValidation.valid) {
      return NextResponse.json({ error: resultValidation.error }, { status: 400 })
    }

    const fraud = detectFraud(testResult)
    if (fraud.fraud) {
      return NextResponse.json({ error: 'Resultado sospechoso detectado' }, { status: 400 })
    }

    const geo = await getGeoLocation(ip)

    const insertResult = await query(
      `INSERT INTO results (user_name, download_speed, upload_speed, ping, ip_address, country, isp)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userName.trim(), testResult.downloadSpeed, testResult.uploadSpeed, testResult.ping, ip, geo.country, geo.isp]
    )

    const resultId = insertResult.rows[0]?.id

    const rankResult = await query<{ rank: number }>(
      `SELECT COUNT(*) + 1 as rank FROM results WHERE download_speed > $1`,
      [testResult.downloadSpeed]
    )
    const rank = rankResult.rows[0]?.rank || null

    await query(
      `DELETE FROM results WHERE id IN (
        SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rn FROM results) sub WHERE rn > 100000
      )`
    )

    return NextResponse.json({
      success: true,
      result: testResult,
      rank: rank && rank <= 1000 ? rank : null,
      message: rank && rank <= 1000 ? `🏆 Top ${rank} en el ranking` : 'Prueba completada',
    })
  } catch {
    return NextResponse.json({ error: 'Error al procesar la prueba' }, { status: 500 })
  }
}
