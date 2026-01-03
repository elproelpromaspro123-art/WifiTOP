import { NextResponse } from 'next/server'
import { getTopResults, getTotalResultsCount } from '@/lib/ranking'

export async function GET() {
  try {
    const results = await getTopResults(1000)
    const totalResults = await getTotalResultsCount()

    return NextResponse.json(
      {
        success: true,
        results,
        totalResults,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Ranking error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el ranking' },
      { status: 500 }
    )
  }
}
