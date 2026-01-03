export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
}

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
    // En producción, usar servicios como ip-api.com o maxmind
    // Por ahora, retornamos datos genéricos
    return {
      city: 'Ciudad',
      country: 'País',
      isp: 'ISP',
    }
  } catch (error) {
    console.error('Error getting geolocation:', error)
    return null
  }
}
