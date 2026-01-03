export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
}

export interface RankingEntry {
  id: number
  rank: number
  userName: string
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  city?: string
  country?: string
  isp?: string
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  error?: string
  data?: T
}

export interface StatsData {
  total: number
  maxSpeed: number
  avgSpeed: number
}
