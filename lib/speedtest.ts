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
 * Realizar prueba de velocidad realista con múltiples mediciones
 * Detecta automáticamente cuando la velocidad se estabiliza
 * Dura entre 20-60 segundos dependiendo de la estabilidad
 */
export async function simulateSpeedTest(): Promise<DetailedSpeedTestResult> {
    return new Promise((resolve) => {
        // Simular diferentes tipos de conexión
        const connectionTypes = [
            { min: 5, max: 20, name: '4G', variance: 0.15 },
            { min: 20, max: 100, name: 'Fibra', variance: 0.10 },
            { min: 100, max: 500, name: 'Fibra Gigabit', variance: 0.08 },
            { min: 1, max: 10, name: 'Móvil 3G', variance: 0.20 },
        ]

        const randomType = connectionTypes[Math.floor(Math.random() * connectionTypes.length)]
        const baseDownload = Math.random() * (randomType.max - randomType.min) + randomType.min

        // Almacenar mediciones
        const measurements = {
            downloads: [] as number[],
            uploads: [] as number[],
            pings: [] as number[],
        }

        let isStable = false
        let measurementCount = 0
        const maxMeasurements = 12 // máximo 12 mediciones de 5 segundos cada una = 60 segundos
        const minMeasurements = 4 // mínimo 4 mediciones = 20 segundos
        const stabilityThreshold = 0.05 // 5% de variación se considera estable

        const measurementInterval = setInterval(() => {
            // Generar medición realista con variabilidad
            // Agregar tendencia realista (la conexión se estabiliza con el tiempo)
            const stabilizationFactor = Math.min(measurementCount / maxMeasurements, 1)
            const currentVariance = randomType.variance * (1 - stabilizationFactor * 0.5)

            const variance = (Math.random() - 0.5) * currentVariance
            const downloadSpeed = baseDownload * (1 + variance)
            const uploadSpeed = downloadSpeed * (Math.random() * 0.2 + 0.08)

            // Ping más realista (mejora con el tiempo)
            const basePing = 5 + Math.random() * 30 * (1 - stabilizationFactor * 0.3)
            const ping = basePing + (Math.random() - 0.5) * 10

            const jitter = Math.random() * 10 + 0.5

            measurements.downloads.push(Math.max(downloadSpeed, 0.1)) // Evitar valores negativos
            measurements.uploads.push(Math.max(uploadSpeed, 0.05))
            measurements.pings.push(Math.max(ping, 1))

            measurementCount++

            // Verificar estabilidad después de 4 mediciones (20 segundos)
            if (measurementCount >= minMeasurements) {
                const recentDownloads = measurements.downloads.slice(-3)
                const avgRecent = recentDownloads.reduce((a, b) => a + b, 0) / recentDownloads.length
                const maxRecent = Math.max(...recentDownloads)
                const minRecent = Math.min(...recentDownloads)

                // Calcular coeficiente de variación
                const calculatedVariance = avgRecent > 0 ? (maxRecent - minRecent) / avgRecent : 0

                if (calculatedVariance < stabilityThreshold) {
                    isStable = true
                }
            }

            // Terminar si es estable o si alcanzamos el máximo de mediciones
            if (isStable || measurementCount >= maxMeasurements) {
                clearInterval(measurementInterval)

                // Calcular estadísticas finales
                const avgDownload = measurements.downloads.reduce((a, b) => a + b, 0) / measurements.downloads.length
                const avgUpload = measurements.uploads.reduce((a, b) => a + b, 0) / measurements.uploads.length
                const avgPing = measurements.pings.reduce((a, b) => a + b, 0) / measurements.pings.length

                const minDownload = Math.min(...measurements.downloads)
                const maxDownload = Math.max(...measurements.downloads)
                const minUpload = Math.min(...measurements.uploads)
                const maxUpload = Math.max(...measurements.uploads)
                const minPing = Math.min(...measurements.pings)
                const maxPing = Math.max(...measurements.pings)

                // Calcular estabilidad como porcentaje
                const downloadVariance = ((maxDownload - minDownload) / avgDownload) * 100
                const stability = Math.max(0, 100 - downloadVariance)

                // Calcular jitter promedio
                const jitterValues: number[] = []
                for (let i = 1; i < measurements.pings.length; i++) {
                    jitterValues.push(Math.abs(measurements.pings[i] - measurements.pings[i - 1]))
                }
                const avgJitter = jitterValues.reduce((a, b) => a + b, 0) / jitterValues.length

                resolve({
                    downloadSpeed: parseFloat(avgDownload.toFixed(2)),
                    uploadSpeed: parseFloat(avgUpload.toFixed(2)),
                    ping: parseFloat(avgPing.toFixed(1)),
                    jitter: parseFloat(avgJitter.toFixed(1)),
                    minDownload: parseFloat(minDownload.toFixed(2)),
                    maxDownload: parseFloat(maxDownload.toFixed(2)),
                    minUpload: parseFloat(minUpload.toFixed(2)),
                    maxUpload: parseFloat(maxUpload.toFixed(2)),
                    minPing: parseFloat(minPing.toFixed(1)),
                    maxPing: parseFloat(maxPing.toFixed(1)),
                    stability: parseFloat(stability.toFixed(1)),
                })
            }
        }, 5000) // Tomar mediciones cada 5 segundos
    })
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
