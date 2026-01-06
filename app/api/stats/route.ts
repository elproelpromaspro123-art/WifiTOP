import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Usar Promise.all con timeout para evitar bloqueos
        const [totalResult, maxSpeedResult, avgSpeedResult] = await Promise.race([
            Promise.all([
                query<{ count: string }>(`SELECT COUNT(*) as count FROM results`),
                query<{ max_speed: number }>(`SELECT MAX(download_speed) as max_speed FROM results`),
                query<{ avg_speed: number }>(`SELECT AVG(download_speed) as avg_speed FROM results`),
            ]),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), 5000)
            ),
        ]) as any

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
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                },
            }
        )
    } catch (error) {
        console.error('[API] Stats error:', error)
        // Devolver valores por defecto en lugar de error
        return NextResponse.json(
            {
                success: true,
                stats: {
                    total: 0,
                    maxSpeed: 0,
                    avgSpeed: 0,
                },
                cached: true,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
                },
            }
        )
    }
}
