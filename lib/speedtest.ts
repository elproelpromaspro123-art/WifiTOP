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
  download: '/api/speedtest/download-proxy',
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
  PARALLEL_CONNECTIONS: 8, // For concurrent download/upload streams
  DOWNLOAD_DURATION: 30000, // 30 seconds of continuous download
  UPLOAD_DURATION: 30000,   // 30 seconds of continuous upload
  WARMUP_DURATION: 3000,    // 3 seconds warmup before measurements
  MIN_SAMPLES: 2,           // Minimum samples needed for valid test
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

// Download test - single continuous 30s connection for accurate speed measurement
async function measureDownload(onProgress: ProgressCallback): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  log('DOWNLOAD', '=== Starting download test ===')
  log('DOWNLOAD', `Duration: ${CONFIG.DOWNLOAD_DURATION}ms - Single continuous connection`)
  
  const samples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let lastReportTime = 0
  const reportInterval = 1000 // Report progress every 1 second
  
  const startTime = performance.now()
  
  try {
    // Single 30-second download connection
    const url = `${INTERNAL_ENDPOINTS.download}?duration=${CONFIG.DOWNLOAD_DURATION}`
    const downloadStart = performance.now()
    
    const response = await fetch(url, {
      cache: 'no-store',
      mode: 'cors',
      signal: AbortSignal.timeout(CONFIG.DOWNLOAD_DURATION + 5000),
    })
    
    if (!response.ok) {
      log('DOWNLOAD', `Failed: HTTP ${response.status}`)
      return { speed: 0, peak: 0, samples: [] }
    }
    
    const reader = response.body?.getReader()
    if (!reader) {
      log('DOWNLOAD', 'No response body')
      return { speed: 0, peak: 0, samples: [] }
    }
    
    let totalBytes = 0
    const speedSamples: number[] = []
    const measurementStart = performance.now()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        totalBytes += value?.length || 0
        const elapsed = (performance.now() - downloadStart) / 1000
        
        // Calculate current speed every second
        if (elapsed > 0) {
          const currentSpeedMbps = (totalBytes * 8) / elapsed / 1_000_000
          
          // Report progress every 1 second
          const now = performance.now()
          if (now - lastReportTime > reportInterval) {
            speedSamples.push(currentSpeedMbps)
            currentSpeed = currentSpeedMbps
            
            if (currentSpeedMbps > peakSpeed) {
              peakSpeed = currentSpeedMbps
            }
            
            const elapsed = now - startTime
            const progress = Math.min(100, (elapsed / CONFIG.DOWNLOAD_DURATION) * 100)
            
            onProgress({
              phase: 'download',
              progress: 15 + progress * 0.4,
              currentSpeed,
              peakSpeed,
              samples: speedSamples,
              status: `⬇️ ${currentSpeed.toFixed(1)} Mbps (peak: ${peakSpeed.toFixed(1)} Mbps)`,
            })
            
            lastReportTime = now
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
    
    // Final speed calculation
    const totalDuration = (performance.now() - downloadStart) / 1000
    const finalSpeed = (totalBytes * 8) / totalDuration / 1_000_000
    
    log('DOWNLOAD', `Transferred: ${(totalBytes / 1_000_000_000).toFixed(2)}GB`)
    log('DOWNLOAD', `Duration: ${totalDuration.toFixed(2)}s`)
    log('DOWNLOAD', `=== Final: ${finalSpeed.toFixed(2)} Mbps, Peak: ${peakSpeed.toFixed(2)} Mbps ===`)
    
    return { speed: finalSpeed, peak: peakSpeed, samples: speedSamples }
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      log('DOWNLOAD', 'Download failed', e)
    }
    return { speed: 0, peak: 0, samples: [] }
  }
}

