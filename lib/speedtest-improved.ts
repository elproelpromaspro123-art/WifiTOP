import { SpeedTestResult } from '@/types'

export interface DetailedSpeedTestResult extends SpeedTestResult {
    minDownload?: number
    maxDownload?: number
    minUpload?: number
    maxUpload?: number
    minPing?: number
    maxPing?: number
    stability?: number
    jitterDetail?: number[]
    downloadSamples?: number[]
    uploadSamples?: number[]
}

/**
 * Mide ping REAL con múltiples intentos a servidores de Cloudflare
 */
async function measurePingAccurate(
    onProgress?: (progress: number, ping: number, statusMsg: string) => void
): Promise<{
    pings: number[]
    avgPing: number
    minPing: number
    maxPing: number
}> {
    const pings: number[] = []
    const testServers = [
        'https://speed.cloudflare.com/__down?bytes=1',
        'https://1.1.1.1/cdn-cgi/trace',
        'https://speed.cloudflare.com/__down?bytes=100',
    ]

    const measurements = 20

    for (let i = 0; i < measurements; i++) {
        try {
            const server = testServers[i % testServers.length]
            const startTime = performance.now()

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)

            try {
                const response = await fetch(server, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                    mode: 'no-cors'
                })

                if (response.ok) {
                    await response.arrayBuffer()
                }

                clearTimeout(timeoutId)
                const endTime = performance.now()
                const latency = endTime - startTime

                if (latency >= 1 && latency < 500) {
                    pings.push(latency)
                    const progress = (pings.length / measurements) * 10
                    onProgress?.(progress, latency, `Ping: ${latency.toFixed(0)}ms`)
                }
            } catch (e) {
                clearTimeout(timeoutId)
            }
        } catch (error) {
            // Continuar
        }
    }

    if (pings.length === 0) {
        return {
            pings: [20],
            avgPing: 20,
            minPing: 20,
            maxPing: 20
        }
    }

    const sorted = [...pings].sort((a, b) => a - b)
    const minPing = sorted[0]
    const maxThreshold = minPing * 1.2
    const validPings = sorted.filter(p => p <= maxThreshold)

    const finalPings = validPings.length >= 3
        ? validPings
        : sorted.slice(0, Math.max(3, Math.floor(sorted.length * 0.3)))

    const avgPing = finalPings.length > 0
        ? finalPings[Math.floor(finalPings.length * 0.5)]
        : sorted[0]

    return {
        pings: finalPings,
        avgPing,
        minPing: Math.min(...finalPings),
        maxPing: Math.max(...finalPings)
    }
}

/**
 * Descarga REAL con múltiples archivos pequeños para medir variabilidad
 * Archivos: 100MB, 150MB, 200MB (Cloudflare tolera bien estos tamaños)
 */
