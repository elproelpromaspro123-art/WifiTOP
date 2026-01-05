export const runtime = 'nodejs'

async function downloadWithRetry(size: number, maxRetries: number = 2): Promise<{ bytes: number; duration: number }> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const start = performance.now()
            const controller = new AbortController()
            // Para 500MB a 1Mbps = 500s. Usar 10x el tiempo estimado, máximo 5 minutos
            const timeout = setTimeout(() => controller.abort(), Math.min(size / 1_000_000 * 10000, 300000))

            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
                cache: 'no-store',
                signal: controller.signal
            })

            if (!response.ok) {
                clearTimeout(timeout)
                if (attempt < maxRetries) continue
                throw new Error(`HTTP ${response.status}`)
            }

            const buffer = await response.arrayBuffer()
            const duration = (performance.now() - start) / 1000

            clearTimeout(timeout)

            // Validar que se descargó correctamente
            if (buffer.byteLength >= size * 0.98) {
                return { bytes: buffer.byteLength, duration }
            }

            if (attempt < maxRetries) continue
            throw new Error(`Incomplete download: ${buffer.byteLength}/${size} bytes`)
        } catch (error) {
            if (attempt === maxRetries) throw error
        }
    }

    throw new Error('Download failed after retries')
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const bytes = searchParams.get('bytes') || '10000000'
    const size = parseInt(bytes)

    if (size < 1_000_000 || size > 500_000_000) {
        return Response.json({ error: 'Invalid size' }, { status: 400 })
    }

    try {
        const { bytes: downloadedBytes, duration } = await downloadWithRetry(size)
        const speedMbps = (downloadedBytes * 8) / duration / 1024 / 1024

        return Response.json({
            bytes: downloadedBytes,
            duration,
            speedMbps: Math.max(0.1, Math.min(speedMbps, 500))
        })
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Download failed' },
            { status: 500 }
        )
    }
}
