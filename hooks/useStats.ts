'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatsData } from '@/types'

export function useStats() {
  const [stats, setStats] = useState<StatsData>({ total: 0, maxSpeed: 0, avgSpeed: 0 })
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        if (data.success) setStats(data.stats)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, 30000)
    return () => clearInterval(interval)
  }, [fetch_])

  return { stats, loading, refetch: fetch_ }
}
