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
 * Mide el ping ICMP-like usando requests muy pequeños con múltiples servidores
 */
async function measurePingAccurate(): Promise<{
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
    
    const measurements = 30 // Más mediciones para mejor precisión estadística
    
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
                
                // Consumir al menos algunos bytes para asegurar que la conexión es real
                if (response.ok) {
                    const chunk = await response.arrayBuffer()
                }
                
                clearTimeout(timeoutId)
                const endTime = performance.now()
                const latency = endTime - startTime
                
                // Filtrar requests que tardaron mucho (probablemente incluyen DNS)
                // El ping real debe estar entre 1ms y 500ms
                if (latency >= 1 && latency < 500) {
                    pings.push(latency)
                }
            } catch (e) {
                clearTimeout(timeoutId)
            }
        } catch (error) {
            // Continuar con siguiente intento
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

    // Ordenar para análisis
    const sorted = [...pings].sort((a, b) => a - b)
    
    // Usar los valores más bajos (son los más precisos sin overhead)
    // El ping real es el mínimo consistente, no el promedio
    const minPing = sorted[0]
    
    // Filtrar valores que están muy por encima del mínimo (probablemente tienen overhead)
    // Permitir solo 20% de variación sobre el mínimo
    const maxThreshold = minPing * 1.2
    const validPings = sorted.filter(p => p <= maxThreshold)
    
    // Si no tenemos suficientes valores válidos, usar los primeros 30%
    const finalPings = validPings.length >= 3 
        ? validPings 
        : sorted.slice(0, Math.max(3, Math.floor(sorted.length * 0.3)))
    
    // Usar mediana de los valores más bajos para mayor precisión
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
 * Descarga archivos de prueba con múltiples muestras para mayor precisión
 */
async function measureDownloadEnhanced(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const samples: number[] = []
    // Tamaños más grandes para mayor precisión (10MB a 100MB)
    const testSizes = [10000000, 25000000, 50000000, 75000000, 100000000]
    let totalProgress = 0

    for (let testIndex = 0; testIndex < testSizes.length; testIndex++) {
        const size = testSizes[testIndex]
        const chunkSpeeds: number[] = []

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutos max

            const startTime = performance.now()
            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
                cache: 'no-store',
                signal: controller.signal,
            })

            if (!response.ok) {
                clearTimeout(timeoutId)
                continue
            }

            const reader = response.body?.getReader()
            if (!reader) {
                clearTimeout(timeoutId)
                continue
            }

            let downloadedBytes = 0
            let lastReportTime = startTime
            const startTimeBlock = startTime
            let lastReportedBytes = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                downloadedBytes += value.length
                const now = performance.now()
                const bytesSinceReport = downloadedBytes - lastReportedBytes

                // Reportar cada 200ms o cada 5MB
                if (now - lastReportTime > 200 || bytesSinceReport > 5000000) {
                    const elapsedSec = (now - startTimeBlock) / 1000
                    if (elapsedSec > 0.2) {
                        const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                        chunkSpeeds.push(instantSpeed)

                        const blockProgress = (testIndex * (100 / testSizes.length)) +
                            (downloadedBytes / size) * (100 / testSizes.length)
                        totalProgress = Math.min(blockProgress, 80)

                        onProgress?.(
                            totalProgress,
                            instantSpeed,
                            `Descargando... Test ${testIndex + 1}/${testSizes.length} | ${instantSpeed.toFixed(1)} Mbps`
                        )
                        lastReportTime = now
                        lastReportedBytes = downloadedBytes
                    }
                }
            }

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            // Mínimo 0.5 segundos para validez
            if (durationSeconds > 0.5) {
                const speedMbps = (size * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 100000) {
                    samples.push(speedMbps)
                    console.log(`Descarga ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(size / 1024 / 1024).toFixed(0)}MB)`)
                }
            }
        } catch (error) {
            console.error(`Download measurement error (test ${testIndex + 1}):`, error)
            continue
        }
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir la velocidad de descarga')
    }

    // Calcular usando mediana para mejor robustez
    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]

    // Usar mediana en lugar de promedio para más robustez
    const avgSpeed = median

    return {
        speed: avgSpeed,
        samples: sorted,
        minSpeed: sorted[0],
        maxSpeed: sorted[sorted.length - 1]
    }
}

/**
 * Sube datos con múltiples muestras para mayor precisión
 */
async function measureUploadEnhanced(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const samples: number[] = []
    // Tamaños más grandes: 5MB a 50MB
    const uploadSizes = [5000000, 10000000, 20000000, 35000000, 50000000]
    let totalProgress = 0

    for (let testIndex = 0; testIndex < uploadSizes.length; testIndex++) {
        const uploadSize = uploadSizes[testIndex]

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutos

            // Generar datos aleatorios para evitar compresión
            const data = new Uint8Array(uploadSize)
            const view = new DataView(data.buffer)

            // Usar mejor aleatoriedad
            for (let i = 0; i < uploadSize; i += 4) {
                view.setUint32(i, Math.random() * 0x100000000)
            }
            for (let i = (uploadSize >> 2) << 2; i < uploadSize; i++) {
                data[i] = Math.floor(Math.random() * 256)
            }

            const body = new Blob([data])

            const startTime = performance.now()
            const response = await fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: body,
                cache: 'no-store',
                signal: controller.signal,
            })

            if (!response.ok) {
                clearTimeout(timeoutId)
                continue
            }

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            if (durationSeconds > 0.3) {
                const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 100000) {
                    samples.push(speedMbps)
                    totalProgress = 80 + (testIndex / uploadSizes.length) * 15
                    onProgress?.(
                        totalProgress,
                        speedMbps,
                        `Subiendo... Test ${testIndex + 1}/${uploadSizes.length} | ${speedMbps.toFixed(1)} Mbps`
                    )
                    console.log(`Subida ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(uploadSize / 1024 / 1024).toFixed(0)}MB)`)
                }
            }
        } catch (error) {
            console.error(`Upload measurement error (test ${testIndex + 1}):`, error)
            continue
        }
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir la velocidad de subida')
    }

    // Usar mediana para mejor robustez
    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]

    return {
        speed: median,
        samples: sorted,
        minSpeed: sorted[0],
        maxSpeed: sorted[sorted.length - 1]
    }
}