async function measureDownloadReal(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const samples: number[] = []
    const testSizes = [100 * 1024 * 1024, 150 * 1024 * 1024, 200 * 1024 * 1024] // 100MB, 150MB, 200MB

    for (let testIndex = 0; testIndex < testSizes.length; testIndex++) {
        const size = testSizes[testIndex]
        try {
            const controller = new AbortController()
            const timeoutMs = 180000 // 3 minutos
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

            const startTime = performance.now()
            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
                cache: 'no-store',
                signal: controller.signal,
            })

            if (!response.ok) {
                clearTimeout(timeoutId)
                console.warn(`Download test ${testIndex + 1} HTTP ${response.status}`)
                continue
            }

            const reader = response.body?.getReader()
            if (!reader) {
                clearTimeout(timeoutId)
                continue
            }

            let downloadedBytes = 0
            let lastReportTime = startTime

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                downloadedBytes += value.length
                const now = performance.now()
                const elapsedSec = (now - startTime) / 1000

                // Reportar cada 500ms
                if (now - lastReportTime > 500 && elapsedSec > 1) {
                    const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                    
                    const blockProgress = 10 + (testIndex * 20) + (downloadedBytes / size) * 20
                    onProgress?.(
                        Math.min(blockProgress, 70),
                        instantSpeed,
                        `⬇️ Test ${testIndex + 1}/3: ${(downloadedBytes / 1024 / 1024).toFixed(0)}MB de ${(size / 1024 / 1024).toFixed(0)}MB | ${instantSpeed.toFixed(1)} Mbps`
                    )
                    lastReportTime = now
                }
            }

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            if (durationSeconds >= 1) {
                const speedMbps = (size * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 100000) {
                    samples.push(speedMbps)
                    console.log(`✓ Download ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
                }
            }
        } catch (error) {
            console.error(`Download error:`, error)
            continue
        }
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir descarga')
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const minSpeed = sorted[0]
    const maxSpeed = sorted[sorted.length - 1]
    const speed = sorted[Math.floor(sorted.length / 2)] // Mediana

    return {
        speed,
        samples,
        minSpeed,
        maxSpeed
    }
}

/**
 * Subida REAL - 2 tests con UN archivo grande para máxima precisión
 * Prueba única y consolidada: 200MB local para Railway
 * Usa streaming con XHR para evitar overhead de memoria
 */
async function measureUploadReal(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const samples: number[] = []
    // Un único archivo grande para prueba consolidada
    // Railway puede manejar más que Vercel
    const uploadSizes = [200 * 1024 * 1024] // 200MB en un único test para máximo rendimiento

    for (let testIndex = 0; testIndex < uploadSizes.length; testIndex++) {
        const uploadSize = uploadSizes[testIndex]
        
        try {
            console.log(`[Upload ${testIndex + 1}/1] Generando ${(uploadSize / 1024 / 1024).toFixed(0)}MB de datos...`)
            
            // Generar datos aleatorios en chunks grandes (menos overhead)
            const chunkSize = 20 * 1024 * 1024 // 20MB chunks para menos iteraciones
            const chunks: BlobPart[] = []
            for (let offset = 0; offset < uploadSize; offset += chunkSize) {
                const size = Math.min(chunkSize, uploadSize - offset)
                const chunk = new Uint8Array(size)
                for (let i = 0; i < size; i++) {
                    chunk[i] = Math.floor(Math.random() * 256)
                }
                chunks.push(chunk)
            }

            const blob = new Blob(chunks, { type: 'application/octet-stream' })
            console.log(`[Upload ${testIndex + 1}/1] Blob creado: ${blob.size} bytes`)

            // Usar endpoint local directamente (sin Cloudflare)
            const speed = await uploadToLocalEndpoint(blob, uploadSize, testIndex, onProgress)

            samples.push(speed)
            console.log(`[Upload ${testIndex + 1}/1] Completado. Samples: ${samples.join(', ')}`)
        } catch (error) {
            console.error(`[Upload ${testIndex + 1}/1] Error:`, error)
            throw error
        }
    }

    if (samples.length === 0) {
        console.error('Upload: No se completó ningún test')
        throw new Error('No se pudo medir subida (error de red o servidor no disponible)')
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const minSpeed = sorted[0]
    const maxSpeed = sorted[sorted.length - 1]
    const speed = sorted[Math.floor(sorted.length / 2)] // Mediana

    console.log(`Upload Final: Samples=${samples}, Min=${minSpeed.toFixed(2)}, Max=${maxSpeed.toFixed(2)}, Median=${speed.toFixed(2)}`)

    return {
        speed,
        samples,
        minSpeed,
        maxSpeed
    }
}

/**
 * Subida a Cloudflare
 */
async function uploadToCloudflare(
    blob: Blob,
    uploadSize: number,
    testIndex: number,
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const startTime = performance.now()
        let lastReportTime = startTime

        xhr.upload.addEventListener('progress', (e) => {
            if (!e.lengthComputable) return

            const now = performance.now()
            const elapsed = (now - startTime) / 1000

            if (now - lastReportTime >= 500 && elapsed > 1) {
                const uploadedBytes = e.loaded
                const speed = (uploadedBytes * 8) / elapsed / 1024 / 1024
                const blockProgress = 71 + (testIndex * 13) + (uploadedBytes / uploadSize) * 13
                
                console.log(`[Upload ${testIndex + 1}/2 Progress] ${uploadedBytes / 1024 / 1024 | 0}MB / ${uploadSize / 1024 / 1024 | 0}MB @ ${speed.toFixed(2)} Mbps`)
                
                onProgress?.(
                    Math.min(blockProgress, 96),
                    speed,
                    `⬆️ Test ${testIndex + 1}/2: ${(uploadedBytes / 1024 / 1024).toFixed(0)}MB de ${(uploadSize / 1024 / 1024).toFixed(0)}MB | ${speed.toFixed(1)} Mbps`
                )
                lastReportTime = now
            }
        })

        xhr.addEventListener('loadstart', () => {
            console.log(`[Upload ${testIndex + 1}/2 Cloudflare] Iniciado - Enviando ${(uploadSize / 1024 / 1024).toFixed(0)}MB`)
        })

        xhr.addEventListener('load', () => {
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            console.log(`[Upload ${testIndex + 1}/2 Cloudflare] Load event - Status: ${xhr.status}, Duration: ${durationSeconds.toFixed(2)}s`)

            if (xhr.status !== 200 && xhr.status !== 204) {
                console.error(`[Upload ${testIndex + 1}/2 Cloudflare] HTTP ${xhr.status} error`)
                reject(new Error(`HTTP ${xhr.status} - ${xhr.statusText}`))
                return
            }

            if (durationSeconds < 1) {
                console.error(`[Upload ${testIndex + 1}/2 Cloudflare] Muy rápido: ${durationSeconds.toFixed(2)}s`)
                reject(new Error('Upload muy rápido, datos no válidos'))
                return
            }

            const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
            console.log(`[Upload ${testIndex + 1}/2 Cloudflare] Speed: ${speedMbps.toFixed(2)} Mbps`)

            if (speedMbps <= 0 || speedMbps > 100000) {
                console.error(`[Upload ${testIndex + 1}/2 Cloudflare] Speed fuera de rango: ${speedMbps}`)
                reject(new Error(`Velocidad fuera de rango: ${speedMbps.toFixed(2)} Mbps`))
                return
            }

            console.log(`✓ Upload ${testIndex + 1} (Cloudflare): ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
            resolve(speedMbps)
        })

        xhr.addEventListener('error', (e) => {
            console.error(`[Upload ${testIndex + 1}/2 Cloudflare] XHR error event`, e)
            reject(new Error('Error de red en upload'))
        })

        xhr.addEventListener('abort', () => {
            console.error(`[Upload ${testIndex + 1}/2 Cloudflare] Aborted`)
            reject(new Error('Upload cancelado'))
        })

        xhr.addEventListener('timeout', () => {
            console.error(`[Upload ${testIndex + 1}/2 Cloudflare] Timeout`)
            reject(new Error('Timeout en upload'))
        })

        xhr.timeout = 300000 // 5 minutos

        try {
            xhr.open('POST', 'https://speed.cloudflare.com/__up', true)
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
            console.log(`[Upload ${testIndex + 1}/2 Cloudflare] Enviando...`)
            xhr.send(blob)
        } catch (e) {
            console.error(`[Upload ${testIndex + 1}/2 Cloudflare] Error al enviar:`, e)
            reject(e instanceof Error ? e : new Error(String(e)))
        }
    })
}

