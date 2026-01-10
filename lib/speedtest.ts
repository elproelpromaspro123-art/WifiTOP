/**
 * SpeedTest Engine v2.1 - Professional Grade
 * - Fixed CORS issues by using local API proxy
 * - Optimized for high speed connections
 */

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
  PING_SAMPLES: 20,
  PING_WARMUP: 3,
  PARALLEL_CONNECTIONS: 6,
  DOWNLOAD_DURATION: 15000,
  UPLOAD_DURATION: 15000,
  WARMUP_DURATION: 3000,
  SAMPLE_INTERVAL: 250,
  MIN_SAMPLES: 10,
  CHUNK_SIZES: [
    100_000,      // 100KB
    500_000,      // 500KB
    1_000_000,    // 1MB
    2_000_000,    // 2MB
    5_000_000,    // 5MB
    10_000_000,   // 10MB
    25_000_000,   // 25MB
    50_000_000,   // 50MB - Added for Gigabit
    100_000_000   // 100MB - Added for 2+ Gigabit
  ],
}

// Mide latencia con alta precisión
async function measurePing(onProgress?: (ping: number) => void): Promise<{
  avg: number
  min: number
  max: number
  jitter: number
  samples: number[]
}> {
  const samples: number[] = []
  // Use local API to avoid CORS and measure latency to server
  const url = '/api/download?bytes=0'

  // Warmup - descartar primeras mediciones
  for (let i = 0; i < CONFIG.PING_WARMUP; i++) {
    try {
      await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(2000) })
    } catch {}
  }

  // Mediciones reales
  for (let i = 0; i < CONFIG.PING_SAMPLES; i++) {
    const start = performance.now()
    try {
      await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      })
      const latency = performance.now() - start

      if (latency > 0 && latency < 3000) {
        samples.push(latency)
        onProgress?.(latency)
      }
    } catch {}

    // Small delay between pings
    await new Promise(r => setTimeout(r, 50))
  }

  if (samples.length < 5) {
    throw new Error('No se pudo establecer conexión estable con el servidor')
  }

  // Ordenar y descartar outliers (percentil 10-90)
  const sorted = [...samples].sort((a, b) => a - b)
  const p10 = Math.floor(sorted.length * 0.1)
  const p90 = Math.ceil(sorted.length * 0.9)
  const trimmed = sorted.slice(p10, p90)

  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  // Calcular jitter (variación entre mediciones consecutivas)
  let jitterSum = 0
  for (let i = 1; i < trimmed.length; i++) {
    jitterSum += Math.abs(trimmed[i] - trimmed[i - 1])
  }
  const jitter = trimmed.length > 1 ? jitterSum / (trimmed.length - 1) : 0

  return { avg, min, max, jitter, samples }
}

// Selecciona el tamaño de chunk óptimo basado en la velocidad actual
function selectChunkSize(currentSpeedMbps: number): number {
  if (currentSpeedMbps < 5) return CONFIG.CHUNK_SIZES[0]
  if (currentSpeedMbps < 20) return CONFIG.CHUNK_SIZES[1]
  if (currentSpeedMbps < 50) return CONFIG.CHUNK_SIZES[2]
  if (currentSpeedMbps < 100) return CONFIG.CHUNK_SIZES[3]
  if (currentSpeedMbps < 200) return CONFIG.CHUNK_SIZES[4]
  if (currentSpeedMbps < 400) return CONFIG.CHUNK_SIZES[5]
  if (currentSpeedMbps < 800) return CONFIG.CHUNK_SIZES[6]
  if (currentSpeedMbps < 1500) return CONFIG.CHUNK_SIZES[7]
  return CONFIG.CHUNK_SIZES[8]
}

// Descarga un chunk y retorna velocidad
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

    if (duration < 0.05) return 0 // Muy rápido, no confiable

    return (buffer.byteLength * 8) / duration / 1_000_000 // Mbps
  } catch (e) {
    return 0
  }
}

