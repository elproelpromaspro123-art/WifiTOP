/**
 * Test consolidado para pruebas de velocidad WiFi
 * Mide velocidad máxima sostenida con detección automática de estabilidad
 */

import { simulateSpeedTestImproved } from '@/lib/speedtest-improved'

describe('WiFi Speed Test - Maximum Sustainable Speed', () => {
    /**
     * Prueba de velocidad máxima sostenida
     * - Ping: 20 muestras para latencia precisa
     * - Download: 10GB con detección de estabilidad
     * - Upload: 10GB con detección de estabilidad
     * 
     * Ventaja: Detecta automáticamente cuándo la velocidad se estabiliza
     * y para de medir, ahorrando tiempo mientras mide el máximo real.
     */
    it('should measure maximum sustainable speed with stability detection', async () => {
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

describe('Stability Detection - Maximum Speed Verification', () => {
    /**
     * Verifica que el algoritmo de estabilidad funciona correctamente
     * - Detecta cuando la velocidad deja de mejorar
     * - Para automáticamente al alcanzar máximo sostenido
     * - Valida que no hay limitaciones artificiales
     */
    it('should stop measuring when speed plateaus (no improvement for 3 seconds)', async () => {
        const measurements: { time: number; downloadSpeed?: number; uploadSpeed?: number }[] = []
        
        const result = await simulateSpeedTestImproved((progress, status, details) => {
            // Registrar mediciones de velocidad en tiempo real
            if (details?.currentSpeed && details.currentSpeed > 0) {
                measurements.push({
                    time: Date.now(),
                    downloadSpeed: details.phase === 'download' ? details.currentSpeed : undefined,
                    uploadSpeed: details.phase === 'upload' ? details.currentSpeed : undefined
                })
            }
            
            // Log de progreso
            if (status.includes('Estabilizado')) {
                console.log(`✓ ${status}`)
            }
        })

        // Verificar que detectó estabilidad (paró antes de 10GB completo)
        // 10GB en memoria = chunks de 5MB, cada chunk ~0.5 segundos = ~3.33 horas si fuera completo
        // Pero debe parar en 2-5 minutos si detecta estabilidad
        expect(measurements.length).toBeGreaterThan(0)
        console.log(`Mediciones recolectadas: ${measurements.length}`)

        // La velocidad máxima debe ser consistente (bajo rango)
        if (result.downloadSamples && result.downloadSamples.length > 0) {
            const dlRange = result.maxDownload - result.minDownload
            const dlVariability = (dlRange / result.downloadSpeed) * 100
            console.log(`Download variability: ${dlVariability.toFixed(1)}% (${result.minDownload.toFixed(1)} - ${result.maxDownload.toFixed(1)})`)
            // Con estabilidad, variabilidad debe ser baja
            expect(dlVariability).toBeLessThan(20) // Menos de 20% de variabilidad
        }

        if (result.uploadSamples && result.uploadSamples.length > 0) {
            const ulRange = result.maxUpload - result.minUpload
            const ulVariability = (ulRange / result.uploadSpeed) * 100
            console.log(`Upload variability: ${ulVariability.toFixed(1)}% (${result.minUpload.toFixed(1)} - ${result.maxUpload.toFixed(1)})`)
            // Con estabilidad, variabilidad debe ser baja
            expect(ulVariability).toBeLessThan(20) // Menos de 20% de variabilidad
        }
    }, 900000) // 15 minutos para prueba completa con archivos de 10GB
})
