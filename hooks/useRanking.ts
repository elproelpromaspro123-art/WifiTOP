import { useState, useEffect } from 'react'
import { RankingEntry } from '@/types'

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  const fetchRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/ranking')
      
      if (!response.ok) {
        throw new Error('Failed to fetch ranking')
      }
      
      const data = await response.json()
      setRanking(data.results || [])
      setTotalResults(data.totalResults || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching ranking:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanking()
    const interval = setInterval(fetchRanking, 30000)
    return () => clearInterval(interval)
  }, [])

  return { ranking, loading, error, totalResults, refetch: fetchRanking }
}
