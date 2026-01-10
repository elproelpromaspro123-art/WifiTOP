export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  stability: number
  connectionType: 'fiber' | 'cable' | 'dsl' | 'mobile' | 'unknown'
  isSymmetric: boolean
  peakDownload: number
  peakUpload: number
  samples: {
    download: number[]
    upload: number[]
    ping: number[]
  }
}

export interface RankingEntry {
  id: number
  rank: number
  userName: string
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  country?: string
  isp?: string
  createdAt: Date
}

export interface StatsData {
  total: number
  maxSpeed: number
  avgSpeed: number
}
