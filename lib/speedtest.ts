/**
 * SpeedTest Engine v3.0 - Professional Grade
 * - Fixed connection type detection using Navigator API
 * - Removed artificial speed limits
 * - Improved ping measurement accuracy
 * - Better symmetry detection
 */

export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  stability: number
  connectionType: 'fiber' | 'cable' | 'dsl' | 'mobile' | 'wifi' | 'ethernet' | 'unknown'
  isSymmetric: boolean
  peakDownload: number
  peakUpload: number
  samples: {
    download: number[]
    upload: number[]
    ping: number[]
  }
}

export interface SpeedTestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete'
  progress: number
  currentSpeed: number
  peakSpeed: number
  samples: number[]
  status: string
}

type ProgressCallback = (progress: SpeedTestProgress) => void

const CONFIG = {
  PING_SAMPLES: 25,
  PING_WARMUP: 5,
  PARALLEL_CONNECTIONS: 8,
  DOWNLOAD_DURATION: 20000,
  UPLOAD_DURATION: 20000,
  WARMUP_DURATION: 3000,
  SAMPLE_INTERVAL: 200,
  MIN_SAMPLES: 8,
  CHUNK_SIZES: [
    256_000,      // 256KB
    512_000,      // 512KB  
    1_000_000,    // 1MB
    2_000_000,    // 2MB
    4_000_000,    // 4MB
    8_000_000,    // 8MB
    16_000_000,   // 16MB
    32_000_000,   // 32MB
    64_000_000,   // 64MB
    128_000_000,  // 128MB - For Gigabit+
  ],
}

// Detect connection type using Navigator API (browser-side)
function detectConnectionFromNavigator(): { type: string; effectiveType: string; downlink: number } | null {
  if (typeof window === 'undefined') return null
  
  const nav = navigator as Navigator & {
    connection?: {
      type?: string
      effectiveType?: string
      downlink?: number
    }
  }
  
  if (nav.connection) {
    return {
      type: nav.connection.type || 'unknown',
      effectiveType: nav.connection.effectiveType || 'unknown',
      downlink: nav.connection.downlink || 0
    }
  }
  
  return null
}

// Measure latency with high precision - optimized for accuracy
async function measurePing(onProgress?: (ping: number) => void): Promise<{
  avg: number
  min: number
  max: number
  jitter: number
  samples: number[]
}> {
  const samples: number[] = []
  const url = '/api/download?bytes=1'

  // Warmup - discard first measurements (TCP/TLS handshake)
  for (let i = 0; i < CONFIG.PING_WARMUP; i++) {
    try {
      await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(2000) })
    } catch {}
    await new Promise(r => setTimeout(r, 20))
  }

  // Real measurements
  for (let i = 0; i < CONFIG.PING_SAMPLES; i++) {
    const start = performance.now()
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      })
      await response.arrayBuffer()
      const latency = performance.now() - start

      if (latency > 0 && latency < 3000) {
        samples.push(latency)
        onProgress?.(latency)
      }
    } catch {}

    await new Promise(r => setTimeout(r, 30))
  }

  if (samples.length < 5) {
    throw new Error('No se pudo establecer conexión estable con el servidor')
  }

  // Sort and trim outliers (percentile 15-85 for better accuracy)
  const sorted = [...samples].sort((a, b) => a - b)
  const p15 = Math.floor(sorted.length * 0.15)
  const p85 = Math.ceil(sorted.length * 0.85)
  const trimmed = sorted.slice(p15, p85)

  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  // Calculate jitter
  let jitterSum = 0
  for (let i = 1; i < trimmed.length; i++) {
    jitterSum += Math.abs(trimmed[i] - trimmed[i - 1])
  }
  const jitter = trimmed.length > 1 ? jitterSum / (trimmed.length - 1) : 0

  return { avg, min, max, jitter, samples }
}

