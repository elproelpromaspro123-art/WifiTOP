export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic'
}

export interface UserBadges {
  badges: Badge[]
  totalBadges: number
  unlockedAt: Record<string, string> // badgeId -> unlockedDate
}

const BADGES: Record<string, Badge> = {
  speedster_extreme: {
    id: 'speedster_extreme',
    name: 'Speedster Extremo',
    description: 'Alcanzó velocidad de descarga > 500 Mbps',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
    rarity: 'epic'
  },
  fiber_connection: {
    id: 'fiber_connection',
    name: 'Conexión de Fibra',
    description: 'Ping < 5ms (conexión ultra-estable)',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    rarity: 'rare'
  },
  super_downloader: {
    id: 'super_downloader',
    name: 'Super Descargador',
    description: 'Velocidad de descarga > 300 Mbps',
    icon: '⬇️',
    color: 'from-blue-500 to-cyan-500',
    rarity: 'rare'
  },
  upload_master: {
    id: 'upload_master',
    name: 'Master de Subida',
    description: 'Velocidad de subida > 100 Mbps',
    icon: '⬆️',
    color: 'from-green-500 to-emerald-500',
    rarity: 'rare'
  },
  gaming_beast: {
    id: 'gaming_beast',
    name: 'Bestia Gamer',
    description: 'Ping < 10ms y descarga > 50 Mbps',
    icon: '🎮',
    color: 'from-purple-500 to-pink-500',
    rarity: 'uncommon'
  },
  stability_king: {
    id: 'stability_king',
    name: 'Rey de la Estabilidad',
    description: 'Estabilidad de conexión > 95%',
    icon: '👑',
    color: 'from-yellow-500 to-yellow-300',
    rarity: 'epic'
  },
  trustworthy: {
    id: 'trustworthy',
    name: 'Confiable',
    description: 'Completó 10+ pruebas sin errores',
    icon: '✅',
    color: 'from-green-500 to-blue-500',
    rarity: 'uncommon'
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Descarga > 100 Mbps',
    icon: '👿',
    color: 'from-red-600 to-red-400',
    rarity: 'uncommon'
  },
  balanced_connection: {
    id: 'balanced_connection',
    name: 'Conexión Balanceada',
    description: 'Descarga y subida > 50 Mbps con ping < 30ms',
    icon: '⚖️',
    color: 'from-cyan-500 to-blue-500',
    rarity: 'uncommon'
  },
  ranked_top_1000: {
    id: 'ranked_top_1000',
    name: 'Top 1000 Global',
    description: 'Alcanzó posición en top 1000 ranking',
    icon: '🏆',
    color: 'from-yellow-400 to-yellow-600',
    rarity: 'rare'
  },
  ranked_top_100: {
    id: 'ranked_top_100',
    name: 'Top 100 Global',
    description: 'Alcanzó posición en top 100 ranking',
    icon: '🥇',
    color: 'from-yellow-300 to-yellow-500',
    rarity: 'epic'
  },
  low_latency_master: {
    id: 'low_latency_master',
    name: 'Master de Baja Latencia',
    description: 'Jitter < 2ms',
    icon: '📡',
    color: 'from-cyan-500 to-blue-600',
    rarity: 'rare'
  }
}

/**
 * Obtiene los badges desbloqueados basado en resultados del test
 */
export function unlockBadges(
  downloadSpeed: number,
  uploadSpeed: number,
  ping: number,
  jitter: number,
  stability: number,
  rank?: number,
  previousTestCount?: number
): string[] {
  const unlockedBadges: string[] = []

  // Speedster Extremo: > 500 Mbps
  if (downloadSpeed > 500) {
    unlockedBadges.push('speedster_extreme')
  }

  // Conexión de Fibra: ping < 5ms
  if (ping < 5) {
    unlockedBadges.push('fiber_connection')
  }

  // Super Descargador: > 300 Mbps
  if (downloadSpeed > 300) {
    unlockedBadges.push('super_downloader')
  }

  // Upload Master: > 100 Mbps
  if (uploadSpeed > 100) {
    unlockedBadges.push('upload_master')
  }

  // Gaming Beast: ping < 10ms AND descarga > 50 Mbps
  if (ping < 10 && downloadSpeed > 50) {
    unlockedBadges.push('gaming_beast')
  }

  // Stability King: estabilidad > 95%
  if (stability > 95) {
    unlockedBadges.push('stability_king')
  }

  // Trustworthy: 10+ pruebas
  if (previousTestCount && previousTestCount >= 10) {
    unlockedBadges.push('trustworthy')
  }

  // Speed Demon: descarga > 100 Mbps
  if (downloadSpeed > 100) {
    unlockedBadges.push('speed_demon')
  }

  // Balanced Connection: descarga > 50 AND subida > 50 AND ping < 30
  if (downloadSpeed > 50 && uploadSpeed > 50 && ping < 30) {
    unlockedBadges.push('balanced_connection')
  }

  // Ranked Top 1000
  if (rank && rank <= 1000) {
    unlockedBadges.push('ranked_top_1000')
  }

  // Ranked Top 100
  if (rank && rank <= 100) {
    unlockedBadges.push('ranked_top_100')
  }

  // Low Latency Master: jitter < 2ms
  if (jitter < 2) {
    unlockedBadges.push('low_latency_master')
  }

  return unlockedBadges
}

/**
 * Obtiene información de un badge específico
 */
export function getBadgeInfo(badgeId: string): Badge | null {
  return BADGES[badgeId] || null
}

/**
 * Obtiene todos los badges disponibles
 */
export function getAllBadges(): Badge[] {
  return Object.values(BADGES)
}

/**
 * Calcula el score de usuario basado en badges
 */
export function calculateBadgeScore(badgeIds: string[]): number {
  const rarityScores: Record<string, number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 100
  }

  let totalScore = 0
  badgeIds.forEach(badgeId => {
    const badge = getBadgeInfo(badgeId)
    if (badge) {
      totalScore += rarityScores[badge.rarity]
    }
  })

  return totalScore
}
