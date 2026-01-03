import { SpeedTestResult } from '@/types'

/**
 * Simula una prueba de velocidad realista
 * Basado en un patrón de conexión típica
 */
export async function simulateSpeedTest(): Promise<SpeedTestResult> {
  return new Promise((resolve) => {
    // Simular diferentes tipos de conexión
    const connectionTypes = [
      { min: 5, max: 20, name: '4G' },
      { min: 20, max: 100, name: 'Fibra' },
      { min: 100, max: 500, name: 'Fibra Gigabit' },
      { min: 1, max: 10, name: 'Móvil 3G' },
    ]

    const randomType = connectionTypes[Math.floor(Math.random() * connectionTypes.length)]
    
    // Simular descarga con variabilidad realista
    const downloadSpeed = Math.random() * (randomType.max - randomType.min) + randomType.min
    const uploadSpeed = Math.random() * (downloadSpeed * 0.3 - downloadSpeed * 0.1) + downloadSpeed * 0.1
    const ping = Math.random() * 50 + 5
    const jitter = Math.random() * 10 + 0.5

    // Simular que el test toma tiempo
    setTimeout(() => {
      resolve({
        downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
        uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
        ping: parseFloat(ping.toFixed(1)),
        jitter: parseFloat(jitter.toFixed(1)),
      })
    }, 5000)
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