// Select optimal chunk size based on current speed - NO artificial limits
function selectChunkSize(currentSpeedMbps: number): number {
  if (currentSpeedMbps < 10) return CONFIG.CHUNK_SIZES[0]
  if (currentSpeedMbps < 25) return CONFIG.CHUNK_SIZES[1]
  if (currentSpeedMbps < 50) return CONFIG.CHUNK_SIZES[2]
  if (currentSpeedMbps < 100) return CONFIG.CHUNK_SIZES[3]
  if (currentSpeedMbps < 200) return CONFIG.CHUNK_SIZES[4]
  if (currentSpeedMbps < 400) return CONFIG.CHUNK_SIZES[5]
  if (currentSpeedMbps < 600) return CONFIG.CHUNK_SIZES[6]
  if (currentSpeedMbps < 1000) return CONFIG.CHUNK_SIZES[7]
  if (currentSpeedMbps < 2000) return CONFIG.CHUNK_SIZES[8]
  return CONFIG.CHUNK_SIZES[9]
}

// Download chunk and return speed
async function downloadChunk(bytes: number, signal: AbortSignal): Promise<number> {
  const start = performance.now()

  try {
    const response = await fetch(`/api/download?bytes=${bytes}`, {
      cache: 'no-store',
      signal,
    })

    if (!response.ok) throw new Error('Download failed')

    const buffer = await response.arrayBuffer()
    const duration = (performance.now() - start) / 1000

    if (duration < 0.01) return 0

    return (buffer.byteLength * 8) / duration / 1_000_000
  } catch {
    return 0
  }
}

// Upload chunk and return speed
async function uploadChunk(bytes: number, signal: AbortSignal): Promise<number> {
  const start = performance.now()

  try {
    const data = new Uint8Array(bytes)
    // Fill with random-ish pattern to prevent compression
    for (let i = 0; i < Math.min(bytes, 1000); i++) {
      data[i] = (i * 7) % 256
    }
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: data,
      signal,
      headers: { 'Content-Type': 'application/octet-stream' },
    })

    if (!response.ok) throw new Error('Upload failed')

    const duration = (performance.now() - start) / 1000

    if (duration < 0.01) return 0

    return (bytes * 8) / duration / 1_000_000
  } catch {
    return 0
  }
}

// Download test with parallel connections and adaptive chunks - NO limits
async function measureDownload(onProgress: ProgressCallback): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  const allSamples: number[] = []
  const windowSamples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let chunkSize = CONFIG.CHUNK_SIZES[3] // Start with 2MB

  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.DOWNLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION

  const maxConnections = CONFIG.PARALLEL_CONNECTIONS

  const runConnection = async () => {
    while (performance.now() < endTime && !controller.signal.aborted) {
      const speed = await downloadChunk(chunkSize, controller.signal)

      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd

        if (!isWarmup) {
          allSamples.push(speed)
          windowSamples.push(speed)

          if (windowSamples.length > 30) windowSamples.shift()

          const sorted = [...windowSamples].sort((a, b) => a - b)
          currentSpeed = sorted[Math.floor(sorted.length / 2)]

          if (speed > peakSpeed) peakSpeed = speed

          // Adapt chunk size dynamically - no artificial cap
          chunkSize = selectChunkSize(currentSpeed)

          const elapsed = now - startTime
          const progress = Math.min(100, (elapsed / CONFIG.DOWNLOAD_DURATION) * 100)

          onProgress({
            phase: 'download',
            progress: 15 + progress * 0.4,
            currentSpeed,
            peakSpeed,
            samples: [...allSamples],
            status: `⬇️ ${currentSpeed.toFixed(1)} Mbps`,
          })
        }
      } else {
        await new Promise(r => setTimeout(r, 50))
      }
    }
  }

  const connections = Array(maxConnections).fill(null).map(() => runConnection())
  await Promise.all(connections)

  controller.abort()

  if (allSamples.length < CONFIG.MIN_SAMPLES) {
    return { speed: 0, peak: 0, samples: [] }
  }

  const sorted = [...allSamples].sort((a, b) => a - b)
  const p25 = Math.floor(sorted.length * 0.25)
  const p75 = Math.ceil(sorted.length * 0.75)
  const middle = sorted.slice(p25, p75)
  const finalSpeed = middle.length > 0 ? middle.reduce((a, b) => a + b, 0) / middle.length : sorted[Math.floor(sorted.length / 2)]

  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Upload test - NO artificial limits
