/**
 * Endpoint de prueba de upload
 * Mide la velocidad real de subida desde el navegador al servidor
 * Usado como fallback si Cloudflare bloquea uploads
 */

export async function POST(request: Request) {
    try {
        const startTime = performance.now()
        
        // Consumir el buffer del request body
        const buffer = await request.arrayBuffer()
        
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000
        
        // Validar que se recibió algo
        if (buffer.byteLength === 0) {
            return Response.json(
                { error: 'Empty payload' },
                { status: 400 }
            )
        }
        
        // Calcular velocidad
        const speedMbps = (buffer.byteLength * 8) / durationSeconds / 1024 / 1024
        
        console.log(`[Upload Test] Recibido: ${(buffer.byteLength / 1024 / 1024).toFixed(0)}MB en ${durationSeconds.toFixed(2)}s = ${speedMbps.toFixed(2)} Mbps`)
        
        // Validar que la velocidad sea razonable
        if (speedMbps <= 0 || speedMbps > 100000) {
            return Response.json(
                { error: `Speed out of range: ${speedMbps.toFixed(2)} Mbps` },
                { status: 400 }
            )
        }
        
        return Response.json({
            success: true,
            speedMbps: parseFloat(speedMbps.toFixed(2)),
            durationSeconds: parseFloat(durationSeconds.toFixed(2)),
            bytes: buffer.byteLength
        })
    } catch (error) {
        console.error('[Upload Test] Error:', error)
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
