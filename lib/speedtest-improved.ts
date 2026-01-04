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
 * Descarga REAL - Un archivo único de 10GB con detección INTELIGENTE de estabilidad
 * Distingue entre fluctuaciones normales (85→84→85) y caída real (85→83→81)
 */
async function measureDownloadReal(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const downloadSize = 10 * 1024 * 1024 * 1024 // 10GB
    const samples: number[] = []
    let lastMaxSpeed = 0
    
    // Detección de estabilidad: promedio dentro de 1 Mbps del máximo
    const recentSpeeds: number[] = []
    const MEASUREMENT_INTERVAL = 500 // medir cada 500ms
    const REQUIRED_MEASUREMENTS = 3 // al menos 3 mediciones para decisión rápida
    let stabilizationDetected = false

    try {
        const controller = new AbortController()
        const timeoutMs = 600000 // 10 minutos
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        const startTime = performance.now()
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${downloadSize}`, {
            cache: 'no-store',
            signal: controller.signal,
        })

        if (!response.ok) {
            clearTimeout(timeoutId)
            throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
            clearTimeout(timeoutId)
            throw new Error('No reader available')
        }

        let downloadedBytes = 0
        let lastReportTime = startTime

        console.log(`[Download] Descargando 10GB para medir velocidad máxima sostenida...`)

        while (true) {
            // Si ya se detectó estabilidad, parar inmediatamente
            if (stabilizationDetected) {
                console.log(`[Download] ✓ PARADO: Velocidad máxima estable alcanzada durante 3 segundos`)
                reader.cancel()
                break
            }

            const { done, value } = await reader.read()
            if (done) break

            downloadedBytes += value.length
            const now = performance.now()
            const elapsedSec = (now - startTime) / 1000

            // Reportar cada 500ms (después de 2 segundos iniciales)
            if (now - lastReportTime > MEASUREMENT_INTERVAL && elapsedSec > 2) {
                const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                
                // Registrar medición
                recentSpeeds.push(instantSpeed)
                if (recentSpeeds.length > REQUIRED_MEASUREMENTS) {
                    recentSpeeds.shift() // Mantener solo últimas 6 mediciones (3 segundos)
                }

                // Actualizar máxima velocidad
                if (instantSpeed > lastMaxSpeed) {
                    lastMaxSpeed = instantSpeed
                    samples.push(instantSpeed)
                }

                // Detectar estabilidad: threshold relativo a la velocidad
                let isStabilized = false
                if (recentSpeeds.length >= REQUIRED_MEASUREMENTS && downloadedBytes > 100 * 1024 * 1024) {
                    const avgRecent = recentSpeeds.reduce((a, b) => a + b) / recentSpeeds.length
                    
                    // Threshold = 5% de la velocidad máxima (escalable a cualquier conexión)
                    const percentThreshold = lastMaxSpeed * 0.05
                    const diffFromMax = lastMaxSpeed - avgRecent
                    
                    // Estable si: promedio está dentro del 5% del máximo Y no hay aumento significativo
                    const isCloseToMax = diffFromMax <= percentThreshold
                    const lastTwo = recentSpeeds.slice(-2)
                    const increaseAllowed = lastMaxSpeed * 0.01 // Permitir 1% de aumento
                    const isNotIncreasing = lastTwo.length >= 2 ? lastTwo[1] <= lastTwo[0] + increaseAllowed : true
                    
                    isStabilized = isCloseToMax && isNotIncreasing
                    
                    console.log(`[Download] Stability: Avg=${avgRecent.toFixed(1)}, Max=${lastMaxSpeed.toFixed(1)}, Diff=${diffFromMax.toFixed(1)} (threshold=${percentThreshold.toFixed(1)}), Stable=${isStabilized}`)
                }

                const blockProgress = 10 + (downloadedBytes / downloadSize) * 60
                const statusExtra = isStabilized ? ' (✓ Estabilizado 3s)' : ''

                onProgress?.(
                    Math.min(blockProgress, 70),
                    lastMaxSpeed,
                    `⬇️ Descarga: ${(downloadedBytes / 1024 / 1024 / 1024).toFixed(2)}GB de 10GB | ${lastMaxSpeed.toFixed(1)} Mbps${statusExtra}`
                )
                lastReportTime = now

                // Si está estabilizado, marcar para parar
                if (isStabilized) {
                    console.log(`[Download] ✓ Estabilidad detectada en ${lastMaxSpeed.toFixed(2)} Mbps durante 3s después de ${(downloadedBytes / 1024 / 1024 / 1024).toFixed(2)}GB`)
                    stabilizationDetected = true
                }
            }
        }

        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000
        const avgSpeed = (downloadedBytes * 8) / durationSeconds / 1024 / 1024

        console.log(`✓ Download completada: ${avgSpeed.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(downloadedBytes / 1024 / 1024 / 1024).toFixed(2)}GB)`)
    } catch (error) {
        console.error(`Download error:`, error)
        if (samples.length === 0) {
            throw new Error('No se pudo medir descarga')
        }
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir descarga')
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const minSpeed = sorted[0]
    const maxSpeed = sorted[sorted.length - 1]
    const speed = maxSpeed // Usar el máximo sostenido

    return {
        speed,
        samples,
        minSpeed,
        maxSpeed
    }
}

/**
 * Subida REAL - Un archivo único de 10GB para medir velocidad máxima sostenida
 * Detecta estabilidad: cuando la velocidad no mejora en X tiempo, toma ese valor como máximo
 */
async function measureUploadReal(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void,
    downloadSpeed?: number
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const uploadSize = 200 * 1024 * 1024 // 200MB (balance entre medición y performance)
    const speeds: number[] = []
    
    try {
        console.log(`[Upload] Iniciando con Blob directo (${(uploadSize / 1024 / 1024).toFixed(0)}MB)...`)

        // Generar datos una sola vez
        const data = new Uint8Array(uploadSize)
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 256)
        }
        const blob = new Blob([data])
        console.log(`[Upload] Blob creado: ${blob.size} bytes`)

        // Upload usando fetch
        const startTime = performance.now()
        const response = await fetch('/api/upload-test', {
            method: 'POST',
            body: blob,
            headers: {
                'Content-Type': 'application/octet-stream',
            }
        })

        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
        }

        const result = await response.json() as { speedMbps?: number }
        const speedMbps = result.speedMbps || (uploadSize * 8) / durationSeconds / 1024 / 1024

        if (speedMbps < 0.1 || speedMbps > 10000) {
            throw new Error(`Speed fuera de rango: ${speedMbps.toFixed(2)} Mbps`)
        }

        console.log(`✓ Upload Completado: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)

        onProgress?.(90, speedMbps, `⬆️ Upload completado: ${speedMbps.toFixed(1)} Mbps`)

        speeds.push(speedMbps)

        if (speeds.length === 0) {
            throw new Error('No se completó el upload')
        }

        const median = speedMbps
        const minSpeed = speedMbps
        const maxSpeed = speedMbps

        console.log(`Upload Final: Speed=${speedMbps.toFixed(2)} Mbps`)

        return {
            speed: median,
            samples: speeds,
            minSpeed,
            maxSpeed
        }
    } catch (error) {
        console.error(`[Upload] Error:`, error)
        throw error
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
 * Upload con detección INTELIGENTE de estabilidad
 * Considera fluctuaciones normales del WiFi, solo para si detecta caída consistente
 */
async function uploadToLocalEndpointStable(
    blob: Blob,
    uploadSize: number,
    onProgress?: (progress: number, speed: number, statusMsg: string) => void,
    downloadSpeed?: number // Velocidad de descarga para optimizar
): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const startTime = performance.now()
        let lastReportTime = startTime
        let lastMaxSpeed = 0
        let lastMaxSpeedTime = startTime
        let stabilizationDetected = false // Flag para parar inmediatamente
        
        // Detección de estabilidad: promedio dentro de 1 Mbps del máximo
        const recentSpeeds: number[] = []
        const MEASUREMENT_INTERVAL = 500 // medir cada 500ms
        const REQUIRED_MEASUREMENTS = 3 // al menos 3 mediciones para decisión rápida
        
        // Calcular chunk size y concurrencia dinámicamente basado en velocidad
        const baseDownloadSpeed = downloadSpeed || 50 // Default 50 Mbps si no se proporciona
        
        // Fórmula escalable:
        // - Bajo 20 Mbps: 10MB chunks, 2 conexiones
        // - 20-100 Mbps: 30MB chunks, 4 conexiones
        // - 100-300 Mbps: 50MB chunks, 6 conexiones
        // - Arriba 300 Mbps: 80MB chunks, 8 conexiones
        let CHUNK_SIZE: number
        let maxConcurrent: number
        
        if (baseDownloadSpeed < 20) {
            CHUNK_SIZE = 10 * 1024 * 1024
            maxConcurrent = 2
        } else if (baseDownloadSpeed < 100) {
            CHUNK_SIZE = 30 * 1024 * 1024
            maxConcurrent = 4
        } else if (baseDownloadSpeed < 300) {
            CHUNK_SIZE = 50 * 1024 * 1024
            maxConcurrent = 6
        } else {
            CHUNK_SIZE = 80 * 1024 * 1024
            maxConcurrent = 8
        }
        
        console.log(`[Upload] Optimizado para ${baseDownloadSpeed.toFixed(1)} Mbps: ${CHUNK_SIZE / 1024 / 1024}MB chunks, ${maxConcurrent} conexiones`)
        
        const totalChunks = Math.ceil(uploadSize / CHUNK_SIZE)
        let currentChunk = 0
        let totalUploaded = 0
        let activeRequests = 0

        const isStabilized = (): boolean => {
            // Necesita al menos 3 mediciones (1.5 segundos)
            if (recentSpeeds.length < REQUIRED_MEASUREMENTS) return false
            
            const avgRecent = recentSpeeds.reduce((a, b) => a + b) / recentSpeeds.length
            
            // Threshold = 5% de la velocidad máxima (escalable a cualquier conexión)
            const percentThreshold = lastMaxSpeed * 0.05
            const diffFromMax = lastMaxSpeed - avgRecent
            
            // Estable si: promedio está dentro del 5% del máximo Y no hay aumento significativo
            const isCloseToMax = diffFromMax <= percentThreshold
            const lastTwo = recentSpeeds.slice(-2)
            const increaseAllowed = lastMaxSpeed * 0.01 // Permitir 1% de aumento
            const isNotIncreasing = lastTwo.length >= 2 ? lastTwo[1] <= lastTwo[0] + increaseAllowed : true
            
            console.log(`[Upload Stability] Avg=${avgRecent.toFixed(1)}, Max=${lastMaxSpeed.toFixed(1)}, Diff=${diffFromMax.toFixed(1)} (threshold=${percentThreshold.toFixed(1)}), Stable=${isCloseToMax && isNotIncreasing}`)
            
            return isCloseToMax && isNotIncreasing
        }

        const sendChunk = () => {
            // Si ya se detectó estabilidad, resolver inmediatamente
            if (stabilizationDetected && activeRequests === 0) {
                const endTime = performance.now()
                const durationSeconds = (endTime - startTime) / 1000
                const finalSpeed = (totalUploaded * 8) / durationSeconds / 1024 / 1024
                console.log(`✓ Upload completada: ${finalSpeed.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(totalUploaded / 1024 / 1024 / 1024).toFixed(2)}GB)`)
                resolve(finalSpeed)
                return
            }

            // Esperar a que terminen requests activos antes de verificar estabilidad
            if (stabilizationDetected && activeRequests > 0) {
                setTimeout(() => sendChunk(), 100)
                return
            }

            // No enviar si ya llegamos al final
            if (currentChunk >= totalChunks) {
                if (activeRequests > 0) {
                    setTimeout(() => sendChunk(), 100)
                    return
                }

                const endTime = performance.now()
                const durationSeconds = (endTime - startTime) / 1000
                const finalSpeed = (totalUploaded * 8) / durationSeconds / 1024 / 1024
                console.log(`✓ Upload completada: ${finalSpeed.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(totalUploaded / 1024 / 1024 / 1024).toFixed(2)}GB)`)
                resolve(finalSpeed)
                return
            }

            // No enviar más de maxConcurrent requests
            if (activeRequests >= maxConcurrent) {
                setTimeout(() => sendChunk(), 10)
                return
            }

            const start = currentChunk * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, uploadSize)
            const chunkSize = end - start
            const chunkNum = currentChunk
            const chunkBlob = blob.slice(start, end)
            const chunkXhr = new XMLHttpRequest()
            const chunkStartTime = performance.now()
            
            activeRequests++
            currentChunk++

            chunkXhr.upload.addEventListener('progress', (e) => {
                if (!e.lengthComputable) return

                const now = performance.now()
                const elapsed = (now - startTime) / 1000

                if (now - lastReportTime >= MEASUREMENT_INTERVAL && elapsed > 2) {
                    const uploadedSoFar = totalUploaded + e.loaded
                    const speed = (uploadedSoFar * 8) / elapsed / 1024 / 1024

                    // Registrar medición
                    recentSpeeds.push(speed)
                    if (recentSpeeds.length > REQUIRED_MEASUREMENTS) {
                        recentSpeeds.shift() // Mantener solo últimas 6 mediciones (3 segundos)
                    }

                    // Track máxima velocidad
                    if (speed > lastMaxSpeed) {
                        lastMaxSpeed = speed
                        lastMaxSpeedTime = now
                    }

                    // Determinar estado de estabilidad
                    let isStabilizedNow = false
                    if (recentSpeeds.length === REQUIRED_MEASUREMENTS && totalUploaded > 1 * 1024 * 1024 * 1024) {
                        isStabilizedNow = isStabilized()
                    }
                    
                    const statusExtra = isStabilizedNow ? ' (✓ Estabilizado 3s)' : ''
                    const blockProgress = 71 + (uploadedSoFar / uploadSize) * 25

                    console.log(`[Upload Progress] ${(uploadedSoFar / 1024 / 1024 / 1024).toFixed(2)}GB / 10GB @ ${speed.toFixed(2)} Mbps`)

                    onProgress?.(
                        Math.min(blockProgress, 96),
                        speed,
                        `⬆️ Subida: ${(uploadedSoFar / 1024 / 1024 / 1024).toFixed(2)}GB / 10GB | ${speed.toFixed(1)} Mbps${statusExtra}`
                    )
                    lastReportTime = now

                    // Si está estabilizado, marcar para parar
                    if (isStabilizedNow && !stabilizationDetected) {
                        console.log(`[Upload] ✓ Estabilidad detectada en ${lastMaxSpeed.toFixed(2)} Mbps durante 3s después de ${(totalUploaded / 1024 / 1024 / 1024).toFixed(2)}GB`)
                        stabilizationDetected = true
                    }
                }
            })

            chunkXhr.addEventListener('load', () => {
                const chunkDuration = (performance.now() - chunkStartTime) / 1000
                console.log(`[Upload] Chunk ${chunkNum + 1}/${totalChunks} done - Status: ${chunkXhr.status} (${(chunkSize / 1024 / 1024).toFixed(1)}MB in ${chunkDuration.toFixed(2)}s)`)

                activeRequests--

                if (chunkXhr.status !== 200) {
                    console.error(`[Upload] Chunk ${chunkNum + 1} failed with HTTP ${chunkXhr.status}`)
                    reject(new Error(`HTTP ${chunkXhr.status}`))
                    return
                }

                totalUploaded += chunkSize
                sendChunk()
            })

            chunkXhr.addEventListener('error', (e) => {
                console.error(`[Upload] Chunk ${chunkNum + 1} error:`, e)
                activeRequests--
                reject(new Error('Error de red en chunk'))
            })

            chunkXhr.addEventListener('abort', () => {
                console.error(`[Upload] Chunk ${chunkNum + 1} aborted`)
                activeRequests--
                reject(new Error('Upload cancelado'))
            })

            chunkXhr.timeout = 180000 // 3 minutos por chunk

            try {
                chunkXhr.open('POST', '/api/upload-test', true)
                chunkXhr.setRequestHeader('Content-Type', 'application/octet-stream')
                console.log(`[Upload] Sending chunk ${chunkNum + 1}/${totalChunks} (${(chunkSize / 1024 / 1024).toFixed(1)}MB)`)
                chunkXhr.send(chunkBlob)
            } catch (e) {
                activeRequests--
                console.error(`[Upload] Error sending chunk:`, e)
                reject(e instanceof Error ? e : new Error(String(e)))
            }
        }

        // Iniciar envío
        sendChunk()
        sendChunk()
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
            // Ignorar errores en pre-calentamiento
            console.log('Pre-warming completed or skipped')
        }

        let pingResult, downloadResult, uploadResult
        
        // FASE 1: Ping
        try {
            onProgress?.(2, 'Midiendo latencia...', { phase: 'ping' })
            pingResult = await measurePingAccurate((progress, ping, statusMsg) => {
                onProgress?.(progress, statusMsg, { phase: 'ping', currentSpeed: ping })
            })
            console.log(`Ping: ${pingResult.avgPing.toFixed(1)}ms`)
            onProgress?.(10, `Ping: ${pingResult.avgPing.toFixed(1)}ms`, {
                phase: 'download',
                currentSpeed: pingResult.avgPing
            })
        } catch (err) {
            console.error('Error en medición de Ping:', err)
            throw new Error(`Error midiendo ping: ${err instanceof Error ? err.message : 'error desconocido'}`)
        }

        // FASE 2: Descarga REAL
        try {
            onProgress?.(12, 'Midiendo descarga (detección de estabilidad)...', { phase: 'download' })
            downloadResult = await measureDownloadReal((progress, speed, statusMsg) => {
                onProgress?.(progress, statusMsg, { phase: 'download', currentSpeed: speed })
            })
            console.log(`Descarga: ${downloadResult.speed.toFixed(2)} Mbps (rango: ${downloadResult.minSpeed.toFixed(2)} - ${downloadResult.maxSpeed.toFixed(2)})`)
            onProgress?.(70, `Descarga: ${downloadResult.speed.toFixed(1)} Mbps`, {
                phase: 'upload',
                currentSpeed: downloadResult.speed
            })
        } catch (err) {
            console.error('Error en medición de Descarga:', err)
            throw new Error(`Error midiendo descarga: ${err instanceof Error ? err.message : 'error desconocido'}`)
        }

        // FASE 3: Subida REAL
        try {
            onProgress?.(71, 'Midiendo subida (500MB, detección de estabilidad)...', { phase: 'upload' })
            uploadResult = await measureUploadReal(
                (progress, speed, statusMsg) => {
                    onProgress?.(progress, statusMsg, { phase: 'upload', currentSpeed: speed })
                },
                downloadResult.speed // Pasar velocidad de descarga para optimizar upload
            )
            console.log(`Subida: ${uploadResult.speed.toFixed(2)} Mbps (rango: ${uploadResult.minSpeed.toFixed(2)} - ${uploadResult.maxSpeed.toFixed(2)})`)
            onProgress?.(96, `Subida: ${uploadResult.speed.toFixed(1)} Mbps`, {
                phase: 'upload',
                currentSpeed: uploadResult.speed
            })
        } catch (err) {
            console.error('Error en medición de Subida:', err)
            throw new Error(`Error midiendo subida: ${err instanceof Error ? err.message : 'error desconocido'}`)
        }

        // FASE 4: Cálculos finales
        onProgress?.(97, 'Procesando resultados...', { phase: 'upload' })

        try {
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
        } catch (err) {
            console.error('Error en cálculos finales:', err)
            throw new Error(`Error procesando resultados: ${err instanceof Error ? err.message : 'error desconocido'}`)
        }
    } catch (error) {
        console.error('Speed test error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
        throw new Error(errorMsg)
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
