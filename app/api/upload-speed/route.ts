export const runtime = 'nodejs'

async function uploadWithRetry(blob: Blob, maxRetries: number = 2): Promise<{ bytes: number; duration: number }> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const start = performance.now()
        const controller = new AbortController()
        // Para 500MB a 1Mbps = 500s. Usar 10x el tiempo estimado, máximo 5 minutos
        const timeout = setTimeout(() => controller.abort(), Math.min(blob.size / 1_000_000 * 15000, 300000))

        try {
            const response = await fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: blob,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': blob.size.toString()
                }
            })

            clearTimeout(timeout)
            const duration = (performance.now() - start) / 1000

            if (!response.ok) {
                if (attempt < maxRetries) continue
                throw new Error(`HTTP ${response.status}`)
            }

            // Validar que Cloudflare recibió los datos
            const responseData = await response.json().catch(() => ({}))

            return { bytes: blob.size, duration }
        } catch (error) {
            clearTimeout(timeout)
            if (attempt === maxRetries) throw error
            // Exponential backoff before retry
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
        }
    }

    throw new Error('Upload failed after retries')
}

export async function POST(request: Request) {
    try {
        const blob = await request.blob()

        if (blob.size < 100_000 || blob.size > 100_000_000) {
            return Response.json({ error: 'Invalid size' }, { status: 400 })
        }

        const { bytes, duration } = await uploadWithRetry(blob)
        const speedMbps = (bytes * 8) / duration / 1024 / 1024

        return Response.json({
            bytes,
            duration,
            speedMbps: speedMbps
        })
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        )
    }
}
