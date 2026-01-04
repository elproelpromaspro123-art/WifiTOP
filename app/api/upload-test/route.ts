/**
 * Endpoint de prueba de upload (chunked compatible)
 * Mide la velocidad real de subida desde el navegador al servidor
 * Soporta chunks para trabajar con límites de Vercel
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
        
        // Calcular velocidad basado en el tamaño del chunk
        const speedMbps = (buffer.byteLength * 8) / durationSeconds / 1024 / 1024
        
        const sizeInMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
        console.log(`[Upload Test] Recibido: ${sizeInMB}MB en ${durationSeconds.toFixed(2)}s = ${speedMbps.toFixed(2)} Mbps`)
        
        // Validar que la velocidad sea razonable (aumentar rango para chunks)
        if (speedMbps < 0.1 || speedMbps > 100000) {
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
        const message = error instanceof Error ? error.message : 'Unknown error'
        // Return 500 instead of letting unhandled errors propagate
        return Response.json(
            { error: message },
            { status: 500 }
        )
    }
}