async function measureUpload(
  expectedDownload: number,
  onProgress: ProgressCallback
): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  const allSamples: number[] = []
  const windowSamples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let chunkSize = selectChunkSize(expectedDownload * 0.3)

  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.UPLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION

  // More parallel connections for upload too
  const maxConnections = Math.min(6, CONFIG.PARALLEL_CONNECTIONS)

  const runConnection = async () => {
    while (performance.now() < endTime && !controller.signal.aborted) {
      const speed = await uploadChunk(chunkSize, controller.signal)

      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd

        if (!isWarmup) {
          // NO artificial limit on upload speed
          allSamples.push(speed)
          windowSamples.push(speed)

          if (windowSamples.length > 30) windowSamples.shift()

          const sorted = [...windowSamples].sort((a, b) => a - b)
          currentSpeed = sorted[Math.floor(sorted.length / 2)]

          if (speed > peakSpeed) {
            peakSpeed = speed
          }

          // Adapt chunk size - no artificial cap
          chunkSize = selectChunkSize(currentSpeed)

          const elapsed = now - startTime
          const progress = Math.min(100, (elapsed / CONFIG.UPLOAD_DURATION) * 100)

          onProgress({
            phase: 'upload',
            progress: 55 + progress * 0.4,
            currentSpeed,
            peakSpeed,
            samples: [...allSamples],
            status: `⬆️ ${currentSpeed.toFixed(1)} Mbps`,
          })
        }
      } else {
        await new Promise(r => setTimeout(r, 50))
      }
    }
  }

  const connections = Array(maxConnections).fill(null).map(() => runConnection())
  await Promise.all(connections)

  controller.abort()

  if (allSamples.length < CONFIG.MIN_SAMPLES) {
    return { speed: 0, peak: 0, samples: [] }
  }

  const sorted = [...allSamples].sort((a, b) => a - b)
  const p25 = Math.floor(sorted.length * 0.25)
  const p75 = Math.ceil(sorted.length * 0.75)
  const middle = sorted.slice(p25, p75)
  const finalSpeed = middle.length > 0 ? middle.reduce((a, b) => a + b, 0) / middle.length : sorted[Math.floor(sorted.length / 2)]

  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Improved connection type detection
function detectConnectionType(
  download: number,
  upload: number,
  ping: number,
  jitter: number
): { type: SpeedTestResult['connectionType']; isSymmetric: boolean } {
  const ratio = upload / download
  // More relaxed symmetric detection: 60% to 140% is considered symmetric
  const isSymmetric = ratio >= 0.6 && ratio <= 1.4

  // First, check Navigator API for connection type
  const navInfo = detectConnectionFromNavigator()
  
  if (navInfo) {
    // Navigator API detected connection type
    const navType = navInfo.type.toLowerCase()
    
    if (navType === 'ethernet') {
      return { type: 'ethernet', isSymmetric }
    }
    if (navType === 'wifi') {
      return { type: 'wifi', isSymmetric }
    }
    if (navType === 'cellular' || navType === '4g' || navType === '3g' || navType === '2g') {
      return { type: 'mobile', isSymmetric: false }
    }
  }

  // Fallback: Detect based on speed/ping characteristics
  
  // Fiber: high speed, low latency, typically symmetric
  if (download > 80 && ping < 30 && isSymmetric) {
    return { type: 'fiber', isSymmetric: true }
  }

  // Fiber (even if asymmetric reporting due to test limitations)
  if (download > 80 && ping < 40) {
    return { type: 'fiber', isSymmetric }
  }

  // High speed with low ping - likely ethernet/fiber
  if (download > 50 && ping < 50) {
    return { type: isSymmetric ? 'fiber' : 'cable', isSymmetric }
  }

  // Cable: medium-high speed, upload limited
  if (download > 20 && ratio < 0.4 && ping < 60) {
    return { type: 'cable', isSymmetric: false }
  }

  // DSL: low-medium speed, very asymmetric, higher ping
  if (download < 30 && ratio < 0.25 && ping > 20) {
    return { type: 'dsl', isSymmetric: false }
  }

  // Mobile: high latency (>80ms) or high jitter (>15ms)
  if (ping > 80 || jitter > 15) {
    return { type: 'mobile', isSymmetric: false }
  }

  // WiFi: moderate characteristics
  if (download > 10 && ping < 80 && jitter < 15) {
    return { type: 'wifi', isSymmetric }
  }

  return { type: 'unknown', isSymmetric }
}

