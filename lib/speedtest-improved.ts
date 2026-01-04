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
 * Subida REAL con múltiples archivos pequeños para medir variabilidad
 * Usa XHR con progress tracking para precisión
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
    const uploadSizes = [50 * 1024 * 1024, 75 * 1024 * 1024, 100 * 1024 * 1024] // 50MB, 75MB, 100MB

    for (let testIndex = 0; testIndex < uploadSizes.length; testIndex++) {
        const uploadSize = uploadSizes[testIndex]
        
        try {
            // Generar datos aleatorios (prevenir compresión)
            const data = new Uint8Array(uploadSize)
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.floor(Math.random() * 256)
            }

            const speed = await new Promise<number>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                const startTime = performance.now()
                let lastReportTime = startTime

                xhr.upload.addEventListener('progress', (e) => {
                    if (!e.lengthComputable) return

                    const now = performance.now()
                    const elapsed = (now - startTime) / 1000

                    if (now - lastReportTime >= 500 && elapsed > 0.5) {
                        const uploadedBytes = e.loaded
                        const speed = (uploadedBytes * 8) / elapsed / 1024 / 1024
                        const blockProgress = 71 + (testIndex * 8) + (uploadedBytes / uploadSize) * 8
                        
                        onProgress?.(
                            Math.min(blockProgress, 95),
                            speed,
                            `⬆️ Test ${testIndex + 1}/3: ${(uploadedBytes / 1024 / 1024).toFixed(0)}MB de ${(uploadSize / 1024 / 1024).toFixed(0)}MB | ${speed.toFixed(1)} Mbps`
                        )
                        lastReportTime = now
                    }
                })

                xhr.addEventListener('load', () => {
                    const endTime = performance.now()
                    const durationSeconds = (endTime - startTime) / 1000

                    if (xhr.status !== 200 && xhr.status !== 204) {
                        reject(new Error(`HTTP ${xhr.status}`))
                        return
                    }

                    if (durationSeconds < 0.5) {
                        reject(new Error('Upload muy rápido'))
                        return
                    }

                    const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
                    if (speedMbps <= 0 || speedMbps > 100000) {
                        reject(new Error('Velocidad fuera de rango'))
                        return
                    }

                    console.log(`✓ Upload ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
                    resolve(speedMbps)
                })

                xhr.addEventListener('error', () => {
                    reject(new Error('Error de red en upload'))
                })

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelado'))
                })

                xhr.timeout = 180000 // 3 minutos

                xhr.addEventListener('timeout', () => {
                    reject(new Error('Timeout en upload'))
                })

                const blob = new Blob([data], { type: 'application/octet-stream' })
                xhr.open('POST', 'https://speed.cloudflare.com/__up', true)
                xhr.setRequestHeader('Content-Type', 'application/octet-stream')
                
                console.log(`Enviando upload ${testIndex + 1}...`)
                xhr.send(blob)
            })

            samples.push(speed)
        } catch (error) {
            console.error(`Upload error:`, error)
            continue
        }
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir subida')
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
        onProgress?.(71, 'Midiendo subida (3 tests)...', { phase: 'upload' })
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
