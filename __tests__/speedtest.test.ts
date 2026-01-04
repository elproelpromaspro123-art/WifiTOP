/**
 * Test consolidado para pruebas de velocidad WiFi
 * Ejecuta una única prueba grande para máxima precisión
 */

import { simulateSpeedTestImproved } from '@/lib/speedtest-improved'

describe('WiFi Speed Test - Consolidated Suite', () => {
    /**
     * Prueba única grande de velocidad
     * - Ping: 20 muestras para promedio preciso
     * - Download: 3 archivos de 100-200MB
     * - Upload: 1 archivo de 200MB (prueba consolidada para máximo rendimiento)
     */
    it('should perform accurate speed test with single large upload', async () => {
        const progressUpdates: Array<{ progress: number; speed?: number; phase: string }> = []

        const result = await simulateSpeedTestImproved((progress, status, details) => {
            progressUpdates.push({
                progress,
                speed: details?.currentSpeed,
                phase: details?.phase || 'unknown'
            })
            console.log(`[${progress}%] ${status}`)
        })

        // Verificar que tenemos resultados
        expect(result).toBeDefined()
        expect(result.downloadSpeed).toBeGreaterThan(0)
        expect(result.uploadSpeed).toBeGreaterThan(0)
        expect(result.ping).toBeGreaterThan(0)

        // Validar rangos razonables (WiFi o fibra)
        expect(result.downloadSpeed).toBeLessThan(10000) // Menos de 10Gbps
        expect(result.uploadSpeed).toBeLessThan(5000) // Menos de 5Gbps
        expect(result.ping).toBeLessThan(500) // Menos de 500ms

        // Validar que tenemos muestras
        expect(result.downloadSamples).toBeDefined()
        expect(result.uploadSamples).toBeDefined()
        expect(result.downloadSamples!.length).toBeGreaterThan(0)
        expect(result.uploadSamples!.length).toBeGreaterThan(0)

        // Validar estabilidad
        expect(result.stability).toBeGreaterThan(0)
        expect(result.stability).toBeLessThanOrEqual(100)

        // Verificar progreso
        expect(progressUpdates.length).toBeGreaterThan(0)
        expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100)

        console.log('\n═══ RESULTADOS FINALES ═══')
        console.log(`Download: ${result.downloadSpeed} Mbps (rango: ${result.minDownload} - ${result.maxDownload})`)
        console.log(`Upload: ${result.uploadSpeed} Mbps (rango: ${result.minUpload} - ${result.maxUpload})`)
        console.log(`Ping: ${result.ping}ms (rango: ${result.minPing} - ${result.maxPing})`)
        console.log(`Jitter: ${result.jitter}ms`)
        console.log(`Estabilidad: ${result.stability}%`)
    }, 600000) // Timeout de 10 minutos para la prueba completa
})

describe('Upload Speed - Optimization Verification', () => {
    /**
     * Verifica que el upload no esté limitado artificialmente
     * Con la optimización a 5MB chunks + 2 requests concurrentes,
     * esperamos velocidades mucho más altas que antes (>50 Mbps en conexiones decentes)
     */
    it('should achieve high upload speeds without bottlenecks', async () => {
        const result = await simulateSpeedTestImproved((progress, status) => {
            if (status.includes('⬆️')) {
                console.log(`${status}`)
            }
        })

        // Si el download es >50Mbps, el upload debe ser al menos 25% del download
        if (result.downloadSpeed > 50) {
            const uploadToDownloadRatio = result.uploadSpeed / result.downloadSpeed
            expect(uploadToDownloadRatio).toBeGreaterThan(0.25)
            console.log(`Upload/Download ratio: ${(uploadToDownloadRatio * 100).toFixed(1)}%`)
        }

        // El upload debe ser consistente (baja variabilidad)
        if (result.minUpload && result.maxUpload) {
            const uploadVariability = ((result.maxUpload - result.minUpload) / result.uploadSpeed) * 100
            expect(uploadVariability).toBeLessThan(50) // Menos de 50% de variabilidad
            console.log(`Upload variability: ${uploadVariability.toFixed(1)}%`)
        }
    }, 600000)
})
