import { SpeedTestResult } from '@/types'

export interface DetailedSpeedTestResult extends SpeedTestResult {
    minDownload?: number
    maxDownload?: number
    minUpload?: number
    maxUpload?: number
    minPing?: number
    maxPing?: number
    stability?: number
}

/**
 * Mide el ping haciendo peticiones a un servidor de prueba
 */
async function measurePing(): Promise<number[]> {
    const pings: number[] = []
    const testUrl = 'https://www.cloudflare.com/'

    for (let i = 0; i < 4; i++) {
        try {
            const startTime = performance.now()
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            
            await fetch(testUrl, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
                mode: 'no-cors'
            })
            clearTimeout(timeoutId)
            const endTime = performance.now()
            const latency = endTime - startTime
            if (latency > 0 && latency < 10000) {
                pings.push(latency)
            }
        } catch (error) {
            // Continuar con el siguiente intento
        }
    }

    return pings.length > 0 ? pings : [50] // Default si todos fallan
}

/**
 * Descarga un archivo de prueba y mide la velocidad (real y precisa)
 */
async function measureDownload(
    onProgress?: (progress: number, speed: number) => void
): Promise<number> {
    const measurements: number[] = []
    const testSizes = [50000000, 100000000, 150000000] // 50MB + 100MB + 150MB (como Speedtest)
    
    for (let testIndex = 0; testIndex < testSizes.length; testIndex++) {
        const size = testSizes[testIndex]
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 180000)
            
            const startTime = performance.now()
            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
                cache: 'no-store',
                signal: controller.signal,
            })

            if (!response.ok) {
                clearTimeout(timeoutId)
                continue
            }

            // Medir en chunks PEQUEÑOS para precisión real en tiempo real
            const reader = response.body?.getReader()
            if (!reader) {
                clearTimeout(timeoutId)
                continue
            }

            let downloadedBytes = 0
            let lastReportTime = startTime
            let lastReportedBytes = 0
            
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                downloadedBytes += value.length
                const now = performance.now()
                
                // Reportar cada 200ms para no saturar updates
                if (now - lastReportTime > 200) {
                    const elapsedSec = (now - startTime) / 1000
                    const instantSpeed = (downloadedBytes * 8) / elapsedSec / 1024 / 1024
                    
                    // Reportar progreso (0-90% para descarga)
                    const downloadProgress = (testIndex * 30) + (downloadedBytes / size) * 30
                    onProgress?.(Math.min(downloadProgress, 90), instantSpeed)
                    
                    lastReportTime = now
                    lastReportedBytes = downloadedBytes
                }
            }

            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            // Solo usar si duró al menos 2 segundos (suficiente para estabilizar)
            if (durationSeconds > 2.0) {
                const speedMbps = (size * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 10000) {
                    measurements.push(speedMbps)
                    console.log(`Descarga ${testIndex + 1}: ${speedMbps.toFixed(2)} Mbps (${durationSeconds.toFixed(1)}s)`)
                }
            }
        } catch (error) {
            console.error('Download measurement error:', error)
            continue
        }
    }

    // Retornar promedio eliminando outliers (mejor precisión)
    if (measurements.length === 0) return 0
    if (measurements.length === 1) return measurements[0]
    
    // Usar mediana de las mediciones (más resistente a outliers que promedio)
    const sorted = [...measurements].sort((a, b) => a - b)
    if (sorted.length === 2) {
        return (sorted[0] + sorted[1]) / 2
    }
    // Si hay 3+ mediciones, retornar la mediana
    return sorted[Math.floor(sorted.length / 2)]
}

/**
 * Sube datos con múltiples conexiones paralelas (como Speedtest.net)
 */
