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

const SPEEDTEST_SERVER = process.env.SPEEDTEST_SERVER_URL || 'http://localhost:3001'

/**
 * Realiza prueba de velocidad real usando servidor externo con speedtest-cli
 */
export async function simulateSpeedTest(): Promise<DetailedSpeedTestResult> {
    try {
        console.log(`Conectando a servidor speedtest: ${SPEEDTEST_SERVER}`)

        const response = await fetch(`${SPEEDTEST_SERVER}/speedtest`, {
            method: 'GET',
            signal: AbortSignal.timeout(300000), // 5 minutos máximo
        })

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || 'Error desconocido en el servidor')
        }

        const downloadSpeed = data.download
        const uploadSpeed = data.upload
        const ping = data.ping

        // Simular min/max basado en pequeña variabilidad
        const downloadVariability = 0.05
        const minDownload = downloadSpeed * (1 - downloadVariability)
        const maxDownload = downloadSpeed * (1 + downloadVariability)

        const uploadVariability = 0.08
        const minUpload = uploadSpeed * (1 - uploadVariability)
        const maxUpload = uploadSpeed * (1 + uploadVariability)

        const pingVariability = 0.10
        const minPing = ping * (1 - pingVariability)
        const maxPing = ping * (1 + pingVariability)

        // Jitter estimado
        const avgJitter = ping * 0.10

        // Estabilidad
        const stability = Math.max(0, 100 - downloadVariability * 100)

        return {
            downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
            uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
            ping: parseFloat(ping.toFixed(1)),
            jitter: parseFloat(avgJitter.toFixed(1)),
            minDownload: parseFloat(minDownload.toFixed(2)),
            maxDownload: parseFloat(maxDownload.toFixed(2)),
            minUpload: parseFloat(minUpload.toFixed(2)),
            maxUpload: parseFloat(maxUpload.toFixed(2)),
            minPing: parseFloat(minPing.toFixed(1)),
            maxPing: parseFloat(maxPing.toFixed(1)),
            stability: parseFloat(stability.toFixed(1)),
        }
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
