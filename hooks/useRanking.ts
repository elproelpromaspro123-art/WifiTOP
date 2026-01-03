import { useState, useEffect, useRef } from 'react'
import { RankingEntry } from '@/types'

interface UseRankingReturn {
  ranking: RankingEntry[]
  loading: boolean
  error: string | null
  totalResults: number
  refetch: () => Promise<void>
}

export function useRanking(): UseRankingReturn {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const isMountedRef = useRef(true)

  const fetchRanking = async () => {
    if (!isMountedRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/ranking', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Error al obtener ranking' }))
        throw new Error(data.error || 'Error al obtener ranking')
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido')
      }

      if (isMountedRef.current) {
        setRanking(data.results || [])
        setTotalResults(data.totalResults || 0)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        console.error('Error fetching ranking:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchRanking()
    
    const interval = setInterval(fetchRanking, 20000) // Reducido a 20 segundos para actualizaciones más frecuentes
    
    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [])

  return { ranking, loading, error, totalResults, refetch: fetchRanking }
}
