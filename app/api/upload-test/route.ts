import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint para prueba de UPLOAD real
 * 
 * El cliente envía datos y nosotros medimos la velocidad
 * Optimizado para Render Free Tier
 */

export const config = {
    maxDuration: 300, // 5 minutos máximo para upload lento
}

export async function POST(request: NextRequest) {
    try {
        // Obtener el tamaño del body enviado
        const contentLength = request.headers.get('content-length')

        if (!contentLength) {
            return NextResponse.json(
                { error: 'Content-Length requerido' },
                { status: 400 }
            )
        }

        const bytes = parseInt(contentLength, 10)

        if (bytes === 0) {
            return NextResponse.json(
                { error: 'Datos vacíos' },
                { status: 400 }
            )
        }

        // Consumir el body (buffer la subida)
        const buffer = await request.arrayBuffer()
        const actualBytes = buffer.byteLength

        if (actualBytes === 0) {
            return NextResponse.json(
                { error: 'No se recibieron datos' },
                { status: 400 }
            )
        }

        // La respuesta incluye el tiempo que tardó (calculado en cliente)
        return NextResponse.json(
            {
                success: true,
                bytesReceived: actualBytes,
                message: 'Upload recibido correctamente'
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Upload test error:', error)
        return NextResponse.json(
            { error: 'Error procesando upload' },
            { status: 500 }
        )
    }
}