// Sube un chunk y retorna velocidad
async function uploadChunk(bytes: number, signal: AbortSignal): Promise<number> {
  const start = performance.now()

  try {
    // Generar datos aleatorios (usando un buffer reutilizable si fuera posible, 
    // pero aquí generamos por request para evitar problemas de memoria en closure)
    // Para optimizar, podríamos tener un pool global, pero JS GC es bueno.
    const data = new Uint8Array(bytes)
    // Llenar con datos para evitar compresión en tránsito si hubiera
    // Aunque HTTPS ya encripta. Llenar con ceros es más rápido para CPU.
    // Cloudflare no comprime uploads binarios por defecto.
    
    // Si queremos ser rigurosos con que no sea comprimible:
    // data.fill(Math.random() * 255); // Muy lento para streams grandes.
    // Un compromiso es llenar parcialmente o usar ceros si confiamos en el link.
    // Usaremos ceros para maximizar rendimiento de CPU del cliente.
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: data,
      signal,
      headers: { 'Content-Type': 'application/octet-stream' },
    })

    if (!response.ok) throw new Error('Upload failed')

    // No hay body que leer en la respuesta
    const duration = (performance.now() - start) / 1000

    if (duration < 0.05) return 0 

    return (bytes * 8) / duration / 1_000_000 // Mbps
  } catch {
    return 0
  }
}

