import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM results`
    )

    const maxSpeedResult = await query<{ max_speed: number }>(
      `SELECT MAX(download_speed) as max_speed FROM results`
    )

    const avgSpeedResult = await query<{ avg_speed: number }>(
      `SELECT AVG(download_speed) as avg_speed FROM results`
    )

    const total = Math.max(0, parseInt(totalResult.rows[0]?.count || '0', 10))
    const maxSpeed = Math.max(0, maxSpeedResult.rows[0]?.max_speed || 0)
    const avgSpeed = Math.max(0, avgSpeedResult.rows[0]?.avg_speed || 0)

    return NextResponse.json(
      {
        success: true,
        stats: {
          total,
          maxSpeed: Math.round(maxSpeed * 100) / 100,
          avgSpeed: Math.round(avgSpeed * 100) / 100,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
