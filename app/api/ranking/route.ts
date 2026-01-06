import { NextResponse } from 'next/server'
import { getTopResults, getTotalResultsCount } from '@/lib/ranking'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Reducir a 100 para evitar sobrecarga en Render
        const [results, totalResults] = await Promise.all([
            getTopResults(100),
            getTotalResultsCount(),
        ])

        if (!Array.isArray(results)) {
            throw new Error('Invalid results format')
        }

        return NextResponse.json(
            {
                success: true,
                results: results || [],
                totalResults: Math.max(0, totalResults || 0),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                },
            }
        )
    } catch (error) {
        console.error('[API] Ranking error:', error)
        // En caso de error, devolver array vacío en lugar de error 500
        return NextResponse.json(
            {
                success: true,
                results: [],
                totalResults: 0,
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