// Test de descarga con conexiones paralelas y chunks adaptativos
async function measureDownload(onProgress: ProgressCallback): Promise<{
  speed: number
  peak: number
  samples: number[]
}> {
  const allSamples: number[] = []
  const windowSamples: number[] = []
  let currentSpeed = 0
  let peakSpeed = 0
  let chunkSize = CONFIG.CHUNK_SIZES[2] // Empezar con 1MB

  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.DOWNLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION

  let activeConnections = 0
  const maxConnections = CONFIG.PARALLEL_CONNECTIONS

  const runConnection = async () => {
    while (performance.now() < endTime && !controller.signal.aborted) {
      activeConnections++
      const speed = await downloadChunk(chunkSize, controller.signal)
      activeConnections--

      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd

        if (!isWarmup) {
          allSamples.push(speed)
          windowSamples.push(speed)

          // Mantener ventana de últimas 20 muestras
          if (windowSamples.length > 20) windowSamples.shift()

          // Calcular velocidad actual (mediana de ventana)
          const sorted = [...windowSamples].sort((a, b) => a - b)
          currentSpeed = sorted[Math.floor(sorted.length / 2)]

          if (speed > peakSpeed) peakSpeed = speed

          // Adaptar tamaño de chunk
          chunkSize = selectChunkSize(currentSpeed)

          // Reportar progreso
          const elapsed = now - startTime
          const progress = Math.min(100, (elapsed / CONFIG.DOWNLOAD_DURATION) * 100)

          onProgress({
            phase: 'download',
            progress: 15 + progress * 0.4, // 15% a 55%
            currentSpeed,
            peakSpeed,
            samples: [...allSamples],
            status: `⬇️ ${currentSpeed.toFixed(1)} Mbps`,
          })
        }
      } else {
          // Si falla o es 0, pequeño backoff
          await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  // Lanzar conexiones paralelas
  const connections = Array(maxConnections).fill(null).map(() => runConnection())
  await Promise.all(connections)

  controller.abort()

  if (allSamples.length < CONFIG.MIN_SAMPLES) {
    // Si fallaron todas, retornar 0
    return { speed: 0, peak: 0, samples: [] }
  }

  // Calcular resultado final (mediana de percentil 25-75)
  const sorted = [...allSamples].sort((a, b) => a - b)
  const p25 = Math.floor(sorted.length * 0.25)
  const p75 = Math.ceil(sorted.length * 0.75)
  const middle = sorted.slice(p25, p75)
  const finalSpeed = middle.length > 0 ? middle.reduce((a, b) => a + b, 0) / middle.length : sorted[Math.floor(sorted.length/2)]

  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Test de subida con conexiones paralelas y chunks adaptativos
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
  // Empezar con chunk más pequeño para upload
  let chunkSize = Math.min(selectChunkSize(expectedDownload * 0.5), CONFIG.CHUNK_SIZES[4])

  const controller = new AbortController()
  const startTime = performance.now()
  const endTime = startTime + CONFIG.UPLOAD_DURATION
  const warmupEnd = startTime + CONFIG.WARMUP_DURATION

  let activeConnections = 0
  // Menos conexiones paralelas para upload (más intensivo en CPU y buffer)
  const maxConnections = Math.min(4, CONFIG.PARALLEL_CONNECTIONS)

  const runConnection = async () => {
    while (performance.now() < endTime && !controller.signal.aborted) {
      activeConnections++
      const speed = await uploadChunk(chunkSize, controller.signal)
      activeConnections--

      if (speed > 0) {
        const now = performance.now()
        const isWarmup = now < warmupEnd

        if (!isWarmup) {
          // Validar que upload no sea irrazonablemente mayor que download (excepto redes raras)
          // Relax constraint: algunas redes tienen mejor upload
          const maxReasonableUpload = Math.max(expectedDownload * 2, 5000) 
          if (speed <= maxReasonableUpload) {
            allSamples.push(speed)
            windowSamples.push(speed)

            if (windowSamples.length > 20) windowSamples.shift()

            const sorted = [...windowSamples].sort((a, b) => a - b)
            currentSpeed = sorted[Math.floor(sorted.length / 2)]

            if (speed > peakSpeed) {
              peakSpeed = speed
            }

            chunkSize = Math.min(selectChunkSize(currentSpeed), CONFIG.CHUNK_SIZES[6])

            const elapsed = now - startTime
            const progress = Math.min(100, (elapsed / CONFIG.UPLOAD_DURATION) * 100)

            onProgress({
              phase: 'upload',
              progress: 55 + progress * 0.4, // 55% a 95%
              currentSpeed,
              peakSpeed,
              samples: [...allSamples],
              status: `⬆️ ${currentSpeed.toFixed(1)} Mbps`,
            })
          }
        }
      } else {
          await new Promise(r => setTimeout(r, 100));
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
  const finalSpeed = middle.length > 0 ? middle.reduce((a, b) => a + b, 0) / middle.length : sorted[Math.floor(sorted.length/2)]

  return { speed: finalSpeed, peak: peakSpeed, samples: allSamples }
}

// Detecta el tipo de conexión basado en las características
function detectConnectionType(
  download: number,
  upload: number,
  ping: number,
  jitter: number
): { type: 'fiber' | 'cable' | 'dsl' | 'mobile' | 'unknown'; isSymmetric: boolean } {
  const ratio = upload / download
  const isSymmetric = ratio >= 0.7 && ratio <= 1.3

  // Fibra: alta velocidad, baja latencia, simétrica
  if (download > 100 && ping < 20 && isSymmetric) {
    return { type: 'fiber', isSymmetric: true }
  }

  // Fibra asimétrica o cable docsis
  if (download > 100 && ping < 30) {
    return { type: ratio < 0.3 ? 'cable' : 'fiber', isSymmetric }
  }

  // Cable: velocidad media-alta, upload limitado
  if (download > 30 && ratio < 0.5 && ping < 40) {
    return { type: 'cable', isSymmetric: false }
  }

  // DSL: velocidad baja-media, muy asimétrico
  if (download < 50 && ratio < 0.3 && ping > 15) {
    return { type: 'dsl', isSymmetric: false }
  }

  // Mobile: alta latencia, jitter alto
  if (ping > 30 || jitter > 10) {
    return { type: 'mobile', isSymmetric: false }
  }

  return { type: 'unknown', isSymmetric }
}

// Función principal del speedtest
export async function runSpeedTest(onProgress: ProgressCallback): Promise<SpeedTestResult> {
  // Fase 1: Ping
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

  // Fase 2: Download
  const downloadResult = await measureDownload(onProgress)

  onProgress({
    phase: 'download',
    progress: 55,
    currentSpeed: downloadResult.speed,
    peakSpeed: downloadResult.peak,
    samples: downloadResult.samples,
    status: `Descarga: ${downloadResult.speed.toFixed(1)} Mbps`,
  })

  // Fase 3: Upload
  const uploadResult = await measureUpload(downloadResult.speed, onProgress)

  // Calcular estabilidad
  const downloadStability = calculateStability(downloadResult.samples)
  const uploadStability = calculateStability(uploadResult.samples)
  const stability = (downloadStability + uploadStability) / 2

  // Detectar tipo de conexión
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

// Calcula estabilidad basado en la variación de las muestras
function calculateStability(samples: number[]): number {
  if (samples.length < 2) return 100

  const sorted = [...samples].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  // Avoid division by zero
  if (median === 0) return 0;

  let varianceSum = 0
  for (const sample of samples) {
    varianceSum += Math.pow((sample - median) / median, 2)
  }
  const variance = varianceSum / samples.length
  const cv = Math.sqrt(variance) * 100 // Coeficiente de variación en %

  // Convertir CV a estabilidad (menor variación = mayor estabilidad)
  return Math.max(0, Math.min(100, 100 - cv * 2))
}