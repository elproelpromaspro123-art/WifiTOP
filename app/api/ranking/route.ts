import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const results = await query(`
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rank,
        user_name as "userName",
        download_speed as "downloadSpeed",
        upload_speed as "uploadSpeed",
        ping,
        country,
        isp,
        created_at as "createdAt"
      FROM results
      ORDER BY download_speed DESC
      LIMIT 100
    `)

    const total = await query<{ count: string }>(`SELECT COUNT(*) as count FROM results`)

    return NextResponse.json({
      success: true,
      results: results.rows,
      totalResults: parseInt(total.rows[0]?.count || '0'),
    })
  } catch {
    return NextResponse.json({ success: true, results: [], totalResults: 0 })
  }
}