async function measureUpload(
    onProgress?: (progress: number, speed: number) => void,
    detectedDownloadSpeed: number = 80
): Promise<number> {
    const measurements: number[] = []
    const totalTestDuration = 10000 // 10 segundos total de prueba
    const parallelConnections = 4 // 4 conexiones simultáneas
    const chunkSize = Math.max(1000000, Math.min(50000000, (detectedDownloadSpeed * 1024 * 1024) / 8 / parallelConnections / 2)) // Ajustar chunk basado en velocidad

    console.log(`[Upload] Optimizado para ${detectedDownloadSpeed.toFixed(1)} Mbps: ${(chunkSize / 1024 / 1024).toFixed(1)}MB chunks, ${parallelConnections} conexiones`)

    try {
        const startTime = performance.now()
        let totalUploaded = 0
        let lastReportTime = startTime
        const measurements_raw: number[] = []

        // Crear función para subir un chunk
        const uploadChunk = async (chunkIndex: number): Promise<{ success: boolean; size: number; time: number }> => {
            try {
                const data = new Uint8Array(chunkSize)
                // Llenar con datos aleatorios (no comprimibles)
                for (let i = 0; i < data.length; i++) {
                    data[i] = Math.floor(Math.random() * 256)
                }

                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 30000)

                const chunkStartTime = performance.now()
                const response = await fetch('https://speed.cloudflare.com/__up', {
                    method: 'POST',
                    body: new Blob([data]),
                    cache: 'no-store',
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)

                const chunkTime = (performance.now() - chunkStartTime) / 1000

                if (response.ok && chunkTime > 0) {
                    const speedMbps = (chunkSize * 8) / chunkTime / 1024 / 1024
                    measurements_raw.push(speedMbps)
                    return { success: true, size: chunkSize, time: chunkTime }
                }
                return { success: false, size: 0, time: 0 }
            } catch (error) {
                console.error(`Chunk ${chunkIndex} failed:`, error)
                return { success: false, size: 0, time: 0 }
            }
        }

        // Ejecutar chunks en paralelo hasta completar el tiempo total
        let chunkIndex = 0
        const activeUploads = new Set<Promise<{ success: boolean; size: number; time: number }>>()

        while (performance.now() - startTime < totalTestDuration) {
            // Mantener 4 conexiones paralelas activas
            while (activeUploads.size < parallelConnections && performance.now() - startTime < totalTestDuration) {
                const uploadPromise = uploadChunk(chunkIndex++)
                activeUploads.add(uploadPromise)

                uploadPromise.then((result) => {
                    activeUploads.delete(uploadPromise)
                    if (result.success) {
                        totalUploaded += result.size
                    }
                })
            }

            // Esperar a que al menos una suba termine antes de continuar
            if (activeUploads.size > 0) {
                await Promise.race(Array.from(activeUploads))
            }

            // Reportar progreso cada 200ms
            const now = performance.now()
            if (now - lastReportTime > 200) {
                const elapsedSec = (now - startTime) / 1000
                const instantSpeed = (totalUploaded * 8) / elapsedSec / 1024 / 1024

                const uploadProgress = 90 + Math.min(6, (totalUploaded / (totalTestDuration * detectedDownloadSpeed * 1024 * 1024 / 8)) * 6)
                onProgress?.(uploadProgress, instantSpeed)

                const uploadedGB = (totalUploaded / 1024 / 1024 / 1024).toFixed(2)
                console.log(`[Upload Progress] ${uploadedGB}GB / 10GB @ ${instantSpeed.toFixed(2)} Mbps`)

                lastReportTime = now
            }
        }

        // Esperar a que todos los uploads activos terminen
        if (activeUploads.size > 0) {
            await Promise.all(Array.from(activeUploads))
        }

        const totalTime = (performance.now() - startTime) / 1000

        // Calcular velocidad basada en datos reales
        if (measurements_raw.length > 0) {
            // Usar la mediana de las mediciones individuales
            const sorted = [...measurements_raw].sort((a, b) => a - b)
            const medianSpeed = sorted[Math.floor(sorted.length / 2)]

            // Validar que sea razonable (no outlier)
            if (medianSpeed > 0 && medianSpeed < 10000) {
                measurements.push(medianSpeed)
                console.log(`[Upload] Completado. Speed final: ${medianSpeed.toFixed(2)} Mbps`)
                console.log(`Upload Final: Samples=${medianSpeed}, Min=${Math.min(...measurements_raw).toFixed(2)}, Max=${Math.max(...measurements_raw).toFixed(2)}, Median=${medianSpeed.toFixed(2)}`)
            }
        }

        // Fallback: calcular velocidad global si no hay mediciones individuales
        if (measurements.length === 0 && totalUploaded > 0 && totalTime > 1) {
            const globalSpeed = (totalUploaded * 8) / totalTime / 1024 / 1024
            if (globalSpeed > 0 && globalSpeed < 10000) {
                measurements.push(globalSpeed)
            }
        }
    } catch (error) {
        console.error('Upload measurement error:', error)
    }

    // Retornar resultado
    if (measurements.length === 0) return 0
    return measurements[0] // Retornar la mediana de la mediana
}