// Main speedtest function
export async function runSpeedTest(onProgress: ProgressCallback): Promise<SpeedTestResult> {
  // Phase 1: Ping
  onProgress({
    phase: 'ping',
    progress: 0,
    currentSpeed: 0,
    peakSpeed: 0,
    samples: [],
    status: 'Conectando...',
  })

  const pingResult = await measurePing((ping) => {
    onProgress({
      phase: 'ping',
      progress: 10,
      currentSpeed: ping,
      peakSpeed: 0,
      samples: [],
      status: `Ping: ${ping.toFixed(0)}ms`,
    })
  })

  onProgress({
    phase: 'ping',
    progress: 15,
    currentSpeed: pingResult.avg,
    peakSpeed: 0,
    samples: pingResult.samples,
    status: `Ping: ${pingResult.avg.toFixed(1)}ms`,
  })

  // Phase 2: Download
  const downloadResult = await measureDownload(onProgress)

  onProgress({
    phase: 'download',
    progress: 55,
    currentSpeed: downloadResult.speed,
    peakSpeed: downloadResult.peak,
    samples: downloadResult.samples,
    status: `Descarga: ${downloadResult.speed.toFixed(1)} Mbps`,
  })

  // Phase 3: Upload
  const uploadResult = await measureUpload(downloadResult.speed, onProgress)

  // Calculate stability
  const downloadStability = calculateStability(downloadResult.samples)
  const uploadStability = calculateStability(uploadResult.samples)
  const stability = (downloadStability + uploadStability) / 2

  // Detect connection type
  const connection = detectConnectionType(
    downloadResult.speed,
    uploadResult.speed,
    pingResult.avg,
    pingResult.jitter
  )

  const result: SpeedTestResult = {
    downloadSpeed: Math.round(downloadResult.speed * 100) / 100,
    uploadSpeed: Math.round(uploadResult.speed * 100) / 100,
    ping: Math.round(pingResult.avg * 10) / 10,
    jitter: Math.round(pingResult.jitter * 10) / 10,
    stability: Math.round(stability),
    connectionType: connection.type,
    isSymmetric: connection.isSymmetric,
    peakDownload: Math.round(downloadResult.peak * 100) / 100,
    peakUpload: Math.round(uploadResult.peak * 100) / 100,
    samples: {
      download: downloadResult.samples,
      upload: uploadResult.samples,
      ping: pingResult.samples,
    },
  }

  onProgress({
    phase: 'complete',
    progress: 100,
    currentSpeed: 0,
    peakSpeed: 0,
    samples: [],
    status: 'Completado',
  })

  return result
}

// Calculate stability based on sample variation
function calculateStability(samples: number[]): number {
  if (samples.length < 2) return 100

  const sorted = [...samples].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  if (median === 0) return 0

  let varianceSum = 0
  for (const sample of samples) {
    varianceSum += Math.pow((sample - median) / median, 2)
  }
  const variance = varianceSum / samples.length
  const cv = Math.sqrt(variance) * 100

  return Math.max(0, Math.min(100, 100 - cv * 2))
}
