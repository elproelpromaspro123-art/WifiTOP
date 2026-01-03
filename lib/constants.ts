export const RANKINGS_LIMIT = 100000
export const REFRESH_INTERVAL_STATS = 60000 // 1 minuto
export const REFRESH_INTERVAL_RANKING = 30000 // 30 segundos
export const SPEEDTEST_DURATION = 5000 // 5 segundos

export const SPEED_CATEGORIES = {
  EXCELLENT: { min: 500, label: 'Excelente', emoji: '🟢' },
  VERY_GOOD: { min: 100, label: 'Muy Bueno', emoji: '🟢' },
  GOOD: { min: 50, label: 'Bueno', emoji: '🟡' },
  FAIR: { min: 20, label: 'Regular', emoji: '🟠' },
  POOR: { min: 0, label: 'Lento', emoji: '🔴' },
} as const

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'WifiTOP'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wifitop.vercel.app'
export const SITE_DESCRIPTION = 'Presume tu velocidad de WiFi - Prueba tu conexión y compite en el ranking mundial'
