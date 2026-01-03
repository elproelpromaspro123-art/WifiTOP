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
 * Mide el ping ICMP-like usando HEAD requests múltiples para obtener mejor precisión
 */
async function measurePingAccurate(): Promise<{
    pings: number[]
    avgPing: number
    minPing: number
    maxPing: number
}> {
    const pings: number[] = []
    const testServers = [
        'https://speed.cloudflare.com/',
        'https://www.cloudflare.com/',
    ]

    const measurements = 10 // Más mediciones para mayor precisión

    for (let i = 0; i < measurements; i++) {
        try {
            const server = testServers[i % testServers.length]
            const startTime = performance.now()

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)

            await fetch(server, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
                mode: 'no-cors'
            })

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const latency = endTime - startTime

            // Filtrar valores extremos (timeout o errores)
            if (latency > 5 && latency < 5000) {
                pings.push(latency)
            }
        } catch (error) {
            // Continuar con el siguiente intento
        }
    }

    if (pings.length === 0) {
        return {
            pings: [50],
            avgPing: 50,
            minPing: 50,
            maxPing: 50
        }
    }

    // Filtrar outliers usando cuartiles
    const sorted = [...pings].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const validPings = sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)

    const avgPing = validPings.length > 0
        ? validPings.reduce((a, b) => a + b, 0) / validPings.length
        : sorted[Math.floor(sorted.length / 2)]

    return {
        pings: validPings,
        avgPing,
        minPing: Math.min(...validPings),
        maxPing: Math.max(...validPings)
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
    const testSizes = [5000000, 10000000, 15000000, 20000000, 25000000] // 5MB a 25MB
    let totalProgress = 0

    for (let testIndex = 0; testIndex < testSizes.length; testIndex++) {
        const size = testSizes[testIndex]
        const chunkSpeeds: number[] = []

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutos max

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

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                downloadedBytes += value.length
                const now = performance.now()

                // Reportar cada 100ms o cuando se descargue significante cantidad
                if (now - lastReportTime > 100 || downloadedBytes % 1000000 < value.length) {
                    const elapsedSec = (now - startTimeBlock) / 1000
                    if (elapsedSec > 0.1) {
                        const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                        chunkSpeeds.push(instantSpeed)

                        const blockProgress = (testIndex * (100 / testSizes.length)) +
                            (downloadedBytes / size) * (100 / testSizes.length)
                        totalProgress = Math.min(blockProgress, 85)

                        onProgress?.(
                            totalProgress,
                            instantSpeed,
                            `Descargando... Test ${testIndex + 1}/${testSizes.length} | ${instantSpeed.toFixed(1)} Mbps`
                        )
                        lastReportTime = now
                    }
                }
            }

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            if (durationSeconds > 0.5) {
                const speedMbps = (size * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 100000) {
                    samples.push(speedMbps)
                    console.log(`Descarga ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
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

    // Calcular estadísticas robustas
    const sorted = [...samples].sort((a, b) => a - b)
    const avgSpeed = sorted.reduce((a, b) => a + b, 0) / sorted.length

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
    const uploadSizes = [2000000, 5000000, 8000000, 10000000, 15000000] // 2MB a 15MB
    let totalProgress = 0

    for (let testIndex = 0; testIndex < uploadSizes.length; testIndex++) {
        const uploadSize = uploadSizes[testIndex]

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 180000)

            // Generar datos aleatorios para evitar compresión
            const data = new Uint8Array(uploadSize)
            for (let i = 0; i < data.length; i++) {
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

            if (durationSeconds > 0.5) {
                const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 100000) {
                    samples.push(speedMbps)
                    totalProgress = 85 + (testIndex / uploadSizes.length) * 10
                    onProgress?.(
                        totalProgress,
                        speedMbps,
                        `Subiendo... Test ${testIndex + 1}/${uploadSizes.length} | ${speedMbps.toFixed(1)} Mbps`
                    )
                    console.log(`Subida ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
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

    const sorted = [...samples].sort((a, b) => a - b)
    const avgSpeed = sorted.reduce((a, b) => a + b, 0) / sorted.length

    return {
        speed: avgSpeed,
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

        // Calcular jitter (variación de latencia)
        const jitterValues: number[] = []
        for (let i = 1; i < pingResult.pings.length; i++) {
            jitterValues.push(Math.abs(pingResult.pings[i] - pingResult.pings[i - 1]))
        }
        const avgJitter = jitterValues.length > 0
            ? jitterValues.reduce((a, b) => a + b, 0) / jitterValues.length
            : 0

        // Estabilidad basada en variabilidad real
        const downloadVariability = ((downloadResult.maxSpeed - downloadResult.minSpeed) / downloadResult.speed) * 100
        const uploadVariability = ((uploadResult.maxSpeed - uploadResult.minSpeed) / uploadResult.speed) * 100
        const stability = Math.max(0, Math.min(100, 100 - ((downloadVariability + uploadVariability) / 2) * 0.5))

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
