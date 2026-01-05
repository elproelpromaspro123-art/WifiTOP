export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const bytes = searchParams.get('bytes') || '10000000'
    const size = parseInt(bytes)

    try {
        const start = Date.now()
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            return Response.json({ error: 'Download failed' }, { status: 400 })
        }

        const buffer = await response.arrayBuffer()
        const duration = (Date.now() - start) / 1000
        const speedMbps = (buffer.byteLength * 8) / duration / 1024 / 1024

        return Response.json({
            bytes: buffer.byteLength,
            duration,
            speedMbps
        })
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
