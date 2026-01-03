import { useState, useEffect, useRef } from 'react'
import { StatsData } from '@/types'

interface UseStatsReturn {
  stats: StatsData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData>({ total: 0, maxSpeed: 0, avgSpeed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchStats = async () => {
    if (!isMountedRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/stats', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Error al obtener estadísticas' }))
        throw new Error(data.error || 'Error al obtener estadísticas')
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido')
      }

      if (isMountedRef.current && data.stats) {
        setStats(data.stats)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        console.error('Error fetching stats:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchStats()
    
    const interval = setInterval(fetchStats, 45000) // Reducido a 45 segundos para actualizaciones más rápidas
    
    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