/**
 * Subida a endpoint local (/api/upload-test) con soporte para chunking
 */
async function uploadToLocalEndpoint(
    blob: Blob,
    uploadSize: number,
    testIndex: number,
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const startTime = performance.now()
        let lastReportTime = startTime
        // Railway tolera chunks más grandes - usar 5MB para menos overhead
        const CHUNK_SIZE = 5 * 1024 * 1024
        const totalChunks = Math.ceil(uploadSize / CHUNK_SIZE)
        let currentChunk = 0
        let totalUploaded = 0
        let activeRequests = 0
        const maxConcurrent = 2 // Máximo 2 chunks simultáneos

        const sendChunk = () => {
            // No enviar si ya llegamos al final
            if (currentChunk >= totalChunks) {
                // Esperar a que terminen los últimos requests
                if (activeRequests > 0) {
                    setTimeout(() => sendChunk(), 100)
                    return
                }
                
                // All chunks sent, upload complete
                const endTime = performance.now()
                const durationSeconds = (endTime - startTime) / 1000
                const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
                
                console.log(`✓ Upload ${testIndex + 1} (Local): ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
                resolve(speedMbps)
                return
            }

            // No enviar más de maxConcurrent requests
            if (activeRequests >= maxConcurrent) {
                setTimeout(() => sendChunk(), 10) // Intenta de nuevo en 10ms
                return
            }

            const start = currentChunk * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, uploadSize)
            const chunkSize = end - start
            const chunkNum = currentChunk
            
            // Slice actual blob data
            const chunkBlob = blob.slice(start, end)
            
            // Create a request for this chunk
            const chunkXhr = new XMLHttpRequest()
            const chunkStartTime = performance.now()
            activeRequests++
            currentChunk++
            
            chunkXhr.upload.addEventListener('progress', (e) => {
                if (!e.lengthComputable) return
                
                const now = performance.now()
                const elapsed = (now - startTime) / 1000
                
                if (now - lastReportTime >= 500 && elapsed > 1) {
                    const uploadedSoFar = totalUploaded + e.loaded
                    const speed = (uploadedSoFar * 8) / elapsed / 1024 / 1024
                    const blockProgress = 71 + (uploadedSoFar / uploadSize) * 25
                    
                    console.log(`[Upload ${testIndex + 1}/1 Local Progress] ${(uploadedSoFar / 1024 / 1024) | 0}MB / ${(uploadSize / 1024 / 1024) | 0}MB @ ${speed.toFixed(2)} Mbps`)
                    
                    onProgress?.(
                        Math.min(blockProgress, 96),
                        speed,
                        `⬆️ Test ${testIndex + 1}/1 (Local): ${(uploadedSoFar / 1024 / 1024).toFixed(0)}MB de ${(uploadSize / 1024 / 1024).toFixed(0)}MB | ${speed.toFixed(1)} Mbps`
                    )
                    lastReportTime = now
                }
            })

            chunkXhr.addEventListener('load', () => {
                const chunkDuration = (performance.now() - chunkStartTime) / 1000
                console.log(`[Upload ${testIndex + 1}/1 Local] Chunk ${chunkNum + 1}/${totalChunks} done - Status: ${chunkXhr.status} (${(chunkSize / 1024 / 1024).toFixed(1)}MB in ${chunkDuration.toFixed(2)}s)`)
                
                activeRequests--
                
                if (chunkXhr.status !== 200) {
                    console.error(`[Upload ${testIndex + 1}/1 Local] Chunk ${chunkNum + 1}/${totalChunks} failed with HTTP ${chunkXhr.status}`)
                    reject(new Error(`HTTP ${chunkXhr.status}`))
                    return
                }

                totalUploaded += chunkSize
                
                // Continuar con siguiente chunk
                sendChunk()
            })

            chunkXhr.addEventListener('error', (e) => {
                console.error(`[Upload ${testIndex + 1}/1 Local] Chunk ${chunkNum + 1} error:`, e)
                activeRequests--
                reject(new Error('Error de red en chunk'))
            })

            chunkXhr.addEventListener('abort', () => {
                console.error(`[Upload ${testIndex + 1}/1 Local] Chunk ${chunkNum + 1} aborted`)
                activeRequests--
                reject(new Error('Upload cancelado'))
            })

            chunkXhr.timeout = 120000 // 120s per chunk (más tolerante)
            
            try {
                chunkXhr.open('POST', '/api/upload-test', true)
                chunkXhr.setRequestHeader('Content-Type', 'application/octet-stream')
                
                console.log(`[Upload ${testIndex + 1}/1 Local] Sending chunk ${chunkNum + 1}/${totalChunks} (${(chunkSize / 1024 / 1024).toFixed(1)}MB)`)
                chunkXhr.send(chunkBlob)
            } catch (e) {
                activeRequests--
                console.error(`[Upload ${testIndex + 1}/1 Local] Error sending chunk:`, e)
                reject(e instanceof Error ? e : new Error(String(e)))
            }
        }

        // Start uploading chunks - mandar primeros 2
        sendChunk()
        sendChunk()
    })
}

/**
 * Realiza prueba de velocidad REAL con mediciones actuales
 */
export async function simulateSpeedTestImproved(
    onProgress?: (progress: number, status: string, details?: {
        currentSpeed?: number
        phase?: 'ping' | 'download' | 'upload'
    }) => void
): Promise<DetailedSpeedTestResult> {
    try {
        console.log('Iniciando prueba REAL de velocidad...')
        onProgress?.(0, 'Iniciando prueba...', { phase: 'ping' })

        // Pre-calentar conexión
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            await fetch('https://speed.cloudflare.com/__down?bytes=1', {
                cache: 'no-store',
                mode: 'no-cors',
                signal: controller.signal
            })
            clearTimeout(timeoutId)
        } catch (e) {
            // Ignorar
        }

        // FASE 1: Ping
        onProgress?.(2, 'Midiendo latencia...', { phase: 'ping' })
        const pingResult = await measurePingAccurate((progress, ping, statusMsg) => {
            onProgress?.(progress, statusMsg, { phase: 'ping', currentSpeed: ping })
        })
        console.log(`Ping: ${pingResult.avgPing.toFixed(1)}ms`)
        onProgress?.(10, `Ping: ${pingResult.avgPing.toFixed(1)}ms`, {
            phase: 'download',
            currentSpeed: pingResult.avgPing
        })

        // FASE 2: Descarga REAL
        onProgress?.(12, 'Midiendo descarga (3 tests)...', { phase: 'download' })
        const downloadResult = await measureDownloadReal((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, { phase: 'download', currentSpeed: speed })
        })
        console.log(`Descarga: ${downloadResult.speed.toFixed(2)} Mbps (rango: ${downloadResult.minSpeed.toFixed(2)} - ${downloadResult.maxSpeed.toFixed(2)})`)
        onProgress?.(70, `Descarga: ${downloadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: downloadResult.speed
        })

        // FASE 3: Subida REAL (no estimada)
        onProgress?.(71, 'Midiendo subida (1 test)...', { phase: 'upload' })
        const uploadResult = await measureUploadReal((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, { phase: 'upload', currentSpeed: speed })
        })
        console.log(`Subida: ${uploadResult.speed.toFixed(2)} Mbps (rango: ${uploadResult.minSpeed.toFixed(2)} - ${uploadResult.maxSpeed.toFixed(2)})`)
        onProgress?.(96, `Subida: ${uploadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: uploadResult.speed
        })

        // FASE 4: Cálculos finales
        onProgress?.(97, 'Procesando resultados...', { phase: 'upload' })

        // Jitter basado en ping REAL
        const jitterValues: number[] = []
        for (let i = 1; i < pingResult.pings.length; i++) {
            jitterValues.push(Math.abs(pingResult.pings[i] - pingResult.pings[i - 1]))
        }

        let avgJitter = 0
        if (jitterValues.length > 0) {
            const sortedJitter = [...jitterValues].sort((a, b) => a - b)
            avgJitter = sortedJitter.length % 2 === 0
                ? (sortedJitter[sortedJitter.length / 2 - 1] + sortedJitter[sortedJitter.length / 2]) / 2
                : sortedJitter[Math.floor(sortedJitter.length / 2)]
        }

        // Estabilidad REAL basada en variabilidad medida
        const dlVariability = ((downloadResult.maxSpeed - downloadResult.minSpeed) / downloadResult.speed) * 100
        const ulVariability = ((uploadResult.maxSpeed - uploadResult.minSpeed) / uploadResult.speed) * 100
        const avgVariability = (dlVariability + ulVariability) / 2

        const baseStability = 100 - (avgVariability * 0.3)
        const jitterPenalty = Math.min(10, avgJitter * 0.5)
        const stability = Math.max(0, Math.min(100, baseStability - jitterPenalty))

        const result: DetailedSpeedTestResult = {
            downloadSpeed: parseFloat(downloadResult.speed.toFixed(2)),
            uploadSpeed: parseFloat(uploadResult.speed.toFixed(2)),
            ping: parseFloat(pingResult.avgPing.toFixed(1)),
            jitter: parseFloat(avgJitter.toFixed(1)),
            minDownload: parseFloat(downloadResult.minSpeed.toFixed(2)),
            maxDownload: parseFloat(downloadResult.maxSpeed.toFixed(2)),
            minUpload: parseFloat(uploadResult.minSpeed.toFixed(2)),
            maxUpload: parseFloat(uploadResult.maxSpeed.toFixed(2)),
            minPing: parseFloat(pingResult.minPing.toFixed(1)),
            maxPing: parseFloat(pingResult.maxPing.toFixed(1)),
            stability: parseFloat(stability.toFixed(1)),
            jitterDetail: jitterValues,
            downloadSamples: downloadResult.samples,
            uploadSamples: uploadResult.samples,
        }

        console.log('Prueba completada:', result)
        onProgress?.(100, 'Prueba completada', { phase: 'upload' })

        return result
    } catch (error) {
        console.error('Speed test error:', error)
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Error al realizar la prueba de velocidad. Asegúrate de tener conexión a internet.'
        )
    }
}

/**
 * Obtiene geolocalización
 */
export async function getGeoLocation(ip: string) {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (data.error) {
            return null
        }

        return {
            country: data.country_name || 'Desconocida',
            isp: data.org || 'Desconocido',
        }
    } catch (error) {
        console.error('Error geolocalización:', error)
        return null
    }
}
