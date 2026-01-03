import { useState, useEffect } from 'react'

export interface TestRecord {
  id: string
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  stability: number
  timestamp: string
  userName?: string
}

const STORAGE_KEY = 'wifitop_test_history'
const MAX_RECORDS = 30

/**
 * Hook para gestionar histórico local de pruebas
 */
export function useTestHistory() {
  const [history, setHistory] = useState<TestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar histórico del localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const records: TestRecord[] = JSON.parse(stored)
            setHistory(records)
          }
        }
      } catch (error) {
        console.error('Error loading test history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  /**
   * Agrega una nueva prueba al histórico
   */
  const addTest = (test: Omit<TestRecord, 'id' | 'timestamp'>) => {
    const newRecord: TestRecord = {
      ...test,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }

    const updated = [newRecord, ...history].slice(0, MAX_RECORDS)

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setHistory(updated)
      }
      return newRecord
    } catch (error) {
      console.error('Error saving test to history:', error)
      return null
    }
  }

  /**
   * Obtiene estadísticas del histórico
   */
  const getStats = () => {
    if (history.length === 0) {
      return null
    }

    const speeds = history.map(t => t.downloadSpeed)
    const pings = history.map(t => t.ping)
    const uploads = history.map(t => t.uploadSpeed)

    return {
      totalTests: history.length,
      avgDownload: speeds.reduce((a, b) => a + b, 0) / speeds.length,
      maxDownload: Math.max(...speeds),
      minDownload: Math.min(...speeds),
      avgUpload: uploads.reduce((a, b) => a + b, 0) / uploads.length,
      avgPing: pings.reduce((a, b) => a + b, 0) / pings.length,
      bestSpeed: Math.max(...speeds),
      worstSpeed: Math.min(...speeds),
      trend: calculateTrend(speeds)
    }
  }

  /**
   * Calcula la tendencia de velocidad (arriba/abajo)
   */
  const calculateTrend = (speeds: number[]): 'up' | 'down' | 'stable' => {
    if (speeds.length < 2) return 'stable'

    const recent = speeds.slice(0, 5)
    const older = speeds.slice(5, 10)

    if (older.length === 0) return 'stable'

    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
    const avgOlder = older.reduce((a, b) => a + b, 0) / older.length

    const diff = ((avgRecent - avgOlder) / avgOlder) * 100

    if (diff > 5) return 'up'
    if (diff < -5) return 'down'
    return 'stable'
  }

  /**
   * Limpia el histórico
   */
  const clearHistory = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
        setHistory([])
      }
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  return {
    history,
    isLoading,
    addTest,
    getStats,
    clearHistory,
    totalTests: history.length
  }
}