/**
 * Realiza prueba de velocidad completa con mediciones precisas
 */
export async function simulateSpeedTestImproved(
    onProgress?: (progress: number, status: string, details?: {
        currentSpeed?: number
        phase?: 'ping' | 'download' | 'upload'
    }) => void
): Promise<DetailedSpeedTestResult> {
    try {
        console.log('Iniciando prueba mejorada de velocidad...')
        onProgress?.(0, 'Iniciando prueba de velocidad...', { phase: 'ping' })

        // Pre-calentar conexión (establece conexión TCP antes de medir ping)
        try {
            await fetch('https://speed.cloudflare.com/__down?bytes=1', {
                cache: 'no-store',
                mode: 'no-cors'
            })
        } catch (e) {
            // Ignorar errores de pre-calentamiento
        }

        // FASE 1: Ping
        onProgress?.(5, 'Midiendo latencia (Ping)...', { phase: 'ping' })
        console.log('Midiendo ping...')
        const pingResult = await measurePingAccurate()
        console.log(`Ping: ${pingResult.avgPing.toFixed(1)}ms (min: ${pingResult.minPing.toFixed(1)}, max: ${pingResult.maxPing.toFixed(1)})`)
        onProgress?.(15, `Ping completado: ${pingResult.avgPing.toFixed(1)}ms`, {
            phase: 'ping',
            currentSpeed: pingResult.avgPing
        })

        // FASE 2: Descarga
        onProgress?.(20, 'Midiendo velocidad de descarga...', { phase: 'download' })
        console.log('Midiendo descarga...')
        const downloadResult = await measureDownloadEnhanced((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, {
                phase: 'download',
                currentSpeed: speed
            })
        })
        console.log(`Descarga: ${downloadResult.speed.toFixed(2)} Mbps (rango: ${downloadResult.minSpeed.toFixed(2)} - ${downloadResult.maxSpeed.toFixed(2)})`)
        onProgress?.(86, `Descarga completada: ${downloadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: downloadResult.speed
        })

        // FASE 3: Subida
        onProgress?.(88, 'Midiendo velocidad de subida...', { phase: 'upload' })
        console.log('Midiendo subida...')
        const uploadResult = await measureUploadEnhanced((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, {
                phase: 'upload',
                currentSpeed: speed
            })
        })
        console.log(`Subida: ${uploadResult.speed.toFixed(2)} Mbps (rango: ${uploadResult.minSpeed.toFixed(2)} - ${uploadResult.maxSpeed.toFixed(2)})`)
        onProgress?.(95, `Subida completada: ${uploadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: uploadResult.speed
        })

        // FASE 4: Cálculos finales
        onProgress?.(97, 'Procesando resultados...', { phase: 'upload' })

        // Calcular jitter (variación de latencia) usando mediana para robustez
        const jitterValues: number[] = []
        for (let i = 1; i < pingResult.pings.length; i++) {
            jitterValues.push(Math.abs(pingResult.pings[i] - pingResult.pings[i - 1]))
        }

        let avgJitter = 0
        if (jitterValues.length > 0) {
            const sortedJitter = [...jitterValues].sort((a, b) => a - b)
            // Usar mediana de jitter para mayor precisión
            avgJitter = sortedJitter.length % 2 === 0
                ? (sortedJitter[sortedJitter.length / 2 - 1] + sortedJitter[sortedJitter.length / 2]) / 2
                : sortedJitter[Math.floor(sortedJitter.length / 2)]
        }

        // Estabilidad mejorada: basada en coeficiente de variación
        const dlVariability = ((downloadResult.maxSpeed - downloadResult.minSpeed) / downloadResult.speed) * 100
        const ulVariability = ((uploadResult.maxSpeed - uploadResult.minSpeed) / uploadResult.speed) * 100
        const avgVariability = (dlVariability + ulVariability) / 2

        // Penalizar más por variabilidad alta
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
 * Obtiene información de geolocalización
 */
export async function getGeoLocation(ip: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEOIP_API_KEY
        if (!apiKey) {
            console.warn('GEOIP_API_KEY no configurada')
            return null
        }

        const response = await fetch(`https://api.ip-api.com/json/${ip}?key=${apiKey}`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (data.status !== 'success') {
            return null
        }

        return {
            city: data.city || 'Desconocida',
            country: data.country || 'Desconocida',
            isp: data.isp || 'Desconocido',
        }
    } catch (error) {
        console.error('Error getting geolocation:', error)
        return null
    }
}
