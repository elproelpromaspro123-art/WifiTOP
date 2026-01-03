import { NextResponse } from 'next/server'
import { getTopResults, getTotalResultsCount } from '@/lib/ranking'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [results, totalResults] = await Promise.all([
      getTopResults(1000),
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
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Ranking error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el ranking' },
      { status: 500 }
    )
  }
}
