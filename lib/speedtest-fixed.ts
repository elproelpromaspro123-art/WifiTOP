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
 * Mide ping de forma precisa con múltiples intentos
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
                    onProgress?.(
                        (pings.length / measurements) * 8,
                        latency,
                        `Midiendo ping... ${pings.length}/${measurements}`
                    )
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
    const maxThreshold = minPing * 1.3
    const validPings = sorted.filter(p => p <= maxThreshold)

    const finalPings = validPings.length >= 3
        ? validPings
        : sorted.slice(0, Math.max(3, Math.floor(sorted.length * 0.4)))

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
 * Descarga con duración mínima de 15 segundos para estabilidad
 */
async function measureDownloadFixed(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const samples: number[] = []

    try {
        // Detectar velocidad inicial con ping
        const pingResult = await measurePingAccurate()

        // Seleccionar tamaño - objetivo: 15+ segundos de medición
        // Asume velocidades entre 1 Mbps - 1000 Mbps
        let testSize: number
        if (pingResult.avgPing < 10) {
            testSize = 3 * 1024 * 1024 * 1024  // 3GB
        } else if (pingResult.avgPing < 20) {
            testSize = 1.5 * 1024 * 1024 * 1024  // 1.5GB
        } else if (pingResult.avgPing < 50) {
            testSize = 500 * 1024 * 1024  // 500MB
        } else {
            testSize = 250 * 1024 * 1024  // 250MB
        }

        console.log(`Descarga: Usando ${(testSize / 1024 / 1024).toFixed(0)}MB (ping: ${pingResult.avgPing.toFixed(1)}ms)`)

        const controller = new AbortController()
        const timeoutMs = 300000  // 5 minutos
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
            throw new Error('No reader')
        }

        let downloadedBytes = 0
        let lastReportTime = startTime
        let lastReportedBytes = 0
        let lastMeasuredSpeed = 0
        let stableSpeedCounter = 0
        let measurementWindow: number[] = []

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            downloadedBytes += value.length
            const now = performance.now()
            const bytesSinceReport = downloadedBytes - lastReportedBytes
            const elapsedSec = (now - startTime) / 1000

            // Reportar cada 1 segundo
            if (now - lastReportTime > 1000 && elapsedSec > 2) {
                const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                measurementWindow.push(instantSpeed)

                // Mantener ventana de últimos 5 segundos
                if (measurementWindow.length > 5) {
                    measurementWindow.shift()
                }

                // Detectar si velocidad se ha estabilizado (varía <5%)
                if (measurementWindow.length >= 3) {
                    const avgWindow = measurementWindow.reduce((a, b) => a + b) / measurementWindow.length
                    const variance = Math.max(...measurementWindow) - Math.min(...measurementWindow)
                    const varPercent = (variance / avgWindow) * 100

                    if (varPercent < 5) {
                        stableSpeedCounter++
                    } else {
                        stableSpeedCounter = 0
                    }

                    lastMeasuredSpeed = instantSpeed
                }

                // Detener si ha estado estable 15+ segundos
                if (stableSpeedCounter >= 15 && elapsedSec > 15) {
                    console.log(`✓ Descarga estabilizada en ${lastMeasuredSpeed.toFixed(2)} Mbps después de ${elapsedSec.toFixed(1)}s`)
                    reader.cancel()
                    break
                }

                const dlProgress = 8 + (downloadedBytes / testSize) * 40
                onProgress?.(
                    Math.min(dlProgress, 48),
                    instantSpeed,
                    `Descargando ${(downloadedBytes / 1024 / 1024).toFixed(0)}MB de ${(testSize / 1024 / 1024).toFixed(0)}MB | ${instantSpeed.toFixed(1)} Mbps`
                )

                lastReportTime = now
                lastReportedBytes = downloadedBytes
            }
        }

        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000

        // Validación estricta: mínimo 10 segundos
        if (durationSeconds < 10) {
            throw new Error('Descarga completada demasiado rápido (< 10s). Datos no válidos.')
        }

        const speedMbps = (testSize * 8) / durationSeconds / 1024 / 1024
        if (speedMbps <= 0 || speedMbps > 1000000) {
            throw new Error('Velocidad fuera de rango')
        }

        // Usar último 20% de mediciones para resultado final (cuando está más estable)
        const validSamples = measurementWindow.slice(Math.ceil(measurementWindow.length * 0.8))
        if (validSamples.length === 0) {
            samples.push(speedMbps)
        } else {
            const avgStable = validSamples.reduce((a, b) => a + b) / validSamples.length
            samples.push(avgStable)
        }

        console.log(`✓ Descarga: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)

    } catch (error) {
        console.error(`Error en descarga:`, error)
        throw new Error(`Error descarga: ${error instanceof Error ? error.message : 'desconocido'}`)
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir descarga')
    }

    return {
        speed: Math.max(samples[0], 0.1),
        samples: samples,
        minSpeed: samples[0],
        maxSpeed: samples[0]
    }
}

/**
 * Subida REAL con medición precisa - XMLHttpRequest con progreso real
 */
async function measureUploadFixed(
    onProgress?: (progress: number, speed: number, statusMsg: string) => void
): Promise<{
    speed: number
    samples: number[]
    minSpeed: number
    maxSpeed: number
}> {
    const uploadSize = 100 * 1024 * 1024  // 100MB

    console.log(`Subida: Usando ${(uploadSize / 1024 / 1024).toFixed(0)}MB`)

    // Generar datos aleatorios
    const data = new Uint8Array(uploadSize)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(data)
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 256)
        }
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const startTime = performance.now()
        let lastReportTime = startTime
        const measurements: number[] = []

        // Rastrear progreso real de upload
        xhr.upload.addEventListener('progress', (e) => {
            if (!e.lengthComputable) return

            const now = performance.now()
            const elapsed = (now - startTime) / 1000

            // Reportar cada 500ms después de 1 segundo
            if (now - lastReportTime >= 500 && elapsed > 1) {
                const uploadedBytes = e.loaded
                const speed = (uploadedBytes * 8) / elapsed / 1024 / 1024
                measurements.push(speed)

                const progress = 50 + (uploadedBytes / uploadSize) * 35
                onProgress?.(
                    Math.min(progress, 85),
                    speed,
                    `Subiendo ${(uploadedBytes / 1024 / 1024).toFixed(0)}MB de ${(uploadSize / 1024 / 1024).toFixed(0)}MB | ${speed.toFixed(1)} Mbps`
                )

                lastReportTime = now
                console.log(`Upload progress: ${speed.toFixed(2)} Mbps (${(uploadedBytes / 1024 / 1024).toFixed(0)}MB)`)
            }
        })

        xhr.addEventListener('loadstart', () => {
            console.log('Upload iniciado...')
        })

        xhr.addEventListener('load', () => {
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            console.log(`Upload completado en ${durationSeconds.toFixed(1)}s, status: ${xhr.status}`)

            // Validar respuesta (Cloudflare devuelve 200 o 204)
            if (xhr.status !== 200 && xhr.status !== 204) {
                console.error(`Upload error: HTTP ${xhr.status}`)
                reject(new Error(`HTTP ${xhr.status}`))
                return
            }

            // Validar duración mínima
            if (durationSeconds < 2) {
                console.error('Upload muy rápido')
                reject(new Error('Subida muy rápida (< 2s)'))
                return
            }

            // Calcular velocidad final
            const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024

            if (speedMbps <= 0 || speedMbps > 100000) {
                reject(new Error('Velocidad fuera de rango'))
                return
            }

            // Usar promedio de últimas mediciones (cuando fue más estable)
            let finalSpeed = speedMbps
            if (measurements.length > 4) {
                const lastMeasurements = measurements.slice(-4)
                finalSpeed = lastMeasurements.reduce((a, b) => a + b) / lastMeasurements.length
            }

            console.log(`✓ Subida: ${finalSpeed.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s, ${measurements.length} muestras)`)

            resolve({
                speed: Math.max(finalSpeed, 0.1),
                samples: [finalSpeed],
                minSpeed: finalSpeed,
                maxSpeed: finalSpeed
            })
        })

        xhr.addEventListener('error', () => {
            console.error('Upload network error')
            reject(new Error('Error de red en upload'))
        })

        xhr.addEventListener('abort', () => {
            console.error('Upload aborted')
            reject(new Error('Upload cancelado'))
        })

        // Timeout más realista
        xhr.timeout = 180000  // 3 minutos

        xhr.addEventListener('timeout', () => {
            console.error('Upload timeout')
            reject(new Error('Timeout en upload'))
        })

        // Enviar
        const blob = new Blob([data], { type: 'application/octet-stream' })
        xhr.open('POST', 'https://speed.cloudflare.com/__up', true)
        xhr.setRequestHeader('Content-Type', 'application/octet-stream')
        
        console.log(`Enviando ${(uploadSize / 1024 / 1024).toFixed(0)}MB...`)
        xhr.send(blob)
    })
}

/**
 * Realiza prueba completa con mediciones REALES y precisas
 */
export async function simulateSpeedTestFixed(
    onProgress?: (progress: number, status: string, details?: {
        currentSpeed?: number
        phase?: 'ping' | 'download' | 'upload'
    }) => void
): Promise<DetailedSpeedTestResult> {
    try {
        console.log('Iniciando prueba de velocidad fija...')
        onProgress?.(0, 'Iniciando prueba...', { phase: 'ping' })

        // Pre-calentar
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
        onProgress?.(8, `Ping: ${pingResult.avgPing.toFixed(1)}ms`, {
            phase: 'ping',
            currentSpeed: pingResult.avgPing
        })

        // FASE 2: Descarga
        onProgress?.(10, 'Midiendo descarga...', { phase: 'download' })
        const downloadResult = await measureDownloadFixed((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, { phase: 'download', currentSpeed: speed })
        })
        console.log(`Descarga: ${downloadResult.speed.toFixed(2)} Mbps`)
        onProgress?.(50, `Descarga: ${downloadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: downloadResult.speed
        })

        // FASE 3: Subida (REAL, no estimada)
        onProgress?.(52, 'Midiendo subida...', { phase: 'upload' })
        const uploadResult = await measureUploadFixed((progress, speed, statusMsg) => {
            onProgress?.(progress, statusMsg, { phase: 'upload', currentSpeed: speed })
        })
        console.log(`Subida: ${uploadResult.speed.toFixed(2)} Mbps`)
        onProgress?.(88, `Subida: ${uploadResult.speed.toFixed(1)} Mbps`, {
            phase: 'upload',
            currentSpeed: uploadResult.speed
        })

        // Jitter
        onProgress?.(90, 'Procesando resultados...', { phase: 'upload' })
        const jitterValues: number[] = []
        for (let i = 1; i < pingResult.pings.length; i++) {
            jitterValues.push(Math.abs(pingResult.pings[i] - pingResult.pings[i - 1]))
        }

        let avgJitter = 0
        if (jitterValues.length > 0) {
            const sorted = [...jitterValues].sort((a, b) => a - b)
            avgJitter = sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)]
        }

        // Estabilidad
        const dlVariability = 0  // Única medición
        const ulVariability = 0
        const baseStability = 100 - ((dlVariability + ulVariability) / 2 * 0.3)
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
                : 'Error al realizar la prueba de velocidad'
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
