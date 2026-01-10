import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [total, max, avg] = await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*) as count FROM results`),
      query<{ max: number }>(`SELECT MAX(download_speed) as max FROM results`),
      query<{ avg: number }>(`SELECT AVG(download_speed) as avg FROM results`),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total: parseInt(total.rows[0]?.count || '0'),
        maxSpeed: Math.round((max.rows[0]?.max || 0) * 100) / 100,
        avgSpeed: Math.round((avg.rows[0]?.avg || 0) * 100) / 100,
      },
    })
  } catch {
    return NextResponse.json({ success: true, stats: { total: 0, maxSpeed: 0, avgSpeed: 0 } })
  }
}
