/**
 * Speedtest Stable - Motor de medición de velocidad
 * Usa Cloudflare Speed para máxima confiabilidad
 */

export interface SpeedTestResult {
    downloadSpeed: number
    uploadSpeed: number
    ping: number
    jitter: number
    stability?: number
    minDownload?: number
    maxDownload?: number
    minUpload?: number
    maxUpload?: number
    minPing?: number
    maxPing?: number
    downloadSamples?: number[]
    uploadSamples?: number[]
    testDuration?: number
    precision?: 'low' | 'medium' | 'high'
}

async function measurePingStable(
    onProgress?: (speed: number) => void
): Promise<{ avg: number; min: number; max: number; samples: number[] }> {
    const pings: number[] = []
    const SAMPLES = 16

    for (let i = 0; i < SAMPLES; i++) {
        try {
            const response = await fetch('/api/ping')

            if (!response.ok) {
                throw new Error(`Ping failed: ${response.status}`)
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Ping error')
            }

            const latency = data.latency

            if (latency > 0.5 && latency < 5000) {
                pings.push(latency)
                onProgress?.(latency)
            }
        } catch (error) {
            // Continuar intentando
        }
    }

    if (pings.length === 0) {
        throw new Error('No se pudo medir ping - todos los intentos fallaron')
    }

    if (pings.length < 8) {
        throw new Error(`Ping inestable: solo ${pings.length}/16 mediciones válidas`)
    }

    const sorted = [...pings].sort((a, b) => a - b)
    const trimmed = sorted.slice(2, sorted.length - 2)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const median = trimmed.length > 0
        ? trimmed[Math.floor(trimmed.length / 2)]
        : sorted[Math.floor(sorted.length / 2)]

    return { avg: median, min, max, samples: pings }
}

