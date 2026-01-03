import { SPEED_CATEGORIES } from './constants'

export function getSpeedCategory(speed: number) {
  if (speed >= SPEED_CATEGORIES.EXCELLENT.min) return SPEED_CATEGORIES.EXCELLENT
  if (speed >= SPEED_CATEGORIES.VERY_GOOD.min) return SPEED_CATEGORIES.VERY_GOOD
  if (speed >= SPEED_CATEGORIES.GOOD.min) return SPEED_CATEGORIES.GOOD
  if (speed >= SPEED_CATEGORIES.FAIR.min) return SPEED_CATEGORIES.FAIR
  return SPEED_CATEGORIES.POOR
}

export function formatSpeed(speed: number, decimals: number = 2): string {
  return speed.toFixed(decimals)
}

export function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function getSpeedColor(speed: number): string {
  const category = getSpeedCategory(speed)
  switch (category) {
    case SPEED_CATEGORIES.EXCELLENT:
    case SPEED_CATEGORIES.VERY_GOOD:
      return 'text-green-400'
    case SPEED_CATEGORIES.GOOD:
      return 'text-blue-400'
    case SPEED_CATEGORIES.FAIR:
      return 'text-yellow-400'
    case SPEED_CATEGORIES.POOR:
    default:
      return 'text-red-400'
  }
}