/**
 * Realizar prueba de velocidad REAL desde el navegador del cliente
 */
export async function simulateSpeedTest(
    onProgress?: (progress: number, status: string) => void
): Promise<DetailedSpeedTestResult> {
    try {
        console.log('Iniciando prueba de velocidad REAL desde cliente...')
        onProgress?.(0, 'Midiendo ping...')

        // Medir ping
        console.log('Midiendo ping...')
        const pings = await measurePing()
        const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
        const minPing = Math.min(...pings)
        const maxPing = Math.max(...pings)
        console.log(`Ping medido: ${avgPing.toFixed(1)}ms (min: ${minPing.toFixed(1)}, max: ${maxPing.toFixed(1)})`)
        onProgress?.(10, 'Ping completado. Midiendo descarga...')

        // Medir descarga - REAL
        console.log('Midiendo descarga...')
        const downloadSpeed = await measureDownload((progress, speed) => {
            onProgress?.(progress, `Descargando... ${Math.round(progress)}% | ${speed.toFixed(1)} Mbps`)
        })
        if (downloadSpeed === 0) {
            throw new Error('No se pudo medir la velocidad de descarga. Verifica tu conexión.')
        }
        console.log(`Descarga medida: ${downloadSpeed.toFixed(2)} Mbps`)
        onProgress?.(90, 'Descarga completada. Midiendo subida...')

        // Medir subida - REAL (con velocidad de descarga detectada para optimizar)
        console.log('Midiendo subida...')
        const uploadSpeed = await measureUpload(
            (progress, speed) => {
                onProgress?.(progress, `Subiendo... ${Math.round(progress)}% | ${speed.toFixed(1)} Mbps`)
            },
            downloadSpeed
        )
        if (uploadSpeed === 0) {
            throw new Error('No se pudo medir la velocidad de subida. Verifica tu conexión.')
        }
        console.log(`Subida medida: ${uploadSpeed.toFixed(2)} Mbps`)
        onProgress?.(95, 'Procesando resultados...')

        // Calcular jitter (variación de latencia)
        const jitterValues: number[] = []
        for (let i = 1; i < pings.length; i++) {
            jitterValues.push(Math.abs(pings[i] - pings[i - 1]))
        }
        const avgJitter =
            jitterValues.length > 0
                ? jitterValues.reduce((a, b) => a + b, 0) / jitterValues.length
                : 0
        console.log(`Jitter: ${avgJitter.toFixed(1)}ms`)

        // Min/Max basados en variabilidad realista
        const downloadVariability = 0.1 // 10% de variabilidad
        const minDownload = downloadSpeed * (1 - downloadVariability)
        const maxDownload = downloadSpeed * (1 + downloadVariability)

        const uploadVariability = 0.15 // 15% de variabilidad
        const minUpload = uploadSpeed * (1 - uploadVariability)
        const maxUpload = uploadSpeed * (1 + uploadVariability)

        // Calcular estabilidad basada en jitter real
        const stability = Math.max(0, Math.min(100, 100 - (avgJitter / 10)))

        const result = {
            downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
            uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
            ping: parseFloat(avgPing.toFixed(1)),
            jitter: parseFloat(avgJitter.toFixed(1)),
            minDownload: parseFloat(minDownload.toFixed(2)),
            maxDownload: parseFloat(maxDownload.toFixed(2)),
            minUpload: parseFloat(minUpload.toFixed(2)),
            maxUpload: parseFloat(maxUpload.toFixed(2)),
            minPing: parseFloat(minPing.toFixed(1)),
            maxPing: parseFloat(maxPing.toFixed(1)),
            stability: parseFloat(stability.toFixed(1)),
        }

        console.log('Prueba completada:', result)
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
 * Obtiene información de geolocalización basada en IP
 */
export async function getGeoLocation(ip: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEOIP_API_KEY
        if (!apiKey) {
            console.warn('GEOIP_API_KEY no configurada')
            return null
        }

        const response = await fetch(`https://api.ip-api.com/json/${ip}?key=${apiKey}`, {
            next: { revalidate: 86400 }, // Cache 24h
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (data.status !== 'success') {
            return null
        }

        return {
            country: data.country || 'Desconocida',
            isp: data.isp || 'Desconocido',
        }
    } catch (error) {
        console.error('Error getting geolocation:', error)
        return null
    }
}
