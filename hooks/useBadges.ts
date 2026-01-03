import { useState, useEffect } from 'react'
import { unlockBadges as calculateBadges, getBadgeInfo } from '@/lib/badges'

interface BadgeRecord {
  id: string
  unlockedAt: string
  testSpeed: number
}

interface BadgeStorageData {
  badges: Record<string, BadgeRecord>
  totalBadges: number
  lastUpdated: string
}

const STORAGE_KEY = 'wifitop_user_badges'

/**
 * Hook para manejar badges del usuario en localStorage
 * Sincroniza automáticamente con el sistema de badges
 */
export function useBadges() {
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [badgeRecords, setBadgeRecords] = useState<Record<string, BadgeRecord>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Cargar badges del localStorage al montar
  useEffect(() => {
    const loadBadges = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: BadgeStorageData = JSON.parse(stored)
          setBadgeRecords(data.badges)
          setUserBadges(Object.keys(data.badges))
        }
      } catch (error) {
        console.error('Error loading badges from localStorage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Solo ejecutar en cliente
    if (typeof window !== 'undefined') {
      loadBadges()
    }
  }, [])

  /**
   * Desbloquea nuevos badges después de una prueba
   */
  const unlockNewBadges = (
    downloadSpeed: number,
    uploadSpeed: number,
    ping: number,
    jitter: number,
    stability: number,
    rank?: number,
    previousTestCount?: number
  ): string[] => {
    // Calcular badges a desbloquear
    const newBadgeIds = calculateBadges(
      downloadSpeed,
      uploadSpeed,
      ping,
      jitter,
      stability,
      rank,
      previousTestCount
    )

    // Filtrar solo badges nuevos
    const actuallyNewBadges = newBadgeIds.filter(id => !badgeRecords[id])

    if (actuallyNewBadges.length === 0) {
      return [] // No hay badges nuevos
    }

    // Guardar badges nuevos
    const updatedRecords = { ...badgeRecords }
    const now = new Date().toISOString()

    actuallyNewBadges.forEach(badgeId => {
      updatedRecords[badgeId] = {
        id: badgeId,
        unlockedAt: now,
        testSpeed: downloadSpeed
      }
    })

    // Persistir a localStorage
    const storageData: BadgeStorageData = {
      badges: updatedRecords,
      totalBadges: Object.keys(updatedRecords).length,
      lastUpdated: now
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      setBadgeRecords(updatedRecords)
      setUserBadges(Object.keys(updatedRecords))

      console.log(
        `✓ ${actuallyNewBadges.length} badge(s) desbloqueado(s):`,
        actuallyNewBadges.map(id => getBadgeInfo(id)?.name).join(', ')
      )

      return actuallyNewBadges
    } catch (error) {
      console.error('Error saving badges to localStorage:', error)
      return []
    }
  }

  /**
   * Obtiene todos los badges del usuario
   */
  const getAllBadges = () => {
    return userBadges.map(badgeId => ({
      ...badgeRecords[badgeId],
      info: getBadgeInfo(badgeId)
    })).filter(b => b.info !== null)
  }

  /**
   * Obtiene información de un badge específico
   */
  const getBadgeData = (badgeId: string) => {
    return badgeRecords[badgeId] || null
  }

  /**
   * Verifica si un badge ya fue desbloqueado
   */
  const hasBadge = (badgeId: string): boolean => {
    return badgeId in badgeRecords
  }

  /**
   * Limpia todos los badges (útil para testing)
   */
  const clearAllBadges = () => {
    localStorage.removeItem(STORAGE_KEY)
    setBadgeRecords({})
    setUserBadges([])
  }

  /**
   * Obtiene estadísticas de badges
   */
  const getBadgeStats = () => {
    const badges = getAllBadges()
    const rarityCount = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0
    }

    badges.forEach(badge => {
      if (badge.info?.rarity) {
        rarityCount[badge.info.rarity]++
      }
    })

    return {
      total: badges.length,
      byRarity: rarityCount,
      lastUnlockedAt: badges.length > 0
        ? new Date(badges[badges.length - 1].unlockedAt).toLocaleDateString()
        : null
    }
  }

  return {
    userBadges,
    badgeRecords,
    isLoading,
    unlockNewBadges,
    getAllBadges,
    getBadgeData,
    hasBadge,
    clearAllBadges,
    getBadgeStats,
    totalBadges: userBadges.length
  }
}
