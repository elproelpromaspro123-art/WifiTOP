export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic'
}

export const BADGES: Record<string, Badge> = {
  speedster_extreme: { id: 'speedster_extreme', name: 'Speedster Extremo', description: 'Descarga > 500 Mbps', icon: '🔥', rarity: 'epic' },
  fiber_connection: { id: 'fiber_connection', name: 'Conexión Fibra', description: 'Ping < 5ms', icon: '⚡', rarity: 'rare' },
  super_downloader: { id: 'super_downloader', name: 'Super Descargador', description: 'Descarga > 300 Mbps', icon: '⬇️', rarity: 'rare' },
  upload_master: { id: 'upload_master', name: 'Upload Master', description: 'Subida > 100 Mbps', icon: '⬆️', rarity: 'rare' },
  gaming_beast: { id: 'gaming_beast', name: 'Gaming Beast', description: 'Ping < 10ms y Descarga > 50 Mbps', icon: '🎮', rarity: 'uncommon' },
  stability_king: { id: 'stability_king', name: 'Rey de Estabilidad', description: 'Estabilidad > 95%', icon: '👑', rarity: 'epic' },
  speed_demon: { id: 'speed_demon', name: 'Speed Demon', description: 'Descarga > 100 Mbps', icon: '👿', rarity: 'uncommon' },
  balanced: { id: 'balanced', name: 'Conexión Balanceada', description: 'Download y Upload > 50 Mbps, Ping < 30ms', icon: '⚖️', rarity: 'uncommon' },
  top_1000: { id: 'top_1000', name: 'Top 1000 Global', description: 'Posición en top 1000', icon: '🏆', rarity: 'rare' },
  top_100: { id: 'top_100', name: 'Top 100 Global', description: 'Posición en top 100', icon: '🥇', rarity: 'epic' },
  low_latency: { id: 'low_latency', name: 'Low Latency Master', description: 'Jitter < 2ms', icon: '📡', rarity: 'rare' },
}

export function unlockBadges(
  download: number,
  upload: number,
  ping: number,
  jitter: number,
  stability: number,
  rank?: number
): string[] {
  const badges: string[] = []

  if (download > 500) badges.push('speedster_extreme')
  if (ping < 5) badges.push('fiber_connection')
  if (download > 300) badges.push('super_downloader')
  if (upload > 100) badges.push('upload_master')
  if (ping < 10 && download > 50) badges.push('gaming_beast')
  if (stability > 95) badges.push('stability_king')
  if (download > 100) badges.push('speed_demon')
  if (download > 50 && upload > 50 && ping < 30) badges.push('balanced')
  if (rank && rank <= 1000) badges.push('top_1000')
  if (rank && rank <= 100) badges.push('top_100')
  if (jitter < 2) badges.push('low_latency')

  return badges
}

export function getAllBadges(): Badge[] {
  return Object.values(BADGES)
}