// Upload test - continuous multi-request upload for full duration
async function measureUpload(
  expectedDownload: number,
  onProgress: ProgressCallback
): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  log('UPLOAD', '=== Starting upload test ===')
  log('UPLOAD', `Duration: ${CONFIG.UPLOAD_DURATION}ms - Continuous multi-request upload`)
  
  const testStartTime = performance.now()
  const testEndTime = testStartTime + CONFIG.UPLOAD_DURATION
  
  // Generate reusable upload chunks (10MB each for balance between speed and memory)
  const chunkSize = 10 * 1024 * 1024 // 10MB per request
  const uploadChunk = new Uint8Array(chunkSize)
  
  // Fill with random data pattern
  for (let i = 0; i < chunkSize; i += 65536) {
    const smallChunk = new Uint8Array(Math.min(65536, chunkSize - i))
    crypto.getRandomValues(smallChunk)
    uploadChunk.set(smallChunk, i)
  }
  
  log('UPLOAD', `Generated ${(chunkSize / 1_000_000).toFixed(0)}MB reusable chunk`)
  
  // Track overall stats
  let totalBytesUploaded = 0
  let lastProgressTime = performance.now()
  let lastProgressBytes = 0
  const speedSamples: number[] = []
  let uploadPeak = 0
  let currentSpeed = 0
  const maxConcurrent = 4 // Run 4 parallel uploads for maximum throughput
  let testComplete = false
  
  // Function to send a single upload request
  const sendUploadRequest = (): Promise<number> => {
    return new Promise((resolve) => {
      if (testComplete || performance.now() >= testEndTime) {
        resolve(0)
        return
      }
      
      const xhr = new XMLHttpRequest()
      let requestBytes = 0
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && !testComplete) {
          const newBytes = e.loaded - requestBytes
          requestBytes = e.loaded
          totalBytesUploaded += newBytes
          
          const now = performance.now()
          const intervalTime = (now - lastProgressTime) / 1000
          
          // Update speed every 0.5 seconds
          if (intervalTime >= 0.5) {
            const intervalBytes = totalBytesUploaded - lastProgressBytes
            const intervalSpeedMbps = (intervalBytes * 8) / intervalTime / 1_000_000
            
            if (intervalSpeedMbps > 0 && intervalSpeedMbps < 10000) {
              speedSamples.push(intervalSpeedMbps)
              currentSpeed = intervalSpeedMbps
              if (intervalSpeedMbps > uploadPeak) {
                uploadPeak = intervalSpeedMbps
              }
            }
            
            const elapsed = (now - testStartTime) / 1000
            const progress = Math.min(100, (elapsed / (CONFIG.UPLOAD_DURATION / 1000)) * 100)
            
            onProgress({
              phase: 'upload',
              progress: 55 + progress * 0.45,
              currentSpeed,
              peakSpeed: uploadPeak,
              samples: speedSamples,
              status: `⬆️ ${currentSpeed.toFixed(1)} Mbps (peak: ${uploadPeak.toFixed(1)} Mbps)`,
            })
            
            lastProgressTime = now
            lastProgressBytes = totalBytesUploaded
          }
        }
      }
      
      xhr.onload = () => resolve(requestBytes)
      xhr.onerror = () => resolve(requestBytes)
      xhr.ontimeout = () => resolve(requestBytes)
      
      xhr.open('POST', INTERNAL_ENDPOINTS.upload)
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.timeout = 15000 // 15 second timeout per request
      xhr.send(uploadChunk)
    })
  }
  
  // Function to continuously send uploads until time is up
  const uploadLoop = async (): Promise<void> => {
    while (!testComplete && performance.now() < testEndTime) {
      await sendUploadRequest()
      
      // Check if we should continue
      if (performance.now() >= testEndTime) {
        break
      }
    }
  }
  
  try {
    // Start multiple parallel upload streams
    const uploadPromises: Promise<void>[] = []
    for (let i = 0; i < maxConcurrent; i++) {
      uploadPromises.push(uploadLoop())
    }
    
    // Wait for test duration, then stop
    await new Promise<void>((resolve) => {
      const checkComplete = () => {
        if (performance.now() >= testEndTime) {
          testComplete = true
          resolve()
        } else {
          setTimeout(checkComplete, 100)
        }
      }
      checkComplete()
    })
    
    // Mark test as complete to stop any ongoing uploads
    testComplete = true
    
    // Wait a bit for ongoing requests to finish reporting
    await new Promise(r => setTimeout(r, 500))
    
    // Calculate final results
    const totalElapsed = (performance.now() - testStartTime) / 1000
    
    let finalSpeed: number
    if (speedSamples.length >= 3) {
      // Use average of top 80% of samples (removes slow start)
      const sorted = [...speedSamples].sort((a, b) => b - a)
      const top80 = sorted.slice(0, Math.ceil(sorted.length * 0.8))
      finalSpeed = top80.reduce((a, b) => a + b, 0) / top80.length
    } else if (speedSamples.length > 0) {
      finalSpeed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length
    } else {
      finalSpeed = (totalBytesUploaded * 8) / totalElapsed / 1_000_000
    }
    
    log('UPLOAD', `Transferred: ${(totalBytesUploaded / 1_000_000_000).toFixed(2)}GB`)
    log('UPLOAD', `Duration: ${totalElapsed.toFixed(2)}s`)
    log('UPLOAD', `Requests completed with ${maxConcurrent} parallel streams`)
    log('UPLOAD', `=== Final: ${finalSpeed.toFixed(2)} Mbps, Peak: ${uploadPeak.toFixed(2)} Mbps ===`)
    
    return {
      speed: finalSpeed,
      peak: uploadPeak > 0 ? uploadPeak : finalSpeed,
      samples: speedSamples.length > 0 ? speedSamples : [finalSpeed]
    }
  } catch (e) {
    testComplete = true
    if ((e as Error).name !== 'AbortError') {
      log('UPLOAD', 'Upload failed', e)
    }
    return { speed: 0, peak: 0, samples: [] }
  }
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
