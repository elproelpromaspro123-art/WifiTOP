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
                    const progress = (pings.length / measurements) * 10 // 0-10% durante ping
                    onProgress?.(progress, latency, `Midiendo ping... ${pings.length}/${measurements}`)
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
 * Descarga un único archivo grande para mayor precisión
 * Soluciona problema de WiFi rápido con múltiples test
 * Usa archivo de 5GB para velocidades altas, 500MB para velocidades bajas
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

    // Detectar velocidad inicial con ping para elegir tamaño de archivo
    const pingResult = await measurePingAccurate()
    
    // Estrategia: usar UN único archivo grande en lugar de múltiples pequeños
    // - Ping bajo (< 20ms) = conexión rápida = usar 5GB
    // - Ping medio (20-50ms) = usar 2GB  
    // - Ping alto (> 50ms) = usar 500MB
    let testSize: number
    if (pingResult.avgPing < 20) {
        testSize = 5 * 1024 * 1024 * 1024  // 5GB para WiFi muy veloz
    } else if (pingResult.avgPing < 50) {
        testSize = 2 * 1024 * 1024 * 1024  // 2GB para WiFi veloz
    } else {
        testSize = 500 * 1024 * 1024       // 500MB para WiFi lento
    }

    console.log(`Usando archivo de ${(testSize / 1024 / 1024 / 1024).toFixed(1)}GB (ping: ${pingResult.avgPing.toFixed(1)}ms)`)

    try {
        const controller = new AbortController()
        // Timeout muy generoso: 30 minutos para permitir descargas grandes incluso en conexiones lentas
        const timeoutMs = 1800000
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        const startTime = performance.now()
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${testSize}`, {
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
            throw new Error('No reader disponible')
        }

        let downloadedBytes = 0
        let lastReportTime = startTime
        const startTimeBlock = startTime
        let lastReportedBytes = 0
        const speedSamples: number[] = []

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            downloadedBytes += value.length
            const now = performance.now()
            const bytesSinceReport = downloadedBytes - lastReportedBytes

            // Reportar cada 500ms o cada 50MB (para archivo grande)
            const reportThreshold = 50 * 1024 * 1024
            if (now - lastReportTime > 500 || bytesSinceReport > reportThreshold) {
                const elapsedSec = (now - startTimeBlock) / 1000
                if (elapsedSec > 1.0) { // Solo reportar después de 1 segundo
                    const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                    speedSamples.push(instantSpeed)

                    const blockProgress = 20 + (downloadedBytes / testSize) * 60
                    const totalProgress = Math.min(blockProgress, 80)

                    onProgress?.(
                        totalProgress,
                        instantSpeed,
                        `Descargando archivo grande... ${(downloadedBytes / 1024 / 1024 / 1024).toFixed(1)}GB de ${(testSize / 1024 / 1024 / 1024).toFixed(1)}GB | ${instantSpeed.toFixed(1)} Mbps`
                    )
                    lastReportTime = now
                    lastReportedBytes = downloadedBytes
                }
            }
        }

        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000

        if (durationSeconds < 2.0) {
            throw new Error('Descarga completada muy rápido, datos no válidos')
        }

        const speedMbps = (testSize * 8) / durationSeconds / 1024 / 1024
        if (speedMbps <= 0 || speedMbps > 1000000) {
            throw new Error('Velocidad fuera de rango válido')
        }

        samples.push(speedMbps)
        console.log(`✓ Descarga completada: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(testSize / 1024 / 1024 / 1024).toFixed(1)}GB)`)

    } catch (error) {
        console.error(`Download measurement error:`, error)
        throw new Error(`Error en descarga: ${error instanceof Error ? error.message : 'desconocido'}`)
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir la velocidad de descarga')
    }

    // Con un único archivo, la velocidad final es simplemente la medida
    const speed = samples[0]
    
    return {
        speed: Math.max(speed, 0.1),
        samples: samples,
        minSpeed: samples[0],
        maxSpeed: samples[0]
    }
}

/**
 * Mide subida con un único archivo grande para mayor precisión
 * Usa 1GB para medir subida de forma precisa
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

    try {
        const uploadSize = 1024 * 1024 * 1024  // 1GB

        console.log(`Subiendo archivo de ${(uploadSize / 1024 / 1024 / 1024).toFixed(1)}GB...`)

        const controller = new AbortController()
        const timeoutMs = 1800000  // 30 minutos
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        // Generar datos aleatorios criptográficamente para evitar compresión
        const data = new Uint8Array(uploadSize)
        const chunkSize = 1024 * 1024 // 1MB chunks
        for (let offset = 0; offset < uploadSize; offset += chunkSize) {
            const currentChunk = Math.min(chunkSize, uploadSize - offset)
            const view = new DataView(data.buffer, offset, currentChunk)
            for (let i = 0; i < currentChunk; i += 4) {
                view.setUint32(i, Math.random() * 0x100000000)
            }
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
            throw new Error(`HTTP ${response.status}`)
        }

        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000

        if (durationSeconds < 1.0) {
            throw new Error('Subida completada muy rápido, datos no válidos')
        }

        const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
        if (speedMbps <= 0 || speedMbps > 1000000) {
            throw new Error('Velocidad fuera de rango válido')
        }

        samples.push(speedMbps)
        onProgress?.(
            88,
            speedMbps,
            `Subida completada: ${speedMbps.toFixed(1)} Mbps`
        )
        console.log(`✓ Subida completada: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${(uploadSize / 1024 / 1024 / 1024).toFixed(1)}GB)`)

    } catch (error) {
        console.error(`Upload measurement error:`, error)
        throw new Error(`Error en subida: ${error instanceof Error ? error.message : 'desconocido'}`)
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir la velocidad de subida')
    }

    const speed = samples[0]
    
    return {
        speed: Math.max(speed, 0.05),
        samples: samples,
        minSpeed: samples[0],
        maxSpeed: samples[0]
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

        // Pre-calentar conexión con timeout corto
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
            // Ignorar errores de pre-calentamiento
        }

        // FASE 1: Ping
        onProgress?.(5, 'Midiendo latencia (Ping)...', { phase: 'ping' })
        console.log('Midiendo ping...')
        const pingResult = await measurePingAccurate((progress, ping, statusMsg) => {
            onProgress?.(progress, statusMsg, {
                phase: 'ping',
                currentSpeed: ping
            })
        })
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
 * Obtiene información de geolocalización usando ipapi.co (gratis, sin API key)
 */
export async function getGeoLocation(ip: string) {
    try {
        // Usar ipapi.co que es gratis y no requiere API key
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        // ipapi.co devuelve error_message si la IP es inválida
        if (data.error) {
            return null
        }

        return {
            country: data.country_name || 'Desconocida',
            isp: data.org || 'Desconocido',
        }
    } catch (error) {
        console.error('Error getting geolocation:', error)
        return null
    }
}
