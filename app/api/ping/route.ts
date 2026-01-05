export const runtime = 'nodejs'

async function measureLatency(): Promise<number> {
    const samples: number[] = []

    // Intentar múltiples servidores
    const urls = [
        'https://1.1.1.1/',
        'https://speed.cloudflare.com/api/timing',
        'https://www.google.com/',
    ]

    for (const url of urls) {
        for (let i = 0; i < 2; i++) {
            const start = performance.now()
            try {
                const signal = AbortSignal.timeout(3000)
                const response = await fetch(url, {
                    method: url.includes('api/timing') ? 'GET' : 'HEAD',
                    cache: 'no-store',
                    signal
                })

                const latency = performance.now() - start
                if (latency > 0.1 && latency < 5000) {
                    samples.push(latency)
                }

                if (samples.length >= 4) break
            } catch (e) {
                // Continuar a siguiente intento
            }
        }

        if (samples.length >= 4) break
    }

    if (samples.length === 0) {
        throw new Error('No se pudo medir latencia después de múltiples intentos')
    }

    // Retornar el mínimo (latencia más baja confiable)
    return Math.min(...samples)
}

export async function GET() {
    try {
        const latency = await measureLatency()
        return Response.json({
            latency: Math.round(latency * 10) / 10,
            success: true
        })
    } catch (error) {
        return Response.json(
            {
                error: error instanceof Error ? error.message : 'Error midiendo latencia',
                success: false
            },
            { status: 500 }
        )
    }
}