async function measureDownloadStable(
    onProgress?: (progress: number, speed: number) => void
): Promise<{ speed: number; samples: number[] }> {
    const samples: number[] = []
    const MIN_TEST_DURATION = 30000 // 30 segundos mínimo
    const testSizes = [50_000_000, 75_000_000, 100_000_000] // Max 100MB

    const startTime = performance.now()
    let idx = 0
    let lastReportTime = startTime

    console.log('[SPEEDTEST] Iniciando descarga con tamaños:', testSizes)

    while (performance.now() - startTime < MIN_TEST_DURATION && idx < testSizes.length) {
        const size = testSizes[idx]

        if (performance.now() - startTime > 240000) {
            console.log('[SPEEDTEST] Timeout global en descarga')
            break
        }

        try {
            console.log(`[SPEEDTEST] Descargando ${size / 1_000_000}MB...`)
            const response = await fetch(`/api/download-test?bytes=${size}`)

            if (!response.ok) {
                console.warn(`[SPEEDTEST] Error descarga: HTTP ${response.status}`)
                idx++
                continue
            }

            const data = await response.json()

            if (!data || typeof data.speedMbps !== 'number') {
                console.warn('[SPEEDTEST] Respuesta inválida descarga')
                idx++
                continue
            }

            const speedMbps = data.speedMbps
            console.log(`[SPEEDTEST] Descarga ${size / 1_000_000}MB = ${speedMbps.toFixed(2)} Mbps`)

            if (speedMbps > 0.5) {
                const elapsed = (performance.now() - startTime) / 1000
                const progress = (elapsed / 30) * 50

                if (performance.now() - lastReportTime > 300) {
                    onProgress?.(Math.min(15 + progress, 64), speedMbps)
                    lastReportTime = performance.now()
                }

                samples.push(speedMbps)
            }

            idx++
        } catch (error) {
            console.error('[SPEEDTEST] Error descarga:', error)
            idx++
            await new Promise(r => setTimeout(r, 1000)) // Esperar antes de reintentar
            continue
        }
    }

    if (samples.length === 0) {
        console.error('[SPEEDTEST] NO se pudo medir descarga')
        throw new Error('No se pudo medir descarga - todos los intentos fallaron')
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    console.log('[SPEEDTEST] Descarga finalizada:', { samples, median })
    return { speed: median, samples }
}

async function measureUploadStable(
    onProgress?: (progress: number, speed: number) => void,
    expectedDownloadSpeed?: number
): Promise<{ speed: number; samples: number[] }> {
    const samples: number[] = []
    const MIN_TEST_DURATION = 30000 // 30 segundos mínimo
    const testSizes = [25_000_000, 40_000_000, 60_000_000] // 25-60MB (más pequeño que descarga)

    const startTime = performance.now()
    let idx = 0
    let lastReportTime = startTime

    console.log('[SPEEDTEST] Iniciando subida con tamaños:', testSizes)

    while (performance.now() - startTime < MIN_TEST_DURATION && idx < testSizes.length) {
        const size = testSizes[idx]

        if (performance.now() - startTime > 240000) {
            console.log('[SPEEDTEST] Timeout global en subida')
            break
        }

        try {
            console.log(`[SPEEDTEST] Subiendo ${size / 1_000_000}MB...`)
            
            // Generar datos de forma no bloqueante
            const blob = await new Promise<Blob>((resolve) => {
                const CRYPTO_MAX = 65536
                const chunks: BlobPart[] = []
                let offset = 0

                const generateChunk = () => {
                    if (offset >= size) {
                        resolve(new Blob(chunks))
                        return
                    }

                    const chunkSize = Math.min(CRYPTO_MAX, size - offset)
                    const chunk = new Uint8Array(chunkSize)
                    crypto.getRandomValues(chunk)
                    chunks.push(chunk)
                    offset += chunkSize

                    // Yield to event loop every 1MB
                    if (offset % 1_000_000 === 0) {
                        setTimeout(generateChunk, 0)
                    } else {
                        generateChunk()
                    }
                }

                generateChunk()
            })

            const response = await fetch('/api/upload-speed', {
                method: 'POST',
                body: blob
            })

            if (!response.ok) {
                console.warn(`[SPEEDTEST] Error subida: HTTP ${response.status}`)
                idx++
                continue
            }

            const data = await response.json()

            if (!data || typeof data.speedMbps !== 'number') {
                console.warn('[SPEEDTEST] Respuesta inválida subida')
                idx++
                continue
            }

            let speedMbps = data.speedMbps

            // VALIDACIÓN INTELIGENTE: detectar outliers anómalos
            // Si descarga fue ~90Mbps y subida sale como 167Mbps, probablemente sea error de servidor
            // Usar threshold más estricto: 1.3x en lugar de 1.5x
            if (expectedDownloadSpeed && speedMbps > expectedDownloadSpeed * 1.3) {
                console.warn(
                    `[SPEEDTEST] ⚠️ Subida anómala detectada: ${speedMbps.toFixed(2)} Mbps vs descarga ${expectedDownloadSpeed.toFixed(2)} Mbps (descartando)`
                )
                idx++
                continue // Descartar medición anómala, reintentar
            }

            console.log(`[SPEEDTEST] Subida ${size / 1_000_000}MB = ${speedMbps.toFixed(2)} Mbps`)

            if (speedMbps > 0.5) {
                const elapsed = (performance.now() - startTime) / 1000
                const progress = (elapsed / 30) * 30

                if (performance.now() - lastReportTime > 300) {
                    onProgress?.(Math.min(65 + progress, 94), speedMbps)
                    lastReportTime = performance.now()
                }

                samples.push(speedMbps)
            }

            idx++
        } catch (error) {
            console.error('[SPEEDTEST] Error subida:', error)
            idx++
            await new Promise(r => setTimeout(r, 1000))
            continue
        }
    }

    if (samples.length === 0) {
        console.error('[SPEEDTEST] NO se pudo medir subida')
        throw new Error('No se pudo medir subida - todos los intentos fallaron')
    }

    if (samples.length < 2) {
        console.error('[SPEEDTEST] Subida insuficiente:', samples.length, 'muestra(s)')
        throw new Error(`Subida inestable: solo ${samples.length} medición(es) válida(s)`)
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    return { speed: median, samples }
}

export async function simulateSpeedTestStable(
    onProgress?: (progress: number, status: string, details?: any) => void
): Promise<SpeedTestResult> {
    const testStartTime = performance.now()

    console.log('[SPEEDTEST] ========== INICIANDO PRUEBA ==========')

    try {
        console.log('[SPEEDTEST] FASE 1: PING')
        onProgress?.(0, 'Iniciando prueba...', { phase: 'ping' })
        onProgress?.(3, 'Midiendo latencia...', { phase: 'ping' })

        const pingData = await measurePingStable((latency) => {
            const progress = 3 + ((latency % 10) * 0.3)
            onProgress?.(Math.min(progress, 14), `Ping: ${latency.toFixed(1)}ms`, {
                phase: 'ping',
                currentSpeed: latency
            })
        })

        console.log('[SPEEDTEST] PING completado:', pingData.avg, 'ms')

        onProgress?.(15, `Ping: ${pingData.avg.toFixed(1)}ms`, {
            phase: 'ping',
            currentSpeed: pingData.avg
        })

        console.log('[SPEEDTEST] FASE 2: DESCARGA')
        onProgress?.(15, 'Descargando...', { phase: 'download' })

        const downloadData = await measureDownloadStable((progress, speed) => {
            const progressValue = 15 + (progress * 0.5)
            onProgress?.(Math.min(progressValue, 64), `⬇️ ${speed.toFixed(1)} Mbps`, {
                phase: 'download',
                currentSpeed: speed
            })
        })

        console.log('[SPEEDTEST] DESCARGA completada:', downloadData.speed, 'Mbps')

        onProgress?.(65, `Descarga: ${downloadData.speed.toFixed(1)} Mbps`, {
            phase: 'download'
        })

        console.log('[SPEEDTEST] FASE 3: SUBIDA')
        onProgress?.(65, 'Subiendo...', { phase: 'upload' })

        const uploadData = await measureUploadStable(
            (progress, speed) => {
                const progressValue = 65 + (progress * 0.3)
                onProgress?.(Math.min(progressValue, 94), `⬆️ ${speed.toFixed(1)} Mbps`, {
                    phase: 'upload',
                    currentSpeed: speed
                })
            },
            downloadData.speed // Pasar descarga para validar outliers
        )

        console.log('[SPEEDTEST] SUBIDA completada:', uploadData.speed, 'Mbps')

        onProgress?.(95, `Subida: ${uploadData.speed.toFixed(1)} Mbps`, {
            phase: 'upload'
        })

        let avgJitter = 0
        if (pingData.samples.length > 1) {
            const jitters = pingData.samples
                .slice(1)
                .map((p, i) => Math.abs(p - pingData.samples[i]))
            avgJitter = jitters.reduce((a, b) => a + b, 0) / jitters.length
        }

        const stability = Math.max(0, Math.min(100, 100 - avgJitter * 3))
        const testDuration = (performance.now() - testStartTime) / 1000

        const result: SpeedTestResult = {
            downloadSpeed: parseFloat(downloadData.speed.toFixed(2)),
            uploadSpeed: parseFloat(uploadData.speed.toFixed(2)),
            ping: parseFloat(pingData.avg.toFixed(1)),
            minPing: parseFloat(pingData.min.toFixed(1)),
            maxPing: parseFloat(pingData.max.toFixed(1)),
            jitter: parseFloat(avgJitter.toFixed(1)),
            stability: parseFloat(stability.toFixed(1)),
            minDownload: parseFloat(Math.min(...downloadData.samples).toFixed(2)),
            maxDownload: parseFloat(Math.max(...downloadData.samples).toFixed(2)),
            minUpload: parseFloat(Math.min(...uploadData.samples).toFixed(2)),
            maxUpload: parseFloat(Math.max(...uploadData.samples).toFixed(2)),
            downloadSamples: downloadData.samples,
            uploadSamples: uploadData.samples,
            testDuration,
            precision: downloadData.samples.length >= 4 ? 'high' : 'medium'
        }

        console.log('[SPEEDTEST] ========== PRUEBA COMPLETADA ==========')
        console.log('[SPEEDTEST] RESULTADOS:', result)
        console.log('[SPEEDTEST] Duración total:', testDuration, 'segundos')

        onProgress?.(100, 'Prueba completada', { phase: 'complete' })
        return result
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('[SPEEDTEST] ❌ ERROR:', message)
        throw new Error(message)
    }
}
