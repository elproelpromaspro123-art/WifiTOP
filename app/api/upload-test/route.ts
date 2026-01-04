/**
 * Endpoint de prueba de upload (chunked compatible)
 * Mide la velocidad real de subida desde el navegador al servidor
 * Soporta chunks para trabajar con límites de Vercel
 */

export async function POST(request: Request) {
    try {
        const startTime = performance.now()
        
        // Consumir el buffer del request body de forma más eficiente
        const buffer = await request.arrayBuffer()
        
        const endTime = performance.now()
        const durationSeconds = Math.max((endTime - startTime) / 1000, 0.001) // Mínimo 1ms
        
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
        console.log(`[Upload Test] Recibido: ${sizeInMB}MB en ${durationSeconds.toFixed(3)}s = ${speedMbps.toFixed(2)} Mbps`)
        
        // Validar que la velocidad sea razonable (rango más amplio para uploads reales)
        if (speedMbps < 0.1 || speedMbps > 10000) {
            console.warn(`[Upload Test] Velocidad fuera de rango: ${speedMbps.toFixed(2)} Mbps`)
            return Response.json(
                { error: `Speed out of range: ${speedMbps.toFixed(2)} Mbps` },
                { status: 400 }
            )
        }
        
        return Response.json({
            success: true,
            speedMbps: parseFloat(speedMbps.toFixed(2)),
            durationSeconds: parseFloat(durationSeconds.toFixed(3)),
            bytes: buffer.byteLength
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
    } catch (error) {
        console.error('[Upload Test] Error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return Response.json(
            { error: message },
            { status: 500 }
        )
    }
}
