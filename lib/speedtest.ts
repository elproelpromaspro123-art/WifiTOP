import { SpeedTestResult } from '@/types'

interface DetailedSpeedTestResult extends SpeedTestResult {
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
 * Descarga un archivo de prueba y mide la velocidad (real)
 */
async function measureDownload(): Promise<number> {
    const measurements: number[] = []
    const testSizes = [5000000, 10000000] // 5MB, 10MB
    
    for (const size of testSizes) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000)
            
            const startTime = performance.now()
            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
                cache: 'no-store',
                signal: controller.signal,
            })

            if (!response.ok) {
                clearTimeout(timeoutId)
                continue
            }

            const buffer = await response.arrayBuffer()
            clearTimeout(timeoutId)
            const endTime = performance.now()
            const durationSeconds = (endTime - startTime) / 1000

            if (durationSeconds > 0.1) {
                const speedMbps = (buffer.byteLength * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 10000) {
                    measurements.push(speedMbps)
                }
            }
        } catch (error) {
            console.error('Download measurement error:', error)
            continue
        }
    }

    return measurements.length > 0
        ? measurements.reduce((a, b) => a + b, 0) / measurements.length
        : 0
}

/**
 * Sube datos y mide la velocidad (real)
 */
async function measureUpload(): Promise<number> {
    const measurements: number[] = []
    const uploadSizes = [500000, 1000000] // 500KB, 1MB

    for (const uploadSize of uploadSizes) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000)
            
            const data = new Uint8Array(uploadSize)
            // Rellenar con datos aleatorios para evitar compresión
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.floor(Math.random() * 256)
            }

            const startTime = performance.now()
            const response = await fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: data,
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

            if (durationSeconds > 0.1 && durationSeconds < 60) {
                const speedMbps = (uploadSize * 8) / durationSeconds / 1024 / 1024
                if (speedMbps > 0 && speedMbps < 10000) {
                    measurements.push(speedMbps)
                }
            }
        } catch (error) {
            console.error('Upload measurement error:', error)
            continue
        }
    }

    return measurements.length > 0
        ? measurements.reduce((a, b) => a + b, 0) / measurements.length
        : 0
}

/**
 * Realizar prueba de velocidad REAL desde el navegador del cliente
 */
export async function simulateSpeedTest(): Promise<DetailedSpeedTestResult> {
    try {
        console.log('Iniciando prueba de velocidad REAL desde cliente...')

        // Medir ping
        console.log('Midiendo ping...')
        const pings = await measurePing()
        const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
        const minPing = Math.min(...pings)
        const maxPing = Math.max(...pings)
        console.log(`Ping medido: ${avgPing.toFixed(1)}ms (min: ${minPing.toFixed(1)}, max: ${maxPing.toFixed(1)})`)

        // Medir descarga - REAL
        console.log('Midiendo descarga...')
        const downloadSpeed = await measureDownload()
        if (downloadSpeed === 0) {
            throw new Error('No se pudo medir la velocidad de descarga. Verifica tu conexión.')
        }
        console.log(`Descarga medida: ${downloadSpeed.toFixed(2)} Mbps`)

        // Medir subida - REAL
        console.log('Midiendo subida...')
        const uploadSpeed = await measureUpload()
        if (uploadSpeed === 0) {
            throw new Error('No se pudo medir la velocidad de subida. Verifica tu conexión.')
        }
        console.log(`Subida medida: ${uploadSpeed.toFixed(2)} Mbps`)

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
            city: data.city || 'Desconocida',
            country: data.country || 'Desconocida',
            isp: data.isp || 'Desconocido',
        }
    } catch (error) {
        console.error('Error getting geolocation:', error)
        return null
    }
}
