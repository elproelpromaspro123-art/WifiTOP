/**
 * Endpoint de prueba de upload (chunked compatible)
 * Mide la velocidad real de subida desde el navegador al servidor
 * Soporta chunks para trabajar con límites de Vercel
 */

export async function POST(request: Request) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutos max
    
    try {
        const startTime = performance.now()
        
        // Consumir el buffer del request body con timeout
        let buffer: ArrayBuffer
        try {
            buffer = await request.arrayBuffer()
        } catch (err) {
            clearTimeout(timeoutId)
            console.error('[Upload Test] Error reading buffer:', err)
            return Response.json(
                { error: 'Failed to read request body' },
                { status: 400 }
            )
        }
        
        const endTime = performance.now()
        const durationSeconds = (endTime - startTime) / 1000
        
        // Validar que se recibió algo
        if (buffer.byteLength === 0) {
            clearTimeout(timeoutId)
            return Response.json(
                { error: 'Empty payload' },
                { status: 400 }
            )
        }
        
        // Limitar el tamaño máximo a 50MB para Render free tier
        const MAX_CHUNK_SIZE = 50 * 1024 * 1024 // 50MB
        if (buffer.byteLength > MAX_CHUNK_SIZE) {
            clearTimeout(timeoutId)
            console.warn(`[Upload Test] Chunk demasiado grande: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB`)
            return Response.json(
                { error: 'Chunk too large. Maximum is 50MB' },
                { status: 413 }
            )
        }
        
        // Si la medición es menos de 100ms, la velocidad es demasiado rápida (probablemente local)
        if (durationSeconds < 0.1) {
            clearTimeout(timeoutId)
            console.warn(`[Upload Test] Upload demasiado rápido: ${durationSeconds.toFixed(3)}s`)
            return Response.json(
                { error: 'Upload too fast. Minimum duration is 100ms.' },
                { status: 400 }
            )
        }
        
        // Calcular velocidad basado en el tamaño del chunk
        const speedMbps = (buffer.byteLength * 8) / durationSeconds / 1024 / 1024
        
        const sizeInMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
        console.log(`[Upload Test] Recibido: ${sizeInMB}MB en ${durationSeconds.toFixed(3)}s = ${speedMbps.toFixed(2)} Mbps`)
        
        // Validar que la velocidad sea razonable
        if (speedMbps < 0.1 || speedMbps > 10000) {
            console.warn(`[Upload Test] Velocidad fuera de rango: ${speedMbps.toFixed(2)} Mbps`)
            clearTimeout(timeoutId)
            return Response.json(
                { error: `Speed out of range: ${speedMbps.toFixed(2)} Mbps` },
                { status: 400 }
            )
        }
        
        clearTimeout(timeoutId)
        return Response.json({
            success: true,
            speedMbps: parseFloat(speedMbps.toFixed(2)),
            durationSeconds: parseFloat(durationSeconds.toFixed(3)),
            bytes: buffer.byteLength
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Connection': 'close'
            }
        })
    } catch (error) {
        clearTimeout(timeoutId)
        console.error('[Upload Test] Error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        
        // Detectar errores específicos
        let status = 500
        if (message.includes('abort') || message.includes('timeout')) {
            status = 408 // Request Timeout
        } else if (message.includes('memory') || message.includes('MEMORY')) {
            status = 507 // Insufficient Storage
        }
        
        return Response.json(
            { error: message },
            { status }
        )
    }
}
