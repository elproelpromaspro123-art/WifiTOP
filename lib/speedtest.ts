/**
 * SpeedTest Engine v4.0 - Professional Grade
 * Uses Cloudflare CDN for accurate speed measurements
 * Similar to speedtest.net methodology
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

// Internal proxy endpoints to avoid CORS issues
const INTERNAL_ENDPOINTS = {
  download: '/api/speedtest/download-proxy?bytes=',
  upload: '/api/speedtest/upload-proxy',
  ping: '/api/ping',
}

// Cloudflare CDN endpoints for speed testing (fallback)
const CLOUDFLARE_ENDPOINTS = {
  download: [
    'https://speed.cloudflare.com/__down?bytes=',
    'https://cloudflare.com/cdn-cgi/trace',
  ],
  upload: 'https://speed.cloudflare.com/__up',
  ping: 'https://speed.cloudflare.com/__down?bytes=0',
}

// Alternative CDN endpoints if Cloudflare fails
const FALLBACK_ENDPOINTS = {
  download: [
    'https://proof.ovh.net/files/1Mb.dat',
    'https://speed.hetzner.de/1MB.bin',
  ],
}

const CONFIG = {
  PING_SAMPLES: 20,
  PING_WARMUP: 3,
  PARALLEL_CONNECTIONS: 8, // Increased for better utilization
  DOWNLOAD_DURATION: 30000, // Time-based measurement (30s)
  UPLOAD_DURATION: 30000,   // Time-based measurement (30s)
  WARMUP_DURATION: 3000,
  MIN_SAMPLES: 5,
  // Virtual chunk sizes - don't need to fully download/upload
  // Just need to stream for the duration specified
  // Set to 10GB to simulate large downloads without actually transferring
  DOWNLOAD_SIZES: [
    1_000_000_000,     // 1GB - warmup
    10_000_000_000,    // 10GB - main test (virtual, time-limited)
    10_000_000_000,    // 10GB 
    10_000_000_000,    // 10GB
    10_000_000_000,    // 10GB
    10_000_000_000,    // 10GB - for multi-gigabit
  ],
  UPLOAD_SIZES: [
    100_000_000,       // 100MB - warmup
    10_000_000_000,    // 10GB - main test (virtual, time-limited)
    10_000_000_000,    // 10GB
    10_000_000_000,    // 10GB
    10_000_000_000,    // 10GB
  ],
}

// Console logging helper
function log(category: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12)
  const prefix = `[SpeedTest ${timestamp}]`
  
  if (data !== undefined) {
    console.log(`${prefix} [${category}] ${message}`, data)
  } else {
    console.log(`${prefix} [${category}] ${message}`)
  }
}

// Detect connection type using Navigator API
function detectConnectionFromNavigator(): { 
  type: string
  effectiveType: string
  downlink: number
  rtt: number 
} | null {
  if (typeof window === 'undefined') return null
  
  const nav = navigator as Navigator & {
    connection?: {
      type?: string
      effectiveType?: string
      downlink?: number
      rtt?: number
    }
  }
  
  if (nav.connection) {
    const info = {
      type: nav.connection.type || 'unknown',
      effectiveType: nav.connection.effectiveType || 'unknown',
      downlink: nav.connection.downlink || 0,
      rtt: nav.connection.rtt || 0
    }
    log('CONNECTION', 'Navigator API detected', info)
    return info
  }
  
  log('CONNECTION', 'Navigator API not available')
  return null
}

// Measure ping with high precision
async function measurePing(onProgress?: (ping: number) => void): Promise<{
  avg: number
  min: number
  max: number
  jitter: number
  samples: number[]
}> {
  const samples: number[] = []
  
  log('PING', `Starting ping measurement (${CONFIG.PING_SAMPLES} samples)`)
  
  // Warmup requests
  for (let i = 0; i < CONFIG.PING_WARMUP; i++) {
    try {
      await fetch(CLOUDFLARE_ENDPOINTS.ping, { 
        cache: 'no-store',
        mode: 'cors',
        signal: AbortSignal.timeout(3000)
      })
    } catch (e) {
      log('PING', `Warmup ${i + 1} failed`, e)
    }
    await new Promise(r => setTimeout(r, 50))
  }
  
  log('PING', 'Warmup complete, starting measurements')
  
  // Real measurements
  for (let i = 0; i < CONFIG.PING_SAMPLES; i++) {
    const start = performance.now()
    try {
      const response = await fetch(CLOUDFLARE_ENDPOINTS.ping, {
        cache: 'no-store',
        mode: 'cors',
        signal: AbortSignal.timeout(5000),
      })
      
      if (response.ok) {
        const latency = performance.now() - start
        if (latency > 0 && latency < 5000) {
          samples.push(latency)
          log('PING', `Sample ${i + 1}: ${latency.toFixed(2)}ms`)
          onProgress?.(latency)
        }
      }
    } catch (e) {
      log('PING', `Sample ${i + 1} failed`, e)
    }
    await new Promise(r => setTimeout(r, 100))
  }
  
  if (samples.length < 3) {
    log('PING', 'Not enough samples, using fallback')
    // Fallback: use local server
    for (let i = 0; i < 10; i++) {
      const start = performance.now()
      try {
        await fetch('/api/download?bytes=0', { cache: 'no-store' })
        const latency = performance.now() - start
        samples.push(latency)
        onProgress?.(latency)
      } catch {}
      await new Promise(r => setTimeout(r, 50))
    }
  }
  
  if (samples.length < 3) {
    throw new Error('No se pudo medir la latencia')
  }
  
  // Sort and remove outliers
  const sorted = [...samples].sort((a, b) => a - b)
  const p10 = Math.floor(sorted.length * 0.1)
  const p90 = Math.ceil(sorted.length * 0.9)
  const trimmed = sorted.slice(p10, p90)
  
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  
  // Calculate jitter
  let jitterSum = 0
  for (let i = 1; i < trimmed.length; i++) {
    jitterSum += Math.abs(trimmed[i] - trimmed[i - 1])
  }
  const jitter = trimmed.length > 1 ? jitterSum / (trimmed.length - 1) : 0
  
  log('PING', `Results: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms, jitter=${jitter.toFixed(2)}ms`)
  
  return { avg, min, max, jitter, samples }
}

// Select optimal download size based on current speed
function selectDownloadSize(currentSpeedMbps: number): number {
  if (currentSpeedMbps < 30) return CONFIG.DOWNLOAD_SIZES[0]
  if (currentSpeedMbps < 100) return CONFIG.DOWNLOAD_SIZES[1]
  if (currentSpeedMbps < 200) return CONFIG.DOWNLOAD_SIZES[2]
  if (currentSpeedMbps < 500) return CONFIG.DOWNLOAD_SIZES[3]
  if (currentSpeedMbps < 1000) return CONFIG.DOWNLOAD_SIZES[4]
  return CONFIG.DOWNLOAD_SIZES[5]
}

// Select optimal upload size based on current speed
function selectUploadSize(currentSpeedMbps: number): number {
  if (currentSpeedMbps < 20) return CONFIG.UPLOAD_SIZES[0]
  if (currentSpeedMbps < 50) return CONFIG.UPLOAD_SIZES[1]
  if (currentSpeedMbps < 100) return CONFIG.UPLOAD_SIZES[2]
  if (currentSpeedMbps < 500) return CONFIG.UPLOAD_SIZES[3]
  return CONFIG.UPLOAD_SIZES[4]
}

// Download a chunk from internal proxy (avoids CORS)
// Uses time-based measurement, not size-based (stops after duration, not after bytes)
async function downloadChunk(bytes: number, signal: AbortSignal): Promise<number> {
  const url = `${INTERNAL_ENDPOINTS.download}${bytes}`
  const start = performance.now()
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      mode: 'cors',
      signal,
    })
    
    if (!response.ok) {
      log('DOWNLOAD', `Failed: HTTP ${response.status}`)
      return 0
    }
    
    // Read stream - will be limited by the AbortSignal timer
    const reader = response.body?.getReader()
    if (!reader) return 0
    
    let totalBytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value?.length || 0
      }
    } finally {
      reader.releaseLock()
    }
    
    const duration = (performance.now() - start) / 1000
    if (duration < 0.05) return 0
    
    const speedMbps = (totalBytes * 8) / duration / 1_000_000
    log('DOWNLOAD', `Chunk ${(bytes / 1_000_000_000).toFixed(1)}GB: ${speedMbps.toFixed(2)} Mbps in ${duration.toFixed(2)}s`)
    
    return speedMbps
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      log('DOWNLOAD', 'Chunk failed', e)
    }
    return 0
  }
}

// Upload data to internal proxy (avoids CORS from Cloudflare)
// Uses time-based streaming, not size-based (stops after duration)
async function uploadChunk(bytes: number, signal: AbortSignal): Promise<number> {
  const start = performance.now()
  
  try {
    // Create generator that produces random data in chunks
    // This avoids creating massive arrays in memory
    const chunkSize = 65536 // 64KB chunks
    let sent = 0
    
    const readable = new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          // Create 64KB of random data
          const chunk = new Uint8Array(Math.min(chunkSize, bytes - sent))
          crypto.getRandomValues(chunk)
          controller.enqueue(chunk)
          sent += chunk.length
          
          // Stop when we've sent enough or time limit reached
          if (sent >= bytes) {
            clearInterval(interval)
            controller.close()
          }
        }, 5) // Send every 5ms
      }
    })
    
    const response = await fetch(INTERNAL_ENDPOINTS.upload, {
      method: 'POST',
      body: readable,
      mode: 'cors',
      signal,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
    
    if (!response.ok) {
      log('UPLOAD', `Failed: HTTP ${response.status}`)
      return 0
    }
    
    const duration = (performance.now() - start) / 1000
    if (duration < 0.05) return 0
    
    const speedMbps = (sent * 8) / duration / 1_000_000
    log('UPLOAD', `Chunk ${(sent / 1_000_000_000).toFixed(2)}GB: ${speedMbps.toFixed(2)} Mbps in ${duration.toFixed(2)}s`)
    
    return speedMbps
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      log('UPLOAD', 'Chunk failed', e)
    }
    return 0
  }
}

// Download test with parallel connections
async function measureDownload(onProgress: ProgressCallback): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  log('DOWNLOAD', '=== Starting download test ===')
  
  const allSamples: number[] = []
  const windowSamples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let chunkSize = CONFIG.DOWNLOAD_SIZES[1] // Start with 5MB
  
  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.DOWNLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION
  
  log('DOWNLOAD', `Duration: ${CONFIG.DOWNLOAD_DURATION}ms, Parallel: ${CONFIG.PARALLEL_CONNECTIONS}`)
  
  const runConnection = async (id: number) => {
    let requestCount = 0
    
    while (performance.now() < endTime && !controller.signal.aborted) {
      requestCount++
      const speed = await downloadChunk(chunkSize, controller.signal)
      
      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd
        
        if (!isWarmup) {
          allSamples.push(speed)
          windowSamples.push(speed)
          
          if (windowSamples.length > 20) windowSamples.shift()
          
          const sorted = [...windowSamples].sort((a, b) => a - b)
          currentSpeed = sorted[Math.floor(sorted.length / 2)]
          
          if (speed > peakSpeed) peakSpeed = speed
          
          // Adapt chunk size
          chunkSize = selectDownloadSize(currentSpeed)
          
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
        } else {
          log('DOWNLOAD', `[Conn ${id}] Warmup sample: ${speed.toFixed(2)} Mbps`)
        }
      }
    }
    
    log('DOWNLOAD', `[Conn ${id}] Completed ${requestCount} requests`)
  }
  
  // Start parallel connections
  const connections = Array(CONFIG.PARALLEL_CONNECTIONS)
    .fill(null)
    .map((_, i) => runConnection(i + 1))
  
  await Promise.all(connections)
  controller.abort()
  
  log('DOWNLOAD', `Total samples: ${allSamples.length}`)
  
  if (allSamples.length < CONFIG.MIN_SAMPLES) {
    log('DOWNLOAD', 'Not enough samples!')
    return { speed: 0, peak: 0, samples: [] }
  }
  
  // Calculate final speed (median of middle 50%)
  const sorted = [...allSamples].sort((a, b) => a - b)
  const p25 = Math.floor(sorted.length * 0.25)
  const p75 = Math.ceil(sorted.length * 0.75)
  const middle = sorted.slice(p25, p75)
  const finalSpeed = middle.length > 0 
    ? middle.reduce((a, b) => a + b, 0) / middle.length 
    : sorted[Math.floor(sorted.length / 2)]
  
  log('DOWNLOAD', `=== Final: ${finalSpeed.toFixed(2)} Mbps, Peak: ${peakSpeed.toFixed(2)} Mbps ===`)
  
  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Upload test with parallel connections
async function measureUpload(
  expectedDownload: number,
  onProgress: ProgressCallback
): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  log('UPLOAD', '=== Starting upload test ===')
  
  const allSamples: number[] = []
  const windowSamples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let chunkSize = selectUploadSize(expectedDownload * 0.5)
  
  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.UPLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION
  
  log('UPLOAD', `Duration: ${CONFIG.UPLOAD_DURATION}ms, Initial chunk: ${(chunkSize / 1_000_000).toFixed(2)}MB`)
  
  const maxConnections = Math.min(4, CONFIG.PARALLEL_CONNECTIONS)
  
  const runConnection = async (id: number) => {
    let requestCount = 0
    
    while (performance.now() < endTime && !controller.signal.aborted) {
      requestCount++
      const speed = await uploadChunk(chunkSize, controller.signal)
      
      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd
        
        if (!isWarmup) {
          allSamples.push(speed)
          windowSamples.push(speed)
          
          if (windowSamples.length > 20) windowSamples.shift()
          
          const sorted = [...windowSamples].sort((a, b) => a - b)
          currentSpeed = sorted[Math.floor(sorted.length / 2)]
          
          if (speed > peakSpeed) peakSpeed = speed
          
          chunkSize = selectUploadSize(currentSpeed)
          
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
      }
    }
    
    log('UPLOAD', `[Conn ${id}] Completed ${requestCount} requests`)
  }
  
  const connections = Array(maxConnections)
    .fill(null)
    .map((_, i) => runConnection(i + 1))
  
  await Promise.all(connections)
  controller.abort()
  
  log('UPLOAD', `Total samples: ${allSamples.length}`)
  
  if (allSamples.length < CONFIG.MIN_SAMPLES) {
    log('UPLOAD', 'Not enough samples!')
    return { speed: 0, peak: 0, samples: [] }
  }
  
  const sorted = [...allSamples].sort((a, b) => a - b)
  const p25 = Math.floor(sorted.length * 0.25)
  const p75 = Math.ceil(sorted.length * 0.75)
  const middle = sorted.slice(p25, p75)
  const finalSpeed = middle.length > 0 
    ? middle.reduce((a, b) => a + b, 0) / middle.length 
    : sorted[Math.floor(sorted.length / 2)]
  
  log('UPLOAD', `=== Final: ${finalSpeed.toFixed(2)} Mbps, Peak: ${peakSpeed.toFixed(2)} Mbps ===`)
  
  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Detect connection type based on measurements
function detectConnectionType(
  download: number,
  upload: number,
  ping: number,
  jitter: number
): { type: SpeedTestResult['connectionType']; isSymmetric: boolean } {
  const ratio = download > 0 ? upload / download : 0
  const isSymmetric = ratio >= 0.6 && ratio <= 1.4
  
  log('CONNECTION', `Analyzing: DL=${download.toFixed(2)}, UL=${upload.toFixed(2)}, Ratio=${ratio.toFixed(2)}, Ping=${ping.toFixed(2)}, Jitter=${jitter.toFixed(2)}`)
  
  // Check Navigator API first
  const navInfo = detectConnectionFromNavigator()
  
  if (navInfo) {
    const navType = navInfo.type.toLowerCase()
    
    if (navType === 'ethernet') {
      log('CONNECTION', 'Detected: Ethernet (Navigator API)')
      return { type: 'ethernet', isSymmetric }
    }
    if (navType === 'wifi') {
      log('CONNECTION', 'Detected: WiFi (Navigator API)')
      return { type: 'wifi', isSymmetric }
    }
    if (navType === 'cellular' || navType.includes('g')) {
      log('CONNECTION', 'Detected: Mobile (Navigator API)')
      return { type: 'mobile', isSymmetric: false }
    }
  }
  
  // Fallback: detect based on characteristics
  
  // Fiber: high speed (>50 Mbps), low ping (<30ms), symmetric
  if (download > 50 && ping < 30 && isSymmetric) {
    log('CONNECTION', 'Detected: Fiber (high speed, low ping, symmetric)')
    return { type: 'fiber', isSymmetric: true }
  }
  
  // Fiber (asymmetric or higher ping)
  if (download > 50 && ping < 50) {
    log('CONNECTION', 'Detected: Fiber (high speed, moderate ping)')
    return { type: 'fiber', isSymmetric }
  }
  
  // Cable: medium speed, asymmetric
  if (download > 20 && ratio < 0.5 && ping < 60) {
    log('CONNECTION', 'Detected: Cable (asymmetric)')
    return { type: 'cable', isSymmetric: false }
  }
  
  // DSL: low speed, very asymmetric
  if (download < 30 && ratio < 0.3 && ping > 15) {
    log('CONNECTION', 'Detected: DSL (low speed, very asymmetric)')
    return { type: 'dsl', isSymmetric: false }
  }
  
  // Mobile: high ping or high jitter
  if (ping > 60 || jitter > 20) {
    log('CONNECTION', 'Detected: Mobile (high latency/jitter)')
    return { type: 'mobile', isSymmetric: false }
  }
  
  // WiFi: moderate characteristics
  if (download > 5 && ping < 100) {
    log('CONNECTION', 'Detected: WiFi (default)')
    return { type: 'wifi', isSymmetric }
  }
  
  log('CONNECTION', 'Detected: Unknown')
  return { type: 'unknown', isSymmetric }
}

// Calculate stability
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

// Main speedtest function
export async function runSpeedTest(onProgress: ProgressCallback): Promise<SpeedTestResult> {
  log('MAIN', '========================================')
  log('MAIN', '=== SpeedTest v4.0 Starting ===')
  log('MAIN', '========================================')
  log('MAIN', `Config: Ping=${CONFIG.PING_SAMPLES}, Download=${CONFIG.DOWNLOAD_DURATION}ms, Upload=${CONFIG.UPLOAD_DURATION}ms`)
  
  // Phase 1: Ping
  onProgress({
    phase: 'ping',
    progress: 0,
    currentSpeed: 0,
    peakSpeed: 0,
    samples: [],
    status: 'Midiendo latencia...',
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
  
  // Calculate results
  const downloadStability = calculateStability(downloadResult.samples)
  const uploadStability = calculateStability(uploadResult.samples)
  const stability = (downloadStability + uploadStability) / 2
  
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
  
  log('MAIN', '========================================')
  log('MAIN', '=== FINAL RESULTS ===')
  log('MAIN', `Download: ${result.downloadSpeed} Mbps (peak: ${result.peakDownload} Mbps)`)
  log('MAIN', `Upload: ${result.uploadSpeed} Mbps (peak: ${result.peakUpload} Mbps)`)
  log('MAIN', `Ping: ${result.ping}ms (jitter: ${result.jitter}ms)`)
  log('MAIN', `Stability: ${result.stability}%`)
  log('MAIN', `Connection: ${result.connectionType} (${result.isSymmetric ? 'symmetric' : 'asymmetric'})`)
  log('MAIN', '========================================')
  
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
