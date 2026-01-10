'use client'

import { useState, useEffect, useCallback } from 'react'
import { RankingEntry } from '@/types'

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/ranking')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setRanking(data.results || [])
          setTotalResults(data.totalResults || 0)
        }
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, 15000)
    return () => clearInterval(interval)
  }, [fetch_])

  return { ranking, totalResults, loading, refetch: fetch_ }
}
