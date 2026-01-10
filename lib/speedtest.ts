export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  stability: number
}

async function measurePing(): Promise<{ avg: number; samples: number[] }> {
  const pings: number[] = []

  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch('/api/ping')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.latency > 0.5 && data.latency < 5000) {
          pings.push(data.latency)
        }
      }
    } catch {}
  }

  if (pings.length < 4) throw new Error('No se pudo medir ping')

  const sorted = [...pings].sort((a, b) => a - b)
  const trimmed = sorted.slice(1, -1)
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length

  return { avg, samples: pings }
}

async function measureDownload(
  onProgress?: (speed: number) => void
): Promise<number> {
  const sizes = [25_000_000, 50_000_000, 75_000_000]
  const speeds: number[] = []

  for (const size of sizes) {
    try {
      const res = await fetch(`/api/download?bytes=${size}`)
      if (res.ok) {
        const data = await res.json()
        if (data.speedMbps > 0.5) {
          speeds.push(data.speedMbps)
          onProgress?.(data.speedMbps)
        }
      }
    } catch {}
  }

  if (speeds.length === 0) throw new Error('No se pudo medir descarga')

  const sorted = [...speeds].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function measureUpload(
  onProgress?: (speed: number) => void
): Promise<number> {
  const sizes = [10_000_000, 25_000_000, 40_000_000]
  const speeds: number[] = []

  for (const size of sizes) {
    try {
      const data = new Uint8Array(size)
      for (let i = 0; i < size; i += 65536) {
        const chunkSize = Math.min(65536, size - i)
        crypto.getRandomValues(data.subarray(i, i + chunkSize))
      }
      const blob = new Blob([data])

      const res = await fetch('/api/upload', { method: 'POST', body: blob })
      if (res.ok) {
        const data = await res.json()
        if (data.speedMbps > 0.5) {
          speeds.push(data.speedMbps)
          onProgress?.(data.speedMbps)
        }
      }
    } catch {}
  }

  if (speeds.length === 0) throw new Error('No se pudo medir subida')

  const sorted = [...speeds].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export async function runSpeedTest(
  onProgress?: (progress: number, status: string, speed?: number) => void
): Promise<SpeedTestResult> {
  onProgress?.(5, 'Midiendo ping...')
  const pingData = await measurePing()
  onProgress?.(15, `Ping: ${pingData.avg.toFixed(1)}ms`)

  onProgress?.(20, 'Descargando...')
  const download = await measureDownload((speed) => {
    onProgress?.(40, `Descarga: ${speed.toFixed(1)} Mbps`, speed)
  })
  onProgress?.(60, `Descarga: ${download.toFixed(1)} Mbps`)

  onProgress?.(65, 'Subiendo...')
  const upload = await measureUpload((speed) => {
    onProgress?.(80, `Subida: ${speed.toFixed(1)} Mbps`, speed)
  })
  onProgress?.(95, `Subida: ${upload.toFixed(1)} Mbps`)

  const jitters = pingData.samples.slice(1).map((p, i) => Math.abs(p - pingData.samples[i]))
  const jitter = jitters.length > 0 ? jitters.reduce((a, b) => a + b, 0) / jitters.length : 0
  const stability = Math.max(0, Math.min(100, 100 - jitter * 3))

  onProgress?.(100, 'Completado')

  return {
    downloadSpeed: parseFloat(download.toFixed(2)),
    uploadSpeed: parseFloat(upload.toFixed(2)),
    ping: parseFloat(pingData.avg.toFixed(1)),
    jitter: parseFloat(jitter.toFixed(1)),
    stability: parseFloat(stability.toFixed(1)),
  }
}
